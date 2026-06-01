import { Difficulty } from '../config.js';

export function getAIThinkDelayRange(difficulty) {
  if (difficulty === Difficulty.HARD) return { min: 1400, max: 2600 };
  if (difficulty === Difficulty.MEDIUM) return { min: 1100, max: 1900 };
  return { min: 850, max: 1500 };
}

export function getAIThinkDelay(difficulty, random = Math.random) {
  const { min, max } = getAIThinkDelayRange(difficulty);
  return Math.round(min + (max - min) * random());
}
