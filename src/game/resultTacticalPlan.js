import { Owner, PieceType } from '../config.js';

const MAJOR_PIECES = [PieceType.KNIGHT, PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN];
const PIECE_NAMES = Object.freeze({
  [PieceType.PAWN]: '병사',
  [PieceType.KNIGHT]: '기사',
  [PieceType.BISHOP]: '주교',
  [PieceType.ROOK]: '성채',
  [PieceType.QUEEN]: '여왕',
});

export function createBattleSummary(board) {
  if (!board?.getAllPieces) return null;
  return {
    mana: Number(board.mana?.[Owner.PLAYER]) || 0,
    summonCounts: { ...(board.summonCounts?.[Owner.PLAYER] || {}) },
    playerPieces: board.getAllPieces(Owner.PLAYER).map(({ piece }) => piece.type),
    enemyPieces: board.getAllPieces(Owner.AI).map(({ piece }) => piece.type),
  };
}

export function getNextBattlePlan({ playerWon = false, resultReason = null, battleSummary = null } = {}) {
  const summary = battleSummary || {};
  const summonCounts = summary.summonCounts || {};
  const playerPieces = Array.isArray(summary.playerPieces) ? summary.playerPieces : [];
  const enemyPieces = Array.isArray(summary.enemyPieces) ? summary.enemyPieces : [];
  const mana = Math.max(0, Number(summary.mana) || 0);
  const majorSummons = MAJOR_PIECES
    .map(type => ({ type, count: Math.max(0, Number(summonCounts[type]) || 0) }))
    .filter(entry => entry.count > 0)
    .sort((a, b) => b.count - a.count || MAJOR_PIECES.indexOf(a.type) - MAJOR_PIECES.indexOf(b.type));

  if (resultReason === 'timeout') {
    return {
      headline: '첫 소환을 기사 또는 주교로 고정',
      detail: '3마나 선택을 미리 정해 두고 이동 판단 시간을 줄이세요.',
      tone: 'warning',
    };
  }

  if (majorSummons.length === 0) {
    return {
      headline: '다음 판 첫 소환: 기사 또는 주교',
      detail: `${mana}마나를 남기기보다 왕 주변 탈출로를 먼저 넓히세요.`,
      tone: 'summon',
    };
  }

  if (!playerWon && playerPieces.length < enemyPieces.length) {
    return {
      headline: '편성: 병사 1개를 소환 거점으로 보존',
      detail: '초반 교환을 늦추고 후속 소환 칸을 왕 주변에 남기세요.',
      tone: 'warning',
    };
  }

  const anchor = PIECE_NAMES[majorSummons[0].type] || '주력 말';
  if (playerWon) {
    return {
      headline: `유지할 전개: ${anchor} 중심 소환`,
      detail: '같은 첫 소환을 유지하고 반대 방향 탈출 칸 하나를 비워 두세요.',
      tone: 'success',
    };
  }

  return {
    headline: `재편성: ${anchor} 뒤에 병사 방어선`,
    detail: '주력 말을 먼저 잃지 않도록 왕과 소환수 사이에 병사를 남기세요.',
    tone: 'warning',
  };
}
