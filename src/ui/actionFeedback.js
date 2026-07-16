import { PieceType, TEXT_COLORS } from '../config.js';

const ACTION_PIECE_NAMES = Object.freeze({
  [PieceType.PAWN]: 'Pawn',
  [PieceType.KNIGHT]: 'Knight',
  [PieceType.BISHOP]: 'Bishop',
  [PieceType.ROOK]: 'Rook',
  [PieceType.QUEEN]: 'Queen',
  [PieceType.KING]: 'King',
});

export const ACTION_FEEDBACK_COLORS = Object.freeze({
  normal: TEXT_COLORS.PRIMARY,
  success: TEXT_COLORS.SUCCESS,
  summon: '#6fffe0',
});

export function getActionFeedback(payload = {}) {
  const action = payload.action || payload;
  const suffix = getRemainingActionText(payload);

  if (action.type === 'board-loop') {
    return { text: '1 Summon optional | 2 Move/Capture | Win: break enemy king', tone: 'normal', cue: 'WIN' };
  }

  if (action.type === 'move-preview') {
    return getMovePreviewFeedback(action);
  }

  if (action.type === 'summon-preview') {
    return getSummonPreviewFeedback(action);
  }

  if (action.type === 'summon') {
    return withTacticalCue({ text: formatSummonFeedback(action, suffix), tone: 'summon' }, action);
  }

  if (action.type === 'move' && action.capture) {
    return withTacticalCue({ text: formatMoveFeedback(action, suffix), tone: 'success' }, action);
  }

  if (action.type === 'move') {
    return withTacticalCue({ text: formatMoveFeedback(action, suffix), tone: 'normal' }, action);
  }

  return { text: suffix, tone: 'normal' };
}

export function formatActionFeedbackText(feedback = {}) {
  const text = String(feedback.text || '');
  return feedback.cue ? `[${feedback.cue}] ${text}` : text;
}

function getMovePreviewFeedback({ moveCount = 0, captureCount = 0 } = {}) {
  const moves = Math.max(0, Number(moveCount) || 0);
  const captures = Math.max(0, Number(captureCount) || 0);

  if (moves === 0) {
    return { text: 'No legal move | Pick another piece', tone: 'normal' };
  }

  if (captures > 0) {
    return { text: `Move options ${moves} | Capture options ${captures} | Pick a green tile`, tone: 'success', cue: 'CAP' };
  }

  return { text: `Move options ${moves} | Pick a green tile`, tone: 'normal', cue: 'POS' };
}

function getSummonPreviewFeedback({ summonableCount = 0, hasMoved = false } = {}) {
  const count = Math.max(0, Number(summonableCount) || 0);

  if (count === 0) {
    return { text: 'No summon tile | Move or end turn', tone: 'normal' };
  }

  if (hasMoved) {
    return { text: `Summon tiles ${count} | End after summon`, tone: 'summon', cue: 'SUM' };
  }

  return { text: `Summon tiles ${count} | Move left`, tone: 'summon', cue: 'SUM' };
}

function formatSummonFeedback(action, suffix) {
  const pieceName = ACTION_PIECE_NAMES[action.pieceType] || 'Piece';
  return [
    `${pieceName} summon`,
    formatManaDelta(action),
    formatCheckLayer(action),
    suffix,
  ].filter(Boolean).join(' | ');
}

function formatMoveFeedback(action, suffix) {
  return [
    action.capture ? `Capture ${ACTION_PIECE_NAMES[action.capturedPieceType] || 'piece'}` : 'Move complete',
    action.capture === false ? 'No capture' : null,
    formatCheckLayer(action),
    suffix,
  ].filter(Boolean).join(' | ');
}

function formatManaDelta({ manaBefore, manaAfter } = {}) {
  if (manaBefore === undefined || manaAfter === undefined) return null;
  return `Mana ${Number(manaBefore)}->${Number(manaAfter)}`;
}

function formatCheckLayer({ gaveCheck } = {}) {
  return gaveCheck ? 'CHECK threat' : null;
}

function withTacticalCue(feedback, action = {}) {
  const cue = getTacticalCue(action);
  return cue ? { ...feedback, cue } : feedback;
}

function getTacticalCue(action = {}) {
  if (action.winning || action.capturedPieceType === PieceType.KING) return 'WIN';
  if (action.gaveCheck) return 'CHK';
  if (action.type === 'summon') return 'SUM';
  if (action.capture) return 'CAP';
  if (action.type === 'move') return 'POS';
  return null;
}

function getRemainingActionText({ hasMoved = false, hasSummoned = false } = {}) {
  if (hasMoved && hasSummoned) return 'End ready';
  if (hasMoved) return 'Summon optional / End OK';
  if (hasSummoned) return 'Move left';
  return 'Choose action';
}
