import { Difficulty, Owner, PieceType } from '../config.js';
import { ACHIEVEMENT_STATS } from './achievements.js';

const STORAGE_KEY = 'chesssummon.achievementProgress';
const ALL_PIECE_SUMMON_SET = Object.freeze([
  PieceType.KNIGHT,
  PieceType.BISHOP,
  PieceType.ROOK,
  PieceType.QUEEN,
]);

function createEmptyStats() {
  return Object.fromEntries(ACHIEVEMENT_STATS.map(stat => [stat.apiName, 0]));
}

function readState(storage) {
  if (!storage?.getItem) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeState(storage, state) {
  if (!storage?.setItem) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export class AchievementProgress {
  constructor({ storage = globalThis.localStorage } = {}) {
    this.storage = storage;
    const saved = readState(storage);
    this.stats = { ...createEmptyStats(), ...(saved?.stats || {}) };
    this.unlocked = new Set(saved?.unlocked || []);
    this.matchSummons = new Set();
  }

  startMatch() {
    this.matchSummons = new Set();
  }

  getStat(apiName) {
    return this.stats[apiName] || 0;
  }

  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  unlock(id) {
    this.unlocked.add(id);
    this._save();
  }

  incrementStat(apiName, amount = 1) {
    this.stats[apiName] = this.getStat(apiName) + amount;
    this._save();
  }

  setStat(apiName, value) {
    this.stats[apiName] = value;
    this._save();
  }

  recordTutorialComplete() {
    this.unlock('tutorial_complete');
  }

  recordSummon(pieceType) {
    this.incrementStat('STAT_SUMMONS_TOTAL');
    this.unlock('first_summon');
    this.matchSummons.add(pieceType);
    if (ALL_PIECE_SUMMON_SET.every(type => this.matchSummons.has(type))) {
      this.unlock('summon_all_piece_types');
    }
  }

  recordCapture() {
    this.incrementStat('STAT_CAPTURES_TOTAL');
    this.unlock('first_capture');
  }

  recordCheck() {
    this.incrementStat('STAT_CHECKS_GIVEN');
    this.unlock('first_check');
  }

  recordPromotion(owner) {
    if (owner !== Owner.PLAYER) return;
    this.incrementStat('STAT_PROMOTIONS_TOTAL');
    this.unlock('first_promotion');
  }

  recordGameOver({ winner, difficulty, timeRemaining = 0 }) {
    this.incrementStat('STAT_GAMES_PLAYED');
    if (winner !== Owner.PLAYER) {
      this.setStat('STAT_WIN_STREAK', 0);
      return;
    }

    this.incrementStat('STAT_GAMES_WON');
    this.unlock('first_win');
    this.setStat('STAT_WIN_STREAK', this.getStat('STAT_WIN_STREAK') + 1);

    if (difficulty === Difficulty.EASY) this.unlock('easy_win');
    if (difficulty === Difficulty.MEDIUM) this.unlock('medium_win');
    if (difficulty === Difficulty.HARD) {
      this.incrementStat('STAT_HARD_WINS');
      this.unlock('hard_win');
    }
    if (timeRemaining >= 60) {
      this.setStat('STAT_FASTEST_WIN_SECONDS', Math.max(this.getStat('STAT_FASTEST_WIN_SECONDS'), timeRemaining));
      this.unlock('fast_win');
    }
    if (this.getStat('STAT_WIN_STREAK') >= 3) this.unlock('win_streak_3');
  }

  _save() {
    writeState(this.storage, {
      stats: this.stats,
      unlocked: [...this.unlocked],
    });
  }
}

export function createAchievementProgress(options) {
  return new AchievementProgress(options);
}
