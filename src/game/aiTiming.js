import { Difficulty } from '../config.js';

export function getAIThinkDelayRange(difficulty) {
  if (difficulty === Difficulty.HARD) return { min: 3000, max: 5000 };
  if (difficulty === Difficulty.MEDIUM) return { min: 3000, max: 5000 };
  return { min: 3000, max: 5000 };
}

export function getAIThinkDelay(difficulty, random = Math.random) {
  const { min, max } = getAIThinkDelayRange(difficulty);
  return Math.round(min + (max - min) * random());
}
