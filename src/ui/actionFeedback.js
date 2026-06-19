import { PieceType, TEXT_COLORS } from '../config.js';

const ACTION_PIECE_NAMES = Object.freeze({
  [PieceType.PAWN]: '병사',
  [PieceType.KNIGHT]: '기사',
  [PieceType.BISHOP]: '주교',
  [PieceType.ROOK]: '성채',
  [PieceType.QUEEN]: '여왕',
  [PieceType.KING]: '왕',
});

export const ACTION_FEEDBACK_COLORS = Object.freeze({
  normal: TEXT_COLORS.PRIMARY,
  success: TEXT_COLORS.SUCCESS,
  summon: '#6fffe0',
});

export function getActionFeedback(payload = {}) {
  const action = payload.action || payload;
  const suffix = getRemainingActionText(payload);

  if (action.type === 'summon') {
    const pieceName = ACTION_PIECE_NAMES[action.pieceType] || '말';
    return { text: `${pieceName} 소환 · ${suffix}`, tone: 'summon' };
  }

  if (action.type === 'move' && action.capture) {
    return { text: `처치 성공 · ${suffix}`, tone: 'success' };
  }

  if (action.type === 'move') {
    return { text: `이동 완료 · ${suffix}`, tone: 'normal' };
  }

  return { text: suffix, tone: 'normal' };
}

function getRemainingActionText({ hasMoved = false, hasSummoned = false } = {}) {
  if (hasMoved && hasSummoned) return '턴 종료 준비';
  if (hasMoved) return '소환 가능';
  if (hasSummoned) return '이동 가능';
  return '행동 선택';
}
