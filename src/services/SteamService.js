import { STEAM_ACHIEVEMENTS, ACHIEVEMENT_STATS } from '../game/achievements.js';
import { AchievementProgress } from '../game/achievementProgress.js';
import { getLeaderboardById } from '../game/leaderboards.js';

export class SteamService {
  constructor({ storage, steamClient = null, progress = null } = {}) {
    this.steamClient = steamClient || getDefaultSteamClient();
    this.progress = progress || new AchievementProgress({ storage });
  }

  isSteamAvailable() {
    if (!this.steamClient) return false;
    if (typeof this.steamClient.isReady === 'function') return this.steamClient.isReady();
    return true;
  }

  startMatch() {
    this.progress.startMatch();
  }

  getStat(apiName) {
    return this.progress.getStat(apiName);
  }

  isUnlocked(id) {
    return this.progress.isUnlocked(id);
  }

  recordTutorialComplete() {
    this.progress.recordTutorialComplete();
    this._syncSteam();
  }

  recordSummon(pieceType) {
    this.progress.recordSummon(pieceType);
    this._syncSteam();
  }

  recordCapture() {
    this.progress.recordCapture();
    this._syncSteam();
  }

  recordCheck() {
    this.progress.recordCheck();
    this._syncSteam();
  }

  recordPromotion(owner) {
    this.progress.recordPromotion(owner);
    this._syncSteam();
  }

  recordGameOver(result) {
    this.progress.recordGameOver(result);
    this._syncSteam();
  }

  uploadRankPoints(score) {
    if (!this.isSteamAvailable() || typeof this.steamClient.uploadLeaderboardScore !== 'function') {
      return { ok: false, reason: 'steam-unavailable' };
    }
    return this.steamClient.uploadLeaderboardScore(getLeaderboardById('rank_points').apiName, score);
  }

  getSteamId() {
    if (!this.isSteamAvailable() || typeof this.steamClient.getSteamId !== 'function') {
      return { ok: false, reason: 'steam-unavailable' };
    }
    return this.steamClient.getSteamId();
  }

  downloadRankLeaderboard(limit = 5) {
    if (!this.isSteamAvailable() || typeof this.steamClient.downloadLeaderboardEntries !== 'function') {
      return { ok: false, reason: 'steam-unavailable', entries: [] };
    }
    return this.steamClient.downloadLeaderboardEntries(getLeaderboardById('rank_points').apiName, limit);
  }

  _syncSteam() {
    if (!this.isSteamAvailable()) return;
    for (const stat of ACHIEVEMENT_STATS) {
      this.steamClient.setStat?.(stat.apiName, this.progress.getStat(stat.apiName));
    }
    for (const achievement of STEAM_ACHIEVEMENTS) {
      if (this.progress.isUnlocked(achievement.id)) {
        this.steamClient.setAchievement?.(achievement.apiName);
      }
    }
    this.steamClient.storeStats?.();
  }
}

export function createSteamService(options) {
  return new SteamService(options);
}

function getDefaultSteamClient() {
  return globalThis.window?.chessSummonSteam || null;
}

