import { describe, expect, it } from 'vitest';
import pkg from '../package.json';
import {
  getReleaseInfo,
  RELEASE_CHANNELS,
  RELEASE_VERSION,
} from '../src/releaseInfo.js';

describe('release info', () => {
  it('keeps the in-game version aligned with package.json', () => {
    expect(RELEASE_VERSION).toBe(pkg.version);
  });

  it('labels the default desktop build for QA', () => {
    expect(getReleaseInfo()).toEqual({
      version: pkg.version,
      channel: RELEASE_CHANNELS.DESKTOP,
      channelLabel: 'Desktop',
      displayLabel: `Desktop v${pkg.version}`,
    });
  });

  it('labels Steam release candidate builds separately', () => {
    expect(getReleaseInfo({ VITE_RELEASE_CHANNEL: 'steam' })).toEqual({
      version: pkg.version,
      channel: RELEASE_CHANNELS.STEAM,
      channelLabel: 'Steam',
      displayLabel: `Steam v${pkg.version}`,
    });
  });
});
