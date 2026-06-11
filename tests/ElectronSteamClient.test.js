import { describe, expect, it } from 'vitest';
import { createSteamClient, resolveSteamAppId } from '../electron/steamClient.cjs';

describe('Electron Steam client adapter', () => {
  it('stays unavailable when no Steam App ID or SDK loader is provided', () => {
    const client = createSteamClient({ env: {} });

    expect(client.isReady()).toBe(false);
    expect(client.setAchievement('ACH_FIRST_WIN')).toEqual({ ok: false, reason: 'steam-unavailable' });
  });

  it('resolves Steam App ID from environment first', () => {
    expect(resolveSteamAppId({ STEAM_APP_ID: '123456' })).toBe(123456);
    expect(resolveSteamAppId({ STEAM_APP_ID: 'abc' })).toBe(null);
  });

  it('delegates achievements, stats, storage, and leaderboard calls to the loaded SDK adapter', () => {
    const calls = [];
    const sdk = {
      setAchievement: apiName => calls.push(['achievement', apiName]),
      setStat: (apiName, value) => calls.push(['stat', apiName, value]),
      storeStats: () => calls.push(['store']),
      uploadLeaderboardScore: (leaderboardName, score) => {
        calls.push(['leaderboard', leaderboardName, score]);
        return { ok: true };
      },
      downloadLeaderboardEntries: (leaderboardName, limit) => {
        calls.push(['leaderboard-download', leaderboardName, limit]);
        return { ok: true, entries: [] };
      },
    };

    const client = createSteamClient({
      env: { STEAM_APP_ID: '123456' },
      loadSteamworks: appId => {
        calls.push(['load', appId]);
        return sdk;
      },
    });

    expect(client.isReady()).toBe(true);
    expect(client.setAchievement('ACH_FIRST_WIN')).toEqual({ ok: true });
    expect(client.setStat('STAT_GAMES_WON', 2)).toEqual({ ok: true });
    expect(client.storeStats()).toEqual({ ok: true });
    expect(client.uploadLeaderboardScore('RANK_POINTS', 1200)).toEqual({ ok: true });
    expect(client.downloadLeaderboardEntries('RANK_POINTS', 5)).toEqual({ ok: true, entries: [] });
    expect(calls).toEqual([
      ['load', 123456],
      ['achievement', 'ACH_FIRST_WIN'],
      ['stat', 'STAT_GAMES_WON', 2],
      ['store'],
      ['leaderboard', 'RANK_POINTS', 1200],
      ['leaderboard-download', 'RANK_POINTS', 5],
    ]);
  });
});
