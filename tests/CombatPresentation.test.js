import { describe, it, expect, beforeAll } from 'vitest';
import { Board } from '../src/game/Board.js';
import { Piece } from '../src/game/Piece.js';
import { Owner, PieceType } from '../src/config.js';

beforeAll(() => {
  globalThis.Phaser = { Scene: class {} };
});

describe('combat presentation resources', () => {
  it('lists the UI and combat feedback resources needed for polish', async () => {
    const { UI_RESOURCE_LIST } = await import('../src/ui/effects.js');
    const ids = UI_RESOURCE_LIST.map(item => item.id);

    expect(ids).toContain('button-primary');
    expect(ids).toContain('frame-hud-panel');
    expect(ids).toContain('state-check-alert');
    expect(ids).toContain('fx-capture-impact');
    expect(ids).toContain('fx-promotion-burst');
    expect(ids).toContain('brand-logo');
    expect(ids).toContain('mmr-tier-icons');
  });

  it('emits a promotion effect for every pawn that becomes a queen', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const promotions = [];

    scene.board = new Board();
    scene.board.setPiece(0, 1, new Piece(PieceType.PAWN, Owner.PLAYER));
    scene.board.setPiece(4, 3, new Piece(PieceType.PAWN, Owner.AI));
    scene._animatePromotion = (row, col, owner) => promotions.push({ row, col, owner });

    scene._checkPromotion();

    expect(scene.board.getPiece(0, 1).type).toBe(PieceType.QUEEN);
    expect(scene.board.getPiece(4, 3).type).toBe(PieceType.QUEEN);
    expect(promotions).toEqual([
      { row: 0, col: 1, owner: Owner.PLAYER },
      { row: 4, col: 3, owner: Owner.AI },
    ]);
  });
});
