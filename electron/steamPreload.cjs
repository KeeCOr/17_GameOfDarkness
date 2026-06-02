function createSteamRendererApi(ipcRenderer) {
  return {
    isReady: () => ipcRenderer.invoke('steam:is-ready'),
    setAchievement: apiName => ipcRenderer.invoke('steam:set-achievement', { apiName }),
    setStat: (apiName, value) => ipcRenderer.invoke('steam:set-stat', { apiName, value }),
    storeStats: () => ipcRenderer.invoke('steam:store-stats'),
    uploadLeaderboardScore: (leaderboardName, score) =>
      ipcRenderer.invoke('steam:upload-leaderboard-score', { leaderboardName, score }),
  };
}

try {
  const { contextBridge, ipcRenderer } = require('electron');
  contextBridge.exposeInMainWorld('chessSummonSteam', createSteamRendererApi(ipcRenderer));
} catch {
  // Unit tests import createSteamRendererApi without an Electron preload context.
}

module.exports = { createSteamRendererApi };
