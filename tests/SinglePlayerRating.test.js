import { describe, expect, it } from 'vitest';
import { Owner } from '../src/config.js';

function makeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: key => data[key] ?? null,
    setItem: (key, value) => { data[key] = String(value); },
    data,
  };
}

describe('single player rating', () => {
  it('raises single-player MMR after a win but caps first-release progress', async () => {
    const { updateSinglePlayerRating, SINGLE_PLAYER_MMR_CAP } = await import('../src/game/singlePlayerRating.js');
    const storage = makeStorage({ 'chesssummon.singleMmr': String(SINGLE_PLAYER_MMR_CAP - 6) });

    const result = updateSinglePlayerRating({ winner: Owner.PLAYER, storage });

    expect(result).toEqual({
      previous: SINGLE_PLAYER_MMR_CAP - 6,
      current: SINGLE_PLAYER_MMR_CAP,
      delta: 6,
      capped: true,
    });
    expect(storage.data['chesssummon.singleMmr']).toBe(String(SINGLE_PLAYER_MMR_CAP));
  });

  it('drops single-player MMR after a loss', async () => {
    const { updateSinglePlayerRating } = await import('../src/game/singlePlayerRating.js');
    const storage = makeStorage({ 'chesssummon.singleMmr': '1000' });

    const result = updateSinglePlayerRating({ winner: Owner.AI, storage });

    expect(result).toMatchObject({
      previous: 1000,
      current: 990,
      delta: -10,
      capped: false,
    });
    expect(storage.data['chesssummon.singleMmr']).toBe('990');
  });

  it('does not change single-player MMR for PvP results', async () => {
    const { updateSinglePlayerRating } = await import('../src/game/singlePlayerRating.js');
    const storage = makeStorage({ 'chesssummon.singleMmr': '1000' });

    const result = updateSinglePlayerRating({ winner: Owner.PLAYER, multiplayerMode: 'pvp', storage });

    expect(result).toEqual({ previous: 1000, current: 1000, delta: 0, capped: false, skipped: true });
    expect(storage.data['chesssummon.singleMmr']).toBe('1000');
  });
});
