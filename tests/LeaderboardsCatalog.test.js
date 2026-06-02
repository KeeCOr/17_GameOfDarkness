import { describe, expect, it } from 'vitest';
import { getLeaderboardById, STEAM_LEADERBOARDS } from '../src/game/leaderboards.js';

describe('Steam leaderboard catalog', () => {
  it('defines the rank points leaderboard for the first Steam release', () => {
    expect(STEAM_LEADERBOARDS).toHaveLength(1);
    expect(getLeaderboardById('rank_points')).toMatchObject({
      id: 'rank_points',
      apiName: 'RANK_POINTS',
      displayName: 'Rank Points',
      sortMethod: 'descending',
      displayType: 'numeric',
      uploadPolicy: 'keep_best',
      scoreSource: 'account.rankPoints',
    });
  });

  it('uses stable Steam leaderboard API names', () => {
    expect(STEAM_LEADERBOARDS.every(board => /^[A-Z0-9_]+$/.test(board.apiName))).toBe(true);
    expect(new Set(STEAM_LEADERBOARDS.map(board => board.apiName)).size).toBe(STEAM_LEADERBOARDS.length);
  });
});
