import { describe, it, expect } from 'vitest';
import { AIController, getSearchDepthForDifficulty } from '../src/game/AIController.js';
import { Board } from '../src/game/Board.js';
import { Piece } from '../src/game/Piece.js';
import { PieceType, Owner, Difficulty } from '../src/config.js';

function makeStartBoard() {
  const b = new Board();
  b.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
  b.setPiece(1, 0, new Piece(PieceType.PAWN, Owner.AI));
  b.setPiece(1, 1, new Piece(PieceType.PAWN, Owner.AI));
  b.setPiece(1, 3, new Piece(PieceType.PAWN, Owner.AI));
  b.setPiece(1, 4, new Piece(PieceType.PAWN, Owner.AI));
  b.setPiece(4, 2, new Piece(PieceType.KING, Owner.PLAYER));
  b.setPiece(3, 0, new Piece(PieceType.PAWN, Owner.PLAYER));
  b.setPiece(3, 4, new Piece(PieceType.PAWN, Owner.PLAYER));
  b.mana[Owner.AI] = 4;
  return b;
}

describe('AIController', () => {
  it('easy returns an action (move or summon)', () => {
    const ai = new AIController(Difficulty.EASY);
    const action = ai.getAction(makeStartBoard());
    expect(['move', 'summon', 'pass']).toContain(action.type);
  });

  it('medium returns an action', () => {
    const ai = new AIController(Difficulty.MEDIUM);
    const action = ai.getAction(makeStartBoard());
    expect(['move', 'summon', 'pass']).toContain(action.type);
  });

  it('hard returns an action', () => {
    const ai = new AIController(Difficulty.HARD);
    const action = ai.getAction(makeStartBoard());
    expect(['move', 'summon', 'pass']).toContain(action.type);
  });

  it('very hard returns an action and searches deeper than hard', () => {
    const ai = new AIController(Difficulty.VERY_HARD);
    const action = ai.getAction(makeStartBoard());

    expect(['move', 'summon', 'pass']).toContain(action.type);
    expect(getSearchDepthForDifficulty(Difficulty.VERY_HARD))
      .toBeGreaterThan(getSearchDepthForDifficulty(Difficulty.HARD));
  });

  it('medium captures player piece when available', () => {
    const b = new Board();
    b.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
    b.setPiece(4, 2, new Piece(PieceType.KING, Owner.PLAYER));
    b.setPiece(2, 2, new Piece(PieceType.ROOK, Owner.AI));
    b.setPiece(3, 2, new Piece(PieceType.PAWN, Owner.PLAYER)); // capturable
    b.mana[Owner.AI] = 0;
    const ai = new AIController(Difficulty.MEDIUM);
    const action = ai.getAction(b);
    expect(action.type).toBe('move');
    expect(action.to).toEqual({ row: 3, col: 2 });
  });

  it('hard does not take a valuable capture that exposes its own king', () => {
    const b = new Board();
    b.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
    b.setPiece(1, 2, new Piece(PieceType.ROOK, Owner.AI));
    b.setPiece(4, 0, new Piece(PieceType.KING, Owner.PLAYER));
    b.setPiece(4, 2, new Piece(PieceType.ROOK, Owner.PLAYER));
    b.setPiece(1, 4, new Piece(PieceType.QUEEN, Owner.PLAYER));
    b.mana[Owner.AI] = 0;

    const ai = new AIController(Difficulty.HARD);
    const action = ai.getMove(b);

    expect(action).not.toMatchObject({
      from: { row: 1, col: 2 },
      to: { row: 1, col: 4 },
    });
  });

  it('hard summons on the checking line instead of blindly choosing the most valuable square', () => {
    const b = new Board();
    b.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
    b.setPiece(4, 0, new Piece(PieceType.KING, Owner.PLAYER));
    b.setPiece(4, 2, new Piece(PieceType.ROOK, Owner.PLAYER));
    b.mana[Owner.AI] = 8;

    const ai = new AIController(Difficulty.HARD);
    const action = ai.getSummon(b);

    expect(action).toMatchObject({
      type: 'summon',
      to: { row: 1, col: 2 },
    });
  });

  it('hard takes an immediate checkmate move when it exists', () => {
    const b = new Board();
    b.setPiece(0, 0, new Piece(PieceType.KING, Owner.AI));
    b.setPiece(2, 1, new Piece(PieceType.QUEEN, Owner.AI));
    b.setPiece(4, 0, new Piece(PieceType.KING, Owner.PLAYER));
    b.setPiece(3, 1, new Piece(PieceType.ROOK, Owner.AI));
    b.mana[Owner.AI] = 0;

    const ai = new AIController(Difficulty.HARD);
    const action = ai.getMove(b);

    expect(action).toMatchObject({
      type: 'move',
      from: { row: 2, col: 1 },
      to: { row: 3, col: 0 },
    });
  });

  it('very hard takes an immediate checkmate move when it exists', () => {
    const b = new Board();
    b.setPiece(0, 0, new Piece(PieceType.KING, Owner.AI));
    b.setPiece(2, 1, new Piece(PieceType.QUEEN, Owner.AI));
    b.setPiece(4, 0, new Piece(PieceType.KING, Owner.PLAYER));
    b.setPiece(3, 1, new Piece(PieceType.ROOK, Owner.AI));
    b.mana[Owner.AI] = 0;

    const ai = new AIController(Difficulty.VERY_HARD);
    const action = ai.getMove(b);

    expect(action).toMatchObject({
      type: 'move',
      from: { row: 2, col: 1 },
      to: { row: 3, col: 0 },
    });
  });
});
