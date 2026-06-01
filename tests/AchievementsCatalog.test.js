import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENT_STATS,
  STEAM_ACHIEVEMENTS,
  getAchievementById,
} from '../src/game/achievements.js';

describe('Steam achievement catalog', () => {
  it('defines a focused first-release achievement set', () => {
    expect(STEAM_ACHIEVEMENTS).toHaveLength(12);
    expect(STEAM_ACHIEVEMENTS.every(achievement => achievement.releasePhase === 1)).toBe(true);
  });

  it('uses stable Steam API names and unique ids', () => {
    const ids = new Set(STEAM_ACHIEVEMENTS.map(achievement => achievement.id));
    const apiNames = new Set(STEAM_ACHIEVEMENTS.map(achievement => achievement.apiName));

    expect(ids.size).toBe(STEAM_ACHIEVEMENTS.length);
    expect(apiNames.size).toBe(STEAM_ACHIEVEMENTS.length);
    expect([...apiNames].every(name => /^ACH_[A-Z0-9_]+$/.test(name))).toBe(true);
  });

  it('prioritizes single-player and tutorial goals for the first Steam release', () => {
    expect(STEAM_ACHIEVEMENTS.every(achievement => achievement.scope !== 'online')).toBe(true);
    expect(getAchievementById('tutorial_complete').trigger).toContain('tutorial');
    expect(getAchievementById('hard_win').trigger).toContain('HARD');
  });

  it('defines the stats needed for achievement and leaderboard progression', () => {
    expect(ACHIEVEMENT_STATS.map(stat => stat.apiName)).toEqual([
      'STAT_GAMES_PLAYED',
      'STAT_GAMES_WON',
      'STAT_HARD_WINS',
      'STAT_WIN_STREAK',
      'STAT_FASTEST_WIN_SECONDS',
      'STAT_SUMMONS_TOTAL',
      'STAT_CAPTURES_TOTAL',
      'STAT_PROMOTIONS_TOTAL',
      'STAT_CHECKS_GIVEN',
    ]);
    expect(ACHIEVEMENT_STATS.every(stat => stat.type === 'INT')).toBe(true);
  });
});
