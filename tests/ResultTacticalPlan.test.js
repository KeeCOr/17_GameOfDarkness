import { describe, expect, it } from 'vitest';
import { Owner, PieceType } from '../src/config.js';
import { createBattleSummary, getNextBattlePlan } from '../src/game/resultTacticalPlan.js';

describe('result tactical plan', () => {
  it('captures the final board state without mutating it', () => {
    const board = {
      mana: { [Owner.PLAYER]: 4 },
      summonCounts: { [Owner.PLAYER]: { [PieceType.KNIGHT]: 2 } },
      getAllPieces: owner => owner === Owner.PLAYER
        ? [{ piece: { type: PieceType.KING } }, { piece: { type: PieceType.KNIGHT } }]
        : [{ piece: { type: PieceType.KING } }],
    };

    expect(createBattleSummary(board)).toEqual({
      mana: 4,
      summonCounts: { [PieceType.KNIGHT]: 2 },
      playerPieces: [PieceType.KING, PieceType.KNIGHT],
      enemyPieces: [PieceType.KING],
    });
  });

  it('turns a no-major-summon loss into a concrete first summon choice', () => {
    const plan = getNextBattlePlan({
      playerWon: false,
      battleSummary: { mana: 5, summonCounts: {}, playerPieces: [], enemyPieces: [] },
    });

    expect(plan.headline).toContain('기사 또는 주교');
    expect(plan.detail).toContain('5마나');
  });

  it('prioritizes formation preservation after losing material', () => {
    const plan = getNextBattlePlan({
      playerWon: false,
      battleSummary: {
        summonCounts: { [PieceType.BISHOP]: 1 },
        playerPieces: [PieceType.KING],
        enemyPieces: [PieceType.KING, PieceType.ROOK],
      },
    });

    expect(plan.headline).toContain('병사 1개');
    expect(plan.detail).toContain('후속 소환 칸');
  });

  it('recommends repeating the most-used major summon after a win', () => {
    const plan = getNextBattlePlan({
      playerWon: true,
      battleSummary: {
        summonCounts: { [PieceType.KNIGHT]: 2, [PieceType.BISHOP]: 1 },
        playerPieces: [PieceType.KING, PieceType.KNIGHT],
        enemyPieces: [],
      },
    });

    expect(plan.headline).toContain('기사 중심 소환');
    expect(plan.tone).toBe('success');
  });

  it('reduces timeout decisions to one prepared opening summon', () => {
    expect(getNextBattlePlan({ resultReason: 'timeout' }).headline).toContain('첫 소환을');
  });
});
