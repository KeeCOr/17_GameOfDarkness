import { describe, expect, it } from 'vitest';
import pkg from '../package.json';
import {
  getRequiredSteamArtifactNames,
  getSteamReleaseReadiness,
} from '../src/steam/releaseReadiness.js';

describe('Steam release readiness checklist', () => {
  it('derives required artifact names from the current package version', () => {
    expect(getRequiredSteamArtifactNames()).toEqual([
      `ChessSummon_v${pkg.version}.html`,
      `ChessSummon_v${pkg.version}_portable.exe`,
      `release/ChessSummon_v${pkg.version}_portable.exe`,
    ]);
  });

  it('summarizes code-ready, artifact, store, and Steamworks blockers', () => {
    const readiness = getSteamReleaseReadiness();

    expect(readiness.complete).toBe(false);
    expect(readiness.summary.total).toBeGreaterThan(10);
    expect(readiness.summary.passed).toBeGreaterThan(3);
    expect(readiness.blockers.map(item => item.id)).toEqual(expect.arrayContaining([
      'artifact_html',
      'artifact_root_portable',
      'steam_app_id',
      'store_capsules',
      'store_screenshots',
      'store_trailer',
      'artifact_portable_hash_match',
      'portable_smoke_6s',
      'manual_single_player_qa',
    ]));
    expect(readiness.checks.find(item => item.id === 'achievement_catalog')?.passed).toBe(true);
    expect(readiness.checks.find(item => item.id === 'rank_points_leaderboard')?.passed).toBe(true);
  });

  it('passes when current artifacts and external Steam submission items are supplied', () => {
    const artifacts = getRequiredSteamArtifactNames();
    const readiness = getSteamReleaseReadiness({
      artifacts,
      artifactVerification: {
        portableHashesMatch: true,
        portableSmokeSeconds: 6,
      },
      steamAppId: '123456',
      storeAssets: {
        capsules: true,
        screenshots: true,
        trailer: true,
      },
      manualQa: {
        singlePlayer: true,
        tutorial: true,
        restart: true,
        steamOverlay: true,
      },
    });

    expect(readiness.complete).toBe(true);
    expect(readiness.blockers).toEqual([]);
    expect(readiness.summary.passed).toBe(readiness.summary.total);
  });
  it('requires matching portable hashes and a 6 second smoke launch before release is complete', () => {
    const readiness = getSteamReleaseReadiness({
      artifacts: getRequiredSteamArtifactNames(),
      artifactVerification: {
        portableHashesMatch: true,
        portableSmokeSeconds: 5,
      },
      steamAppId: '123456',
      storeAssets: {
        capsules: true,
        screenshots: true,
        trailer: true,
      },
      manualQa: {
        singlePlayer: true,
        tutorial: true,
        restart: true,
        steamOverlay: true,
      },
    });

    expect(readiness.complete).toBe(false);
    expect(readiness.blockers.map(item => item.id)).toEqual(['portable_smoke_6s']);
    expect(readiness.checks.find(item => item.id === 'artifact_portable_hash_match')?.passed).toBe(true);
    expect(readiness.checks.find(item => item.id === 'portable_smoke_6s')?.passed).toBe(false);
  });
});

