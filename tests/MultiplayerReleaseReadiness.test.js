import { describe, expect, it } from 'vitest';
import {
  getMMRStorageAssessment,
  getMultiplayerReleaseAssessment,
  MULTIPLAYER_RELEASE_MODES,
} from '../src/multiplayer/releaseReadiness.js';

describe('multiplayer and MMR release readiness', () => {
  it('treats AI fallback matchmaking as feasible for a first Steam release', () => {
    const assessment = getMultiplayerReleaseAssessment({
      target: MULTIPLAYER_RELEASE_MODES.AI_FALLBACK,
    });

    expect(assessment.complete).toBe(true);
    expect(assessment.blockers).toEqual([]);
    expect(assessment.checks.map(check => check.id)).toEqual(expect.arrayContaining([
      'local_queue_matching',
      'rank_json_store',
      'ai_fallback_match',
      'steam_rank_upload_adapter',
    ]));
  });

  it('keeps public ranked human PvP blocked until authoritative sync exists', () => {
    const assessment = getMultiplayerReleaseAssessment({
      target: MULTIPLAYER_RELEASE_MODES.PUBLIC_PVP,
    });

    expect(assessment.complete).toBe(false);
    expect(assessment.blockers.map(check => check.id)).toEqual(expect.arrayContaining([
      'steam_identity_mapping',
      'server_authoritative_board',
      'placement_and_command_sync',
      'clock_sync_reconnect',
      'server_verified_results',
    ]));
  });

  it('separates local MMR persistence from official ranked MMR readiness', () => {
    const assessment = getMMRStorageAssessment();

    expect(assessment.localStorageReady).toBe(true);
    expect(assessment.steamAdapterReady).toBe(true);
    expect(assessment.officialRankedReady).toBe(false);
    expect(assessment.blockers.map(level => level.id)).toContain('official_ranked_mmr');
  });
});
