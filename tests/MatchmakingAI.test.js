import { describe, expect, it } from 'vitest';
import { Difficulty } from '../src/config.js';
import {
  AI_MATCH_TIMEOUT_MS,
  getAIMatchDifficulty,
  shouldFallbackToAI,
} from '../src/game/matchmaking.js';

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
});
