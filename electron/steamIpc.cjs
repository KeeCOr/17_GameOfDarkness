const STEAM_UNAVAILABLE = Object.freeze({ ok: false, reason: 'steam-unavailable' });

function registerSteamIpcHandlers(ipcMain, { steamClient = null } = {}) {
  ipcMain.handle('steam:is-ready', () => {
    if (!steamClient?.isReady) return false;
    return steamClient.isReady() === true;
  });

  ipcMain.handle('steam:set-achievement', (_event, { apiName } = {}) => {
    if (!isReady(steamClient) || !steamClient.setAchievement) return STEAM_UNAVAILABLE;
    steamClient.setAchievement(apiName);
    return { ok: true };
  });

  ipcMain.handle('steam:set-stat', (_event, { apiName, value } = {}) => {
    if (!isReady(steamClient) || !steamClient.setStat) return STEAM_UNAVAILABLE;
    steamClient.setStat(apiName, value);
    return { ok: true };
  });

  ipcMain.handle('steam:store-stats', () => {
    if (!isReady(steamClient) || !steamClient.storeStats) return STEAM_UNAVAILABLE;
    steamClient.storeStats();
    return { ok: true };
  });

  ipcMain.handle('steam:upload-leaderboard-score', (_event, { leaderboardName, score } = {}) => {
    if (!isReady(steamClient) || !steamClient.uploadLeaderboardScore) return STEAM_UNAVAILABLE;
    return steamClient.uploadLeaderboardScore(leaderboardName, score);
  });
}

function isReady(steamClient) {
  return steamClient?.isReady?.() === true;
}

module.exports = {
  STEAM_UNAVAILABLE,
  registerSteamIpcHandlers,
};
