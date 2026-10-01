import { Owner } from '../config.js';

export const SINGLE_PLAYER_MMR_STORAGE_KEY = 'chesssummon.singleMmr';
export const SINGLE_PLAYER_MMR_DEFAULT = 1000;
export const SINGLE_PLAYER_MMR_CAP = 1200;
export const SINGLE_PLAYER_MMR_FLOOR = 800;
export const SINGLE_PLAYER_MMR_WIN_DELTA = 12;
export const SINGLE_PLAYER_MMR_LOSS_DELTA = -10;

export function readSinglePlayerRating(storage = globalThis.localStorage) {
  const raw = storage?.getItem?.(SINGLE_PLAYER_MMR_STORAGE_KEY);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return SINGLE_PLAYER_MMR_DEFAULT;
  return Math.max(SINGLE_PLAYER_MMR_FLOOR, Math.min(SINGLE_PLAYER_MMR_CAP, Math.round(parsed)));
}

export function updateSinglePlayerRating({ winner, multiplayerMode = null, storage = globalThis.localStorage } = {}) {
  const previous = readSinglePlayerRating(storage);
  if (multiplayerMode === 'pvp') {
    return { previous, current: previous, delta: 0, capped: false, skipped: true };
  }

  const rawDelta = winner === Owner.PLAYER ? SINGLE_PLAYER_MMR_WIN_DELTA : SINGLE_PLAYER_MMR_LOSS_DELTA;
  const current = Math.max(SINGLE_PLAYER_MMR_FLOOR, Math.min(SINGLE_PLAYER_MMR_CAP, previous + rawDelta));
  const delta = current - previous;
  storage?.setItem?.(SINGLE_PLAYER_MMR_STORAGE_KEY, String(current));
  return {
    previous,
    current,
    delta,
    capped: winner === Owner.PLAYER && current === SINGLE_PLAYER_MMR_CAP && delta !== rawDelta,
  };
}
