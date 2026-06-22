import { RELEASE_VERSION } from '../releaseInfo.js';
import { STEAM_ACHIEVEMENTS, ACHIEVEMENT_STATS } from '../game/achievements.js';
import { STEAM_LEADERBOARDS } from '../game/leaderboards.js';

const REQUIRED_MANUAL_QA = Object.freeze([
  ['manual_single_player_qa', 'manualQa.singlePlayer', 'Single-player flow QA passed'],
  ['manual_tutorial_qa', 'manualQa.tutorial', 'Tutorial flow QA passed'],
  ['manual_restart_qa', 'manualQa.restart', 'Restart/replay QA passed'],
  ['manual_steam_overlay_qa', 'manualQa.steamOverlay', 'Steam overlay launches in client'],
]);

export function getRequiredSteamArtifactNames(version = RELEASE_VERSION) {
  return [
    `ChessSummon_v${version}.html`,
    `ChessSummon_v${version}_portable.exe`,
    `release/ChessSummon_v${version}_portable.exe`,
  ];
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

function getPathValue(source, path) {
  return path.split('.').reduce((value, key) => value?.[key], source);
}

function makeCheck({ id, area, label, passed, owner = 'code' }) {
  return Object.freeze({
    id,
    area,
    label,
    owner,
    passed: Boolean(passed),
  });
}

export function getSteamReleaseReadiness(options = {}) {
  const artifactSet = new Set(options.artifacts || []);
  const requiredArtifacts = getRequiredSteamArtifactNames(options.version || RELEASE_VERSION);
  const [htmlArtifact, rootPortable, releasePortable] = requiredArtifacts;
  const hasRankLeaderboard = STEAM_LEADERBOARDS.some(board => board.apiName === 'RANK_POINTS');

  const checks = [
    makeCheck({
      id: 'release_version',
      area: 'Build Metadata',
      label: `Release version is ${options.version || RELEASE_VERSION}`,
      passed: hasValue(options.version || RELEASE_VERSION),
    }),
    makeCheck({
      id: 'achievement_catalog',
      area: 'Steam Stats',
      label: 'At least 10 first-release achievements are defined',
      passed: STEAM_ACHIEVEMENTS.filter(achievement => achievement.releasePhase === 1).length >= 10,
    }),
    makeCheck({
      id: 'achievement_stats',
      area: 'Steam Stats',
      label: 'Achievement stat catalog is defined',
      passed: ACHIEVEMENT_STATS.length >= 5,
    }),
    makeCheck({
      id: 'rank_points_leaderboard',
      area: 'Steam Leaderboard',
      label: 'RANK_POINTS leaderboard is defined',
      passed: hasRankLeaderboard,
    }),
    makeCheck({
      id: 'artifact_html',
      area: 'Build Artifacts',
      label: `${htmlArtifact} exists`,
      passed: artifactSet.has(htmlArtifact),
    }),
    makeCheck({
      id: 'artifact_root_portable',
      area: 'Build Artifacts',
      label: `${rootPortable} exists at repository root`,
      passed: artifactSet.has(rootPortable),
    }),
    makeCheck({
      id: 'artifact_release_portable',
      area: 'Build Artifacts',
      label: `${releasePortable} exists in release folder`,
      passed: artifactSet.has(releasePortable),
    }),
    makeCheck({
      id: 'artifact_portable_hash_match',
      area: 'Build Artifacts',
      label: 'Root and release portable SHA256 hashes match',
      owner: 'build',
      passed: options.artifactVerification?.portableHashesMatch === true,
    }),
    makeCheck({
      id: 'portable_smoke_6s',
      area: 'Build Artifacts',
      label: 'Portable executable stays open for at least 6 seconds in smoke QA',
      owner: 'build',
      passed: Number(options.artifactVerification?.portableSmokeSeconds || 0) >= 6,
    }),
    makeCheck({
      id: 'steam_app_id',
      area: 'Steamworks',
      label: 'Steam App ID is assigned for test builds',
      owner: 'steamworks',
      passed: hasValue(options.steamAppId),
    }),
    makeCheck({
      id: 'store_capsules',
      area: 'Store Page',
      label: 'Store capsule image set is prepared',
      owner: 'store',
      passed: options.storeAssets?.capsules === true,
    }),
    makeCheck({
      id: 'store_screenshots',
      area: 'Store Page',
      label: 'Store screenshots are prepared',
      owner: 'store',
      passed: options.storeAssets?.screenshots === true,
    }),
    makeCheck({
      id: 'store_trailer',
      area: 'Store Page',
      label: 'Store trailer or short gameplay video is prepared',
      owner: 'store',
      passed: options.storeAssets?.trailer === true,
    }),
    ...REQUIRED_MANUAL_QA.map(([id, path, label]) => makeCheck({
      id,
      area: 'Manual QA',
      label,
      owner: 'qa',
      passed: getPathValue(options, path) === true,
    })),
  ];

  const blockers = checks.filter(check => !check.passed);
  return Object.freeze({
    version: options.version || RELEASE_VERSION,
    requiredArtifacts,
    checks: Object.freeze(checks),
    blockers: Object.freeze(blockers),
    complete: blockers.length === 0,
    summary: Object.freeze({
      total: checks.length,
      passed: checks.length - blockers.length,
      blocked: blockers.length,
    }),
  });
}

