import { describe, expect, it } from 'vitest';
import { Owner, PieceType } from '../src/config.js';
import { createSteamService } from '../src/services/SteamService.js';

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe('SteamService', () => {
  it('discovers the Electron preload Steam bridge by default', () => {
    const originalWindow = globalThis.window;
    const calls = [];
    globalThis.window = {
      chessSummonSteam: {
        isReady: () => true,
        setAchievement: apiName => calls.push(['achievement', apiName]),
        setStat: (apiName, value) => calls.push(['stat', apiName, value]),
        storeStats: () => calls.push(['store']),
      },
    };

    try {
      const service = createSteamService({ storage: createMemoryStorage() });
      service.recordSummon(PieceType.PAWN);

      expect(service.isSteamAvailable()).toBe(true);
      expect(calls).toContainEqual(['achievement', 'ACH_FIRST_SUMMON']);
      expect(calls).toContainEqual(['stat', 'STAT_SUMMONS_TOTAL', 1]);
    } finally {
      globalThis.window = originalWindow;
    }
  });

  it('falls back to local achievement progress when Steam is unavailable', () => {
    const service = createSteamService({ storage: createMemoryStorage() });

    service.recordSummon(PieceType.PAWN);

    expect(service.isSteamAvailable()).toBe(false);
    expect(service.isUnlocked('first_summon')).toBe(true);
    expect(service.getStat('STAT_SUMMONS_TOTAL')).toBe(1);
  });

  it('mirrors local achievement unlocks and stats to a Steam client adapter', () => {
    const calls = [];
    const steamClient = {
      isReady: () => true,
      setAchievement: apiName => calls.push(['achievement', apiName]),
      setStat: (apiName, value) => calls.push(['stat', apiName, value]),
      storeStats: () => calls.push(['store']),
    };
    const service = createSteamService({ storage: createMemoryStorage(), steamClient });

    service.recordSummon(PieceType.PAWN);

    expect(service.isUnlocked('first_summon')).toBe(true);
    expect(calls).toContainEqual(['achievement', 'ACH_FIRST_SUMMON']);
    expect(calls).toContainEqual(['stat', 'STAT_SUMMONS_TOTAL', 1]);
    expect(calls).toContainEqual(['store']);
  });

  it('uploads rank points to the Steam leaderboard adapter when available', () => {
    const uploads = [];
    const steamClient = {
      isReady: () => true,
      uploadLeaderboardScore: (leaderboardName, score) => {
        uploads.push({ leaderboardName, score });
        return { ok: true };
      },
    };
    const service = createSteamService({ storage: createMemoryStorage(), steamClient });

    const result = service.uploadRankPoints(1234);

    expect(result).toEqual({ ok: true });
    expect(uploads).toEqual([{ leaderboardName: 'RANK_POINTS', score: 1234 }]);
  });

  it('downloads rank leaderboard entries through the Steam adapter when available', () => {
    const downloads = [];
    const steamClient = {
      isReady: () => true,
      downloadLeaderboardEntries: (leaderboardName, limit) => {
        downloads.push({ leaderboardName, limit });
        return { ok: true, entries: [{ rank: 1, name: 'Alice', score: 1234 }] };
      },
    };
    const service = createSteamService({ storage: createMemoryStorage(), steamClient });

    const result = service.downloadRankLeaderboard(3);

    expect(result).toEqual({ ok: true, entries: [{ rank: 1, name: 'Alice', score: 1234 }] });
    expect(downloads).toEqual([{ leaderboardName: 'RANK_POINTS', limit: 3 }]);
  });

  it('does not unlock player-only achievements from AI-side events', () => {
    const service = createSteamService({ storage: createMemoryStorage() });

    service.recordPromotion(Owner.AI);

    expect(service.isUnlocked('first_promotion')).toBe(false);
    expect(service.getStat('STAT_PROMOTIONS_TOTAL')).toBe(0);
  });
});
