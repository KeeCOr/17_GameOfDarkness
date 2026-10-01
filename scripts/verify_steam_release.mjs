import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  getRequiredSteamArtifactNames,
  getSteamReleaseReadiness,
} from '../src/steam/releaseReadiness.js';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const args = new Set(process.argv.slice(2));
const shouldSmoke = args.has('--smoke');
const smokeSeconds = Number(process.env.PORTABLE_SMOKE_SECONDS || 6);

function toProjectPath(relativePath) {
  return join(projectRoot, relativePath);
}

function sha256(filePath) {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return hash.digest('hex');
}

function stopProcessTree(pid) {
  return new Promise(resolve => {
    const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    killer.once('exit', () => resolve());
    killer.once('error', () => resolve());
  });
}

async function smokePortable(filePath, seconds) {
  if (!shouldSmoke) {
    return 0;
  }

  const startedAt = Date.now();
  const child = spawn(filePath, [], {
    cwd: projectRoot,
    detached: false,
    stdio: 'ignore',
    windowsHide: true,
  });

  return new Promise(resolve => {
    let settled = false;

    const finish = async value => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (child.pid) {
        await stopProcessTree(child.pid);
      }
      resolve(value);
    };

    const timer = setTimeout(() => {
      finish(seconds);
    }, seconds * 1000);

    child.once('exit', () => {
      const elapsed = Math.max(0, (Date.now() - startedAt) / 1000);
      finish(elapsed);
    });

    child.once('error', () => {
      finish(0);
    });
  });
}

const requiredArtifacts = getRequiredSteamArtifactNames();
const artifacts = requiredArtifacts.filter(relativePath => existsSync(toProjectPath(relativePath)));
const [, rootPortable, releasePortable] = requiredArtifacts;
const rootPortablePath = toProjectPath(rootPortable);
const releasePortablePath = toProjectPath(releasePortable);

const rootHash = existsSync(rootPortablePath) ? sha256(rootPortablePath) : '';
const releaseHash = existsSync(releasePortablePath) ? sha256(releasePortablePath) : '';
const portableSmokeSeconds = await smokePortable(rootPortablePath, smokeSeconds);

const readiness = getSteamReleaseReadiness({
  artifacts,
  artifactVerification: {
    portableHashesMatch: rootHash.length > 0 && rootHash === releaseHash,
    portableSmokeSeconds,
  },
  steamAppId: process.env.STEAM_APP_ID,
  storeAssets: {
    capsules: process.env.STORE_CAPSULES_READY === '1',
    screenshots: process.env.STORE_SCREENSHOTS_READY === '1',
    trailer: process.env.STORE_TRAILER_READY === '1',
  },
  manualQa: {
    singlePlayer: process.env.MANUAL_SINGLE_PLAYER_QA === '1',
    tutorial: process.env.MANUAL_TUTORIAL_QA === '1',
    restart: process.env.MANUAL_RESTART_QA === '1',
    steamOverlay: process.env.MANUAL_STEAM_OVERLAY_QA === '1',
  },
});

const buildBlockers = readiness.blockers.filter(item => item.area === 'Build Artifacts');

console.log(`Steam release artifact verification: ${readiness.summary.passed}/${readiness.summary.total} checks passed`);
console.log(`Root portable SHA256: ${rootHash || 'missing'}`);
console.log(`Release portable SHA256: ${releaseHash || 'missing'}`);
console.log(`Portable smoke seconds: ${portableSmokeSeconds.toFixed(1)}`);

if (readiness.blockers.length > 0) {
  console.log('Blockers:');
  for (const blocker of readiness.blockers) {
    console.log(`- [${blocker.area}] ${blocker.id}: ${blocker.label}`);
  }
}

if (buildBlockers.length > 0) {
  process.exitCode = 1;
}
