import { describe, expect, it } from 'vitest';
import { PieceType } from '../src/config.js';
import { getActionFeedback } from '../src/ui/actionFeedback.js';

describe('action feedback copy', () => {
  it('confirms a normal move and points to the remaining summon action', () => {
    expect(getActionFeedback({
      type: 'move',
      hasMoved: true,
      hasSummoned: false,
    })).toEqual({
      text: '이동 완료 · 소환 가능',
      tone: 'normal',
    });
  });

  it('celebrates a capture when both actions are spent', () => {
    expect(getActionFeedback({
      type: 'move',
      capture: true,
      hasMoved: true,
      hasSummoned: true,
    })).toEqual({
      text: '처치 성공 · 턴 종료 준비',
      tone: 'success',
    });
  });

  it('names the summoned piece and points to the remaining move action', () => {
    expect(getActionFeedback({
      type: 'summon',
      pieceType: PieceType.KNIGHT,
      hasMoved: false,
      hasSummoned: true,
    })).toEqual({
      text: '기사 소환 · 이동 가능',
      tone: 'summon',
    });
  });
});

