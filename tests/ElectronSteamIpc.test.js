import { describe, expect, it } from 'vitest';
import { registerSteamIpcHandlers } from '../electron/steamIpc.cjs';

describe('Electron Steam IPC handlers', () => {
  it('registers safe fallback handlers when no Steam client is installed', async () => {
    const handlers = new Map();
    const ipcMain = { handle: (channel, handler) => handlers.set(channel, handler) };

    registerSteamIpcHandlers(ipcMain);

    expect(await handlers.get('steam:is-ready')()).toBe(false);
    expect(await handlers.get('steam:set-achievement')(null, { apiName: 'ACH_FIRST_WIN' })).toEqual({
      ok: false,
      reason: 'steam-unavailable',
    });
    expect(await handlers.get('steam:upload-leaderboard-score')(null, { leaderboardName: 'RANK_POINTS', score: 1000 })).toEqual({
      ok: false,
      reason: 'steam-unavailable',
    });
    expect(await handlers.get('steam:download-leaderboard-entries')(null, { leaderboardName: 'RANK_POINTS', limit: 5 })).toEqual({
      ok: false,
      reason: 'steam-unavailable',
      entries: [],
    });
  });

  it('delegates Steam calls to the injected client adapter', async () => {
    const calls = [];
    const handlers = new Map();
    const ipcMain = { handle: (channel, handler) => handlers.set(channel, handler) };
    const steamClient = {
      isReady: () => true,
      setAchievement: apiName => calls.push(['achievement', apiName]),
      setStat: (apiName, value) => calls.push(['stat', apiName, value]),
      storeStats: () => calls.push(['store']),
      uploadLeaderboardScore: (leaderboardName, score) => ({ ok: true, leaderboardName, score }),
      downloadLeaderboardEntries: (leaderboardName, limit) => ({ ok: true, leaderboardName, limit, entries: [] }),
    };

    registerSteamIpcHandlers(ipcMain, { steamClient });
    await handlers.get('steam:set-achievement')(null, { apiName: 'ACH_FIRST_WIN' });
    await handlers.get('steam:set-stat')(null, { apiName: 'STAT_GAMES_WON', value: 3 });
    await handlers.get('steam:store-stats')();
    const upload = await handlers.get('steam:upload-leaderboard-score')(null, { leaderboardName: 'RANK_POINTS', score: 1200 });
    const download = await handlers.get('steam:download-leaderboard-entries')(null, { leaderboardName: 'RANK_POINTS', limit: 3 });

    expect(await handlers.get('steam:is-ready')()).toBe(true);
    expect(calls).toEqual([
      ['achievement', 'ACH_FIRST_WIN'],
      ['stat', 'STAT_GAMES_WON', 3],
      ['store'],
    ]);
    expect(upload).toEqual({ ok: true, leaderboardName: 'RANK_POINTS', score: 1200 });
    expect(download).toEqual({ ok: true, leaderboardName: 'RANK_POINTS', limit: 3, entries: [] });
  });
});
