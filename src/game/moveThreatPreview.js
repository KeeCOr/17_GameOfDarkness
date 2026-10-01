import { Owner, PieceType } from '../config.js';
import { Piece } from './Piece.js';

export function previewMoveThreat({ attackers = [], defenders = [], summon = null }) {
  const threatDelta = defenders.length - attackers.length;
  return {
    attackers: attackers.length,
    defenders: defenders.length,
    status: attackers.length === 0 ? '안전' : threatDelta > 0 ? '안전' : threatDelta === 0 ? '교환' : '위험',
    summonResult: summon ? `${summon.name ?? '소환수'} 배치 후 방어 +${summon.defense ?? 0}` : '소환 없음',
  };
}

export function buildMoveThreatPreviews({ board, moveCalculator, from, moves = [], owner = Owner.PLAYER }) {
  if (!board || !moveCalculator || !from) return [];
  const enemy = owner === Owner.PLAYER ? Owner.AI : Owner.PLAYER;

  return moves.map(({ row, col }) => {
    const simulated = board.clone();
    const capturedPiece = simulated.getPiece(row, col);
    simulated.movePiece(from.row, from.col, row, col);
    const attackers = countSquarePressure(simulated, moveCalculator, { row, col }, enemy);
    const defenders = countSquarePressure(simulated, moveCalculator, { row, col }, owner);
    return { row, col, isCapture: Boolean(capturedPiece), ...previewMoveThreat({ attackers, defenders }) };
  });
}

function countSquarePressure(board, moveCalculator, target, owner) {
  const pressureBoard = board.clone();
  const targetOwner = owner === Owner.PLAYER ? Owner.AI : Owner.PLAYER;
  pressureBoard.setPiece(target.row, target.col, new Piece(PieceType.PAWN, targetOwner));

  return pressureBoard.getAllPieces(owner)
    .filter(({ row, col }) => row !== target.row || col !== target.col)
    .filter(({ row, col }) => moveCalculator.getMoves(pressureBoard, row, col, true)
      .some(move => move.row === target.row && move.col === target.col));
}
