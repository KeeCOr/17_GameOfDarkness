import { describe, expect, it } from 'vitest';
import { Difficulty } from '../src/config.js';
import {
  AI_MATCH_TIMEOUT_MS,
  reserveDailyAIMatchRankPoints,
  getAIMatchDifficulty,
  shouldFallbackToAI,
} from '../src/game/matchmaking.js';

function makeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: key => data[key] ?? null,
    setItem: (key, value) => { data[key] = String(value); },
    data,
  };
}

describe('AI matchmaking fallback', () => {
  it('falls back to an AI match after the matchmaking timeout', () => {
    expect(shouldFallbackToAI(AI_MATCH_TIMEOUT_MS - 1)).toBe(false);
    expect(shouldFallbackToAI(AI_MATCH_TIMEOUT_MS)).toBe(true);
  });

  it('matches fallback AI difficulty to player rank points', () => {
    expect(getAIMatchDifficulty(899)).toBe(Difficulty.EASY);
    expect(getAIMatchDifficulty(1000)).toBe(Difficulty.MEDIUM);
    expect(getAIMatchDifficulty(1200)).toBe(Difficulty.HARD);
    expect(getAIMatchDifficulty(1500)).toBe(Difficulty.VERY_HARD);
  });

  it('makes the first AI fallback match of the day slightly easier and later matches harder', () => {
    const storage = makeStorage();
    const now = new Date('2026-06-18T03:00:00.000Z');

    const first = reserveDailyAIMatchRankPoints({ rankPoints: 1000, storage, now });
    const second = reserveDailyAIMatchRankPoints({ rankPoints: 1000, storage, now });

    expect(first).toMatchObject({ rankPoints: 880, matchNumber: 1, modifier: -120 });
    expect(second).toMatchObject({ rankPoints: 1180, matchNumber: 2, modifier: 180 });
    expect(getAIMatchDifficulty(first.rankPoints)).toBe(Difficulty.EASY);
    expect(getAIMatchDifficulty(second.rankPoints)).toBe(Difficulty.HARD);
  });
});
