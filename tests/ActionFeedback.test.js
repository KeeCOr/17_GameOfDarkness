import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PieceType } from '../src/config.js';
import { formatActionFeedbackText, getActionFeedback } from '../src/ui/actionFeedback.js';

describe('action feedback copy', () => {
  it('previews available moves before the player commits a move', () => {
    expect(getActionFeedback({
      type: 'move-preview',
      moveCount: 3,
      captureCount: 0,
    })).toEqual({
      cue: 'POS',
      text: 'Move options 3 | Pick a green tile',
      tone: 'normal',
    });
  });

  it('calls out capture options in move preview feedback', () => {
    expect(getActionFeedback({
      type: 'move-preview',
      moveCount: 4,
      captureCount: 2,
    })).toEqual({
      cue: 'CAP',
      text: 'Move options 4 | Capture options 2 | Pick a green tile',
      tone: 'success',
    });
  });

  it('warns clearly when a selected piece has no legal move', () => {
    expect(getActionFeedback({
      type: 'move-preview',
      moveCount: 0,
      captureCount: 0,
    })).toEqual({
      text: 'No legal move | Pick another piece',
      tone: 'normal',
    });
  });

  it('previews summonable cells and keeps the remaining move action visible', () => {
    expect(getActionFeedback({
      type: 'summon-preview',
      summonableCount: 3,
      hasMoved: false,
      hasSummoned: false,
    })).toEqual({
      cue: 'SUM',
      text: 'Summon tiles 3 | Move left',
      tone: 'summon',
    });
  });

  it('wires summon preview feedback into summon mode entry', () => {
    const source = readFileSync(new URL('../src/scenes/GameScene.js', import.meta.url), 'utf8');

    expect(source).toContain("type: 'summon-preview'");
    expect(source).toContain('summonableCount');
    expect(source).toContain('_showSummonPreviewFeedback(squares)');
  });

  it('wires move preview feedback into the board selection loop', () => {
    const source = readFileSync(new URL('../src/scenes/GameScene.js', import.meta.url), 'utf8');

    expect(source).toContain("import { formatActionFeedbackText, getActionFeedback } from '../ui/actionFeedback.js';");
    expect(source).toContain("type: 'move-preview'");
    expect(source).toContain('captureCount');
  });

  it('confirms a normal move and says the player may end without summoning', () => {
    expect(getActionFeedback({
      type: 'move',
      hasMoved: true,
      hasSummoned: false,
    })).toEqual({
      cue: 'POS',
      text: 'Move complete | Summon optional / End OK',
      tone: 'normal',
    });
  });

  it('does not require summon before manual turn end copy', () => {
    expect(getActionFeedback({
      hasMoved: true,
      hasSummoned: false,
    })).toEqual({
      text: 'Summon optional / End OK',
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
      cue: 'CAP',
      text: 'Capture piece | End ready',
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
      cue: 'SUM',
      text: 'Knight summon | Move left',
      tone: 'summon',
    });
  });

  it('summarizes the full board loop without opening help', () => {
    expect(getActionFeedback({
      type: 'board-loop',
      hasMoved: false,
      hasSummoned: false,
    })).toEqual({
      cue: 'WIN',
      text: '1 Summon optional | 2 Move/Capture | Win: break enemy king',
      tone: 'normal',
    });
  });

  it('wires board loop feedback into turn start HUD', () => {
    const source = readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8');

    expect(source).toContain("type: 'board-loop'");
    expect(source).toContain('_showActionFeedback({');
  });

  it('layers summon feedback with mana delta and check pressure', () => {
    expect(getActionFeedback({
      type: 'summon',
      pieceType: PieceType.KNIGHT,
      manaBefore: 5,
      manaAfter: 2,
      gaveCheck: true,
      hasMoved: false,
      hasSummoned: true,
    })).toEqual({
      cue: 'CHK',
      text: 'Knight summon | Mana 5->2 | CHECK threat | Move left',
      tone: 'summon',
    });
  });

  it('layers capture feedback with captured piece and check pressure', () => {
    expect(getActionFeedback({
      type: 'move',
      capture: true,
      capturedPieceType: PieceType.ROOK,
      gaveCheck: true,
      hasMoved: true,
      hasSummoned: false,
    })).toEqual({
      cue: 'CHK',
      text: 'Capture Rook | CHECK threat | Summon optional / End OK',
      tone: 'success',
    });
  });

  it('adds a compact capture cue when a committed move wins material', () => {
    expect(getActionFeedback({
      type: 'move',
      capture: true,
      capturedPieceType: PieceType.BISHOP,
      gaveCheck: false,
      hasMoved: true,
      hasSummoned: false,
    })).toMatchObject({
      cue: 'CAP',
      text: 'Capture Bishop | Summon optional / End OK',
      tone: 'success',
    });
  });

  it('prioritizes a compact check cue over normal material pressure', () => {
    expect(getActionFeedback({
      type: 'move',
      capture: true,
      capturedPieceType: PieceType.ROOK,
      gaveCheck: true,
      hasMoved: true,
      hasSummoned: false,
    })).toMatchObject({
      cue: 'CHK',
      text: 'Capture Rook | CHECK threat | Summon optional / End OK',
      tone: 'success',
    });
  });

  it('adds a compact summon cue when the selected action expands board pressure', () => {
    expect(getActionFeedback({
      type: 'summon',
      pieceType: PieceType.KNIGHT,
      manaBefore: 5,
      manaAfter: 2,
      gaveCheck: false,
      hasMoved: false,
      hasSummoned: true,
    })).toMatchObject({
      cue: 'SUM',
      text: 'Knight summon | Mana 5->2 | Move left',
      tone: 'summon',
    });
  });
  it('formats compact cue before the existing action copy', () => {
    expect(formatActionFeedbackText({
      cue: 'CAP',
      text: 'Capture Rook | Summon optional / End OK',
      tone: 'success',
    })).toBe('[CAP] Capture Rook | Summon optional / End OK');
  });
  it('layers normal move feedback with no-capture result and remaining summon choice', () => {
    expect(getActionFeedback({
      type: 'move',
      capture: false,
      gaveCheck: false,
      hasMoved: true,
      hasSummoned: false,
    })).toEqual({
      cue: 'POS',
      text: 'Move complete | No capture | Summon optional / End OK',
      tone: 'normal',
    });
  });
});
