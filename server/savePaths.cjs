const os = require('os');
const path = require('path');

const APP_FOLDER = 'ChessSummon';
const SAVE_FOLDER = 'SaveData';
const RANK_FILE_NAME = 'rank-points.json';
const CLOUD_SAVE_PATTERN = '*.json';

function getDefaultSaveDir({ env = process.env, platform = process.platform, homeDir = os.homedir() } = {}) {
  if (env.CHESSSUMMON_SAVE_DIR) return env.CHESSSUMMON_SAVE_DIR;

  if (platform === 'win32') {
    const appData = env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
    return path.join(appData, APP_FOLDER, SAVE_FOLDER);
  }

  if (platform === 'darwin') {
    return path.join(homeDir, 'Library', 'Application Support', APP_FOLDER, SAVE_FOLDER);
  }

  const dataHome = env.XDG_DATA_HOME || path.join(homeDir, '.local', 'share');
  return path.join(dataHome, APP_FOLDER, SAVE_FOLDER);
}

function getRankFilePath(options = {}) {
  if (options.env?.RANK_FILE || process.env.RANK_FILE) {
    return options.env?.RANK_FILE || process.env.RANK_FILE;
  }
  return path.join(getDefaultSaveDir(options), RANK_FILE_NAME);
}

function getSteamAutoCloudConfig() {
  return {
    root: 'WinAppDataRoaming',
    subdirectory: 'ChessSummon/SaveData',
    pattern: CLOUD_SAVE_PATTERN,
    os: 'Windows',
    recursive: false,
  };
}

module.exports = {
  APP_FOLDER,
  CLOUD_SAVE_PATTERN,
  RANK_FILE_NAME,
  SAVE_FOLDER,
  getDefaultSaveDir,
  getRankFilePath,
  getSteamAutoCloudConfig,
};
