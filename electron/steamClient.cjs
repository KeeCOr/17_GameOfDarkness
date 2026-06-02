const STEAM_UNAVAILABLE = Object.freeze({ ok: false, reason: 'steam-unavailable' });

function resolveSteamAppId(env = process.env) {
  const value = Number(env.STEAM_APP_ID);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function createSteamClient({ env = process.env, loadSteamworks = loadOptionalSteamworks } = {}) {
  const appId = resolveSteamAppId(env);
  if (!appId) return createUnavailableClient();

  try {
    const sdk = loadSteamworks(appId);
    if (!sdk) return createUnavailableClient();
    return createSdkClient(sdk);
  } catch {
    return createUnavailableClient();
  }
}

function createSdkClient(sdk) {
  return {
    isReady: () => true,
    setAchievement(apiName) {
      sdk.setAchievement?.(apiName);
      return { ok: true };
    },
    setStat(apiName, value) {
      sdk.setStat?.(apiName, value);
      return { ok: true };
    },
    storeStats() {
      sdk.storeStats?.();
      return { ok: true };
    },
    uploadLeaderboardScore(leaderboardName, score) {
      if (sdk.uploadLeaderboardScore) return sdk.uploadLeaderboardScore(leaderboardName, score);
      return { ok: false, reason: 'leaderboard-unavailable' };
    },
  };
}

function createUnavailableClient() {
  return {
    isReady: () => false,
    setAchievement: () => STEAM_UNAVAILABLE,
    setStat: () => STEAM_UNAVAILABLE,
    storeStats: () => STEAM_UNAVAILABLE,
    uploadLeaderboardScore: () => STEAM_UNAVAILABLE,
  };
}

function loadOptionalSteamworks(appId) {
  // The actual SDK package is intentionally optional until Steamworks setup is approved.
  const steamworks = require('steamworks.js');
  const client = steamworks.init(appId);
  return normalizeSteamworksClient(client);
}

function normalizeSteamworksClient(client) {
  return {
    setAchievement: apiName => client.achievement?.activate?.(apiName),
    setStat: (apiName, value) => client.stats?.setInt?.(apiName, value),
    storeStats: () => client.stats?.store?.(),
    uploadLeaderboardScore: (leaderboardName, score) =>
      client.leaderboard?.uploadScore?.(leaderboardName, score) || { ok: false, reason: 'leaderboard-unavailable' },
  };
}

module.exports = {
  createSteamClient,
  resolveSteamAppId,
};
