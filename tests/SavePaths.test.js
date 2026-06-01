import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const {
  CLOUD_SAVE_PATTERN,
  getDefaultSaveDir,
  getRankFilePath,
  getSteamAutoCloudConfig,
} = require('../server/savePaths.cjs');

describe('save path configuration', () => {
  it('stores cloud-ready saves under AppData Roaming on Windows', () => {
    const dir = getDefaultSaveDir({
      env: { APPDATA: 'C:\\Users\\Player\\AppData\\Roaming' },
      platform: 'win32',
      homeDir: 'C:\\Users\\Player',
    });

    expect(dir).toBe(path.join('C:\\Users\\Player\\AppData\\Roaming', 'ChessSummon', 'SaveData'));
  });

  it('lets QA override the save directory without changing code', () => {
    const dir = getDefaultSaveDir({
      env: { CHESSSUMMON_SAVE_DIR: 'D:\\ChessSummonSaves' },
      platform: 'win32',
      homeDir: 'C:\\Users\\Player',
    });

    expect(dir).toBe('D:\\ChessSummonSaves');
  });

  it('keeps rank data in the cloud-ready save folder by default', () => {
    const file = getRankFilePath({
      env: { APPDATA: 'C:\\Users\\Player\\AppData\\Roaming' },
      platform: 'win32',
      homeDir: 'C:\\Users\\Player',
    });

    expect(file).toBe(path.join('C:\\Users\\Player\\AppData\\Roaming', 'ChessSummon', 'SaveData', 'rank-points.json'));
  });

  it('documents the matching Steam Auto-Cloud root path settings', () => {
    expect(CLOUD_SAVE_PATTERN).toBe('*.json');
    expect(getSteamAutoCloudConfig()).toEqual({
      root: 'WinAppDataRoaming',
      subdirectory: 'ChessSummon/SaveData',
      pattern: '*.json',
      os: 'Windows',
      recursive: false,
    });
  });
});
