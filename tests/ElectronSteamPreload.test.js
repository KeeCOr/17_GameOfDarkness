import { describe, expect, it } from 'vitest';
import { createSteamRendererApi } from '../electron/steamPreload.cjs';

describe('Electron Steam preload bridge', () => {
  it('maps renderer Steam calls to IPC channels', async () => {
    const calls = [];
    const ipcRenderer = {
      invoke: (channel, payload) => {
        calls.push({ channel, payload });
        return Promise.resolve({ ok: true, channel, payload });
      },
    };
    const api = createSteamRendererApi(ipcRenderer);

    expect(await api.isReady()).toEqual({ ok: true, channel: 'steam:is-ready', payload: undefined });
    await api.setAchievement('ACH_FIRST_WIN');
    await api.setStat('STAT_GAMES_WON', 3);
    await api.storeStats();
    await api.uploadLeaderboardScore('RANK_POINTS', 1234);
    await api.downloadLeaderboardEntries('RANK_POINTS', 5);

    expect(calls).toEqual([
      { channel: 'steam:is-ready', payload: undefined },
      { channel: 'steam:set-achievement', payload: { apiName: 'ACH_FIRST_WIN' } },
      { channel: 'steam:set-stat', payload: { apiName: 'STAT_GAMES_WON', value: 3 } },
      { channel: 'steam:store-stats', payload: undefined },
      { channel: 'steam:upload-leaderboard-score', payload: { leaderboardName: 'RANK_POINTS', score: 1234 } },
      { channel: 'steam:download-leaderboard-entries', payload: { leaderboardName: 'RANK_POINTS', limit: 5 } },
    ]);
  });
});
