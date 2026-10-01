import { describe, expect, it } from 'vitest';
import { compareBoardPressure, getOnboardingRules } from '../src/game/onboardingProgression.js';

describe('onboarding progression', () => {
  it('opens core pieces and summoning rules in stages', () => {
    expect(getOnboardingRules(0).pieces).toEqual(['king', 'pawn']);
    expect(getOnboardingRules(0).rules).not.toContain('summon');
    expect(getOnboardingRules(2).rules).toContain('summon');
  });

  it('compares board control and king threat before and after summoning', () => {
    const result = compareBoardPressure({ before: { control: 7, kingThreat: 3 }, after: { control: 11, kingThreat: 1 } });
    expect(result.controlDelta).toBe(4);
    expect(result.kingThreatDelta).toBe(-2);
    expect(result.summary).toContain('Control +4');
  });
});
