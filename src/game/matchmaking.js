import { Difficulty } from '../config.js';

export const AI_MATCH_TIMEOUT_MS = 10000;
export const AI_DAILY_MATCH_STORAGE_KEY = 'chesssummon.dailyAIMatches';
export const FIRST_DAILY_AI_MATCH_MODIFIER = -120;
export const LATER_DAILY_AI_MATCH_MODIFIER = 180;

export function shouldFallbackToAI(waitedMs, timeoutMs = AI_MATCH_TIMEOUT_MS) {
  return Number(waitedMs) >= timeoutMs;
}

export function getMatchmakingDateKey(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function reserveDailyAIMatchRankPoints({
  rankPoints = 1000,
  storage = globalThis.localStorage,
  now = new Date(),
} = {}) {
  const baseRankPoints = Number(rankPoints) || 1000;
  const date = getMatchmakingDateKey(now);
  let count = 0;

  try {
    const saved = JSON.parse(storage?.getItem?.(AI_DAILY_MATCH_STORAGE_KEY) || 'null');
    if (saved?.date === date) count = Number(saved.count) || 0;
  } catch {
    count = 0;
  }

  const matchNumber = count + 1;
  const modifier = matchNumber === 1 ? FIRST_DAILY_AI_MATCH_MODIFIER : LATER_DAILY_AI_MATCH_MODIFIER;
  const adjustedRankPoints = Math.max(0, baseRankPoints + modifier);

  try {
    storage?.setItem?.(AI_DAILY_MATCH_STORAGE_KEY, JSON.stringify({ date, count: matchNumber }));
  } catch {
    // Storage can be unavailable in hardened desktop contexts; matching should still continue.
  }

  return {
    rankPoints: adjustedRankPoints,
    baseRankPoints,
    matchNumber,
    modifier,
    date,
  };
}

export function getAIMatchDifficulty(rankPoints = 1000) {
  const points = Number(rankPoints) || 1000;
  if (points < 950) return Difficulty.EASY;
  if (points >= 1500) return Difficulty.VERY_HARD;
  if (points >= 1150) return Difficulty.HARD;
  return Difficulty.MEDIUM;
}
