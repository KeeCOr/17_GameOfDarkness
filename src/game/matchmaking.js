import { Difficulty } from '../config.js';

export const AI_MATCH_TIMEOUT_MS = 10000;

export function shouldFallbackToAI(waitedMs, timeoutMs = AI_MATCH_TIMEOUT_MS) {
  return Number(waitedMs) >= timeoutMs;
}

export function getAIMatchDifficulty(rankPoints = 1000) {
  const points = Number(rankPoints) || 1000;
  if (points < 950) return Difficulty.EASY;
  if (points >= 1150) return Difficulty.HARD;
  return Difficulty.MEDIUM;
}
