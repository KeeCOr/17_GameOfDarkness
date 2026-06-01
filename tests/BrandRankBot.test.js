import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { Difficulty } from '../src/config.js';
import { getAIThinkDelayRange } from '../src/game/aiTiming.js';
import { getBotProfileForMatch } from '../src/game/botProfiles.js';
import { getRankTierForMMR, RANK_TIERS } from '../src/game/rankTiers.js';

describe('brand, rank, and bot presentation', () => {
  it('maps MMR to ranked icon tiers', () => {
    expect(getRankTierForMMR(899).id).toBe('bronze');
    expect(getRankTierForMMR(900).id).toBe('silver');
    expect(getRankTierForMMR(1100).id).toBe('gold');
    expect(getRankTierForMMR(1300).id).toBe('platinum');
    expect(getRankTierForMMR(1500).id).toBe('diamond');
    expect(getRankTierForMMR(1750).id).toBe('master');
  });

  it('ships logo and one icon asset for each MMR tier', () => {
    expect(fs.existsSync(path.join('public', 'assets', 'brand', 'chesssummon-logo.svg'))).toBe(true);
    expect(fs.existsSync(path.join('public', 'assets', 'brand', 'chesssummon-mark.svg'))).toBe(true);
    for (const tier of RANK_TIERS)
      expect(fs.existsSync(tier.icon)).toBe(true);
  });

  it('assigns deterministic international bot profiles', () => {
    const profile = getBotProfileForMatch('Alice', 1180);
    const again = getBotProfileForMatch('Alice', 1180);

    expect(profile).toEqual(again);
    expect(profile.flag).toMatch(/^[A-Z]{2}$/);
    expect(profile.flagIcon).toBeTruthy();
    expect(profile.name).toContain('AI');
  });

  it('uses human-like AI thinking windows by difficulty', () => {
    expect(getAIThinkDelayRange(Difficulty.EASY)).toEqual({ min: 850, max: 1500 });
    expect(getAIThinkDelayRange(Difficulty.MEDIUM)).toEqual({ min: 1100, max: 1900 });
    expect(getAIThinkDelayRange(Difficulty.HARD)).toEqual({ min: 1400, max: 2600 });
  });
});
