import { describe, expect, it } from 'vitest';
import { Difficulty, Owner, PieceType } from '../src/config.js';
import { AchievementProgress } from '../src/game/achievementProgress.js';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe('achievement progress', () => {
  it('unlocks tutorial and first action achievements while updating stats', () => {
    const progress = new AchievementProgress({ storage: createMemoryStorage() });

    progress.recordTutorialComplete();
    progress.recordSummon(PieceType.KNIGHT);
    progress.recordCapture();
    progress.recordCheck();
    progress.recordPromotion(Owner.PLAYER);

    expect(progress.isUnlocked('tutorial_complete')).toBe(true);
    expect(progress.isUnlocked('first_summon')).toBe(true);
    expect(progress.isUnlocked('first_capture')).toBe(true);
    expect(progress.isUnlocked('first_check')).toBe(true);
    expect(progress.isUnlocked('first_promotion')).toBe(true);
    expect(progress.getStat('STAT_SUMMONS_TOTAL')).toBe(1);
    expect(progress.getStat('STAT_CAPTURES_TOTAL')).toBe(1);
    expect(progress.getStat('STAT_CHECKS_GIVEN')).toBe(1);
    expect(progress.getStat('STAT_PROMOTIONS_TOTAL')).toBe(1);
  });

  it('unlocks the all-piece summon achievement inside a single match', () => {
    const progress = new AchievementProgress({ storage: createMemoryStorage() });

    progress.recordSummon(PieceType.KNIGHT);
    progress.recordSummon(PieceType.BISHOP);
    progress.recordSummon(PieceType.ROOK);
    progress.recordSummon(PieceType.QUEEN);

    expect(progress.isUnlocked('summon_all_piece_types')).toBe(true);
  });

  it('records win difficulty, fast win, and streak achievements', () => {
    const progress = new AchievementProgress({ storage: createMemoryStorage() });

    progress.recordGameOver({ winner: Owner.PLAYER, difficulty: Difficulty.HARD, timeRemaining: 72 });
    progress.startMatch();
    progress.recordGameOver({ winner: Owner.PLAYER, difficulty: Difficulty.EASY, timeRemaining: 0 });
    progress.startMatch();
    progress.recordGameOver({ winner: Owner.PLAYER, difficulty: Difficulty.MEDIUM, timeRemaining: 10 });

    expect(progress.isUnlocked('first_win')).toBe(true);
    expect(progress.isUnlocked('hard_win')).toBe(true);
    expect(progress.isUnlocked('easy_win')).toBe(true);
    expect(progress.isUnlocked('medium_win')).toBe(true);
    expect(progress.isUnlocked('fast_win')).toBe(true);
    expect(progress.isUnlocked('win_streak_3')).toBe(true);
    expect(progress.getStat('STAT_GAMES_PLAYED')).toBe(3);
    expect(progress.getStat('STAT_GAMES_WON')).toBe(3);
    expect(progress.getStat('STAT_HARD_WINS')).toBe(1);
    expect(progress.getStat('STAT_WIN_STREAK')).toBe(3);
  });

  it('persists unlocked achievements and stats in local storage', () => {
    const storage = createMemoryStorage();
    const progress = new AchievementProgress({ storage });
    progress.recordSummon(PieceType.PAWN);

    const restored = new AchievementProgress({ storage });

    expect(restored.isUnlocked('first_summon')).toBe(true);
    expect(restored.getStat('STAT_SUMMONS_TOTAL')).toBe(1);
  });
});
