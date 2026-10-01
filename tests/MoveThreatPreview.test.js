import { describe, expect, it } from 'vitest';
import { Board } from '../src/game/Board.js';
import { MoveCalculator } from '../src/game/MoveCalculator.js';
import { Piece } from '../src/game/Piece.js';
import { Owner, PieceType } from '../src/config.js';
import { buildMoveThreatPreviews, previewMoveThreat } from '../src/game/moveThreatPreview.js';

describe('move threat preview', () => {
  it('labels outnumbered destinations', () => {
    expect(previewMoveThreat({ attackers: [1, 2], defenders: [1] }).status).toBe('위험');
  });

  it('labels destinations with no enemy pressure as safe', () => {
    expect(previewMoveThreat({ attackers: [], defenders: [] }).status).toBe('안전');
  });

  it('builds per-destination safety and capture previews from the board', () => {
    const board = new Board();
    board.setPiece(4, 2, new Piece(PieceType.KING, Owner.PLAYER));
    board.setPiece(3, 2, new Piece(PieceType.KNIGHT, Owner.PLAYER));
    board.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
    board.setPiece(1, 1, new Piece(PieceType.PAWN, Owner.AI));
    const calculator = new MoveCalculator();
    const moves = calculator.getMoves(board, 3, 2);
    const previews = buildMoveThreatPreviews({ board, moveCalculator: calculator, from: { row: 3, col: 2 }, moves });

    expect(previews).toHaveLength(moves.length);
    expect(previews.every(preview => ['안전', '교환', '위험'].includes(preview.status))).toBe(true);
    expect(previews.find(preview => preview.row === 1 && preview.col === 1)?.isCapture).toBe(true);
  });
});
