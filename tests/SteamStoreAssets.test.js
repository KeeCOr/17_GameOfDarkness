import { describe, expect, it } from 'vitest';
import {
  getRequiredSteamStoreAssets,
  getSteamStoreAssetById,
  STEAM_STORE_ASSET_SOURCE_URL,
} from '../src/steam/storeAssets.js';

describe('Steam store asset requirements', () => {
  it('tracks the required Steam store capsule sizes from Steamworks docs', () => {
    expect(getSteamStoreAssetById('header_capsule')).toMatchObject({
      width: 920,
      height: 430,
      required: true,
    });
    expect(getSteamStoreAssetById('small_capsule')).toMatchObject({
      width: 462,
      height: 174,
      required: true,
    });
    expect(getSteamStoreAssetById('main_capsule')).toMatchObject({
      width: 1232,
      height: 706,
      required: true,
    });
    expect(getSteamStoreAssetById('vertical_capsule')).toMatchObject({
      width: 748,
      height: 896,
      required: true,
    });
  });

  it('tracks screenshot and library asset requirements for the store package', () => {
    expect(getSteamStoreAssetById('screenshots')).toMatchObject({
      minWidth: 1920,
      minHeight: 1080,
      ratio: '16:9',
      required: true,
    });
    expect(getSteamStoreAssetById('library_capsule')).toMatchObject({
      width: 600,
      height: 900,
      required: true,
    });
    expect(getSteamStoreAssetById('library_hero')).toMatchObject({
      width: 3840,
      height: 1240,
      required: true,
    });
    expect(getSteamStoreAssetById('library_logo')).toMatchObject({
      required: true,
      format: 'png',
    });
  });

  it('returns only required assets for the first Steam submission package', () => {
    const required = getRequiredSteamStoreAssets();

    expect(required.every(asset => asset.required)).toBe(true);
    expect(required.map(asset => asset.id)).toEqual(expect.arrayContaining([
      'header_capsule',
      'screenshots',
      'library_hero',
      'library_logo',
    ]));
    expect(STEAM_STORE_ASSET_SOURCE_URL).toBe('https://partner.steamgames.com/doc/store/assets');
  });
});
