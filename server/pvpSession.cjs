const BOARD_SIZE = 5;
const Owner = Object.freeze({ PLAYER: 'PLAYER', AI: 'AI' });
const PieceType = Object.freeze({
  KING: 'KING',
  QUEEN: 'QUEEN',
  ROOK: 'ROOK',
  BISHOP: 'BISHOP',
  KNIGHT: 'KNIGHT',
  PAWN: 'PAWN',
});
const SUMMON_COSTS = Object.freeze({ PAWN: 1, KNIGHT: 3, BISHOP: 3, ROOK: 5, QUEEN: 8 });
const MAX_MANA = 10;
const MANA_PER_TURN = 2;

function createPlayerIdentity({ account, steamId = null, side }) {
  return Object.freeze({
    side,
    accountName: String(account?.name || 'Player'),
    steamId: steamId ? String(steamId) : null,
  });
}

function emptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function clonePiece(piece) {
  return piece ? { type: piece.type, owner: piece.owner } : null;
}

function createInitialBoard() {
  const board = emptyBoard();
  board[0][2] = { type: PieceType.KING, owner: Owner.AI };
  board[1][0] = { type: PieceType.PAWN, owner: Owner.AI };
  board[1][1] = { type: PieceType.PAWN, owner: Owner.AI };
  board[1][3] = { type: PieceType.PAWN, owner: Owner.AI };
  board[1][4] = { type: PieceType.PAWN, owner: Owner.AI };
  board[4][2] = { type: PieceType.KING, owner: Owner.PLAYER };
  board[3][0] = { type: PieceType.PAWN, owner: Owner.PLAYER };
  board[3][1] = { type: PieceType.PAWN, owner: Owner.PLAYER };
  board[3][3] = { type: PieceType.PAWN, owner: Owner.PLAYER };
  board[3][4] = { type: PieceType.PAWN, owner: Owner.PLAYER };
  return board;
}

function inBounds(pos) {
  return Number.isInteger(pos?.row) && Number.isInteger(pos?.col)
    && pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

function otherSide(side) {
  return side === Owner.PLAYER ? Owner.AI : Owner.PLAYER;
}

function findKing(board, side) {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const piece = board[row][col];
      if (piece?.owner === side && piece.type === PieceType.KING) return { row, col };
    }
  }
  return null;
}

function isAdjacentToKing(board, side, to) {
  const king = findKing(board, side);
  if (!king) return false;
  return Math.abs(king.row - to.row) <= 1 && Math.abs(king.col - to.col) <= 1
    && !(king.row === to.row && king.col === to.col);
}

function canMove(board, side, from, to) {
  if (!inBounds(from) || !inBounds(to)) return false;
  const piece = board[from.row][from.col];
  const target = board[to.row][to.col];
  if (!piece || piece.owner !== side) return false;
  if (target?.owner === side) return false;

  const dr = to.row - from.row;
  const dc = to.col - from.col;
  if (piece.type === PieceType.KING) return Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0);
  if (piece.type === PieceType.PAWN) {
    const dir = side === Owner.PLAYER ? -1 : 1;
    if (dc === 0 && dr === dir && !target) return true;
    if (Math.abs(dc) === 1 && dr === dir && target?.owner === otherSide(side)) return true;
    return false;
  }
  return false;
}

function createPvpSession({ roomId, players }) {
  const board = createInitialBoard();
  const playerMap = Object.fromEntries(players.map(player => [player.side, player]));
  const mana = { [Owner.PLAYER]: 0, [Owner.AI]: 0 };
  let currentTurn = Owner.PLAYER;
  let result = null;

  function finish(winnerSide, loserSide, reason) {
    if (result) return { ok: false, error: 'game_over', result };
    result = { winnerSide, loserSide, reason };
    return { ok: true, result };
  }

  function applyCommand(side, command) {
    if (result) return { ok: false, error: 'game_over', result };
    if (!playerMap[side]) return { ok: false, error: 'unknown_side' };
    if (command?.type === 'resign') return finish(otherSide(side), side, 'resign');
    if (side !== currentTurn) return { ok: false, error: 'not_current_turn' };

    if (command?.type === 'move') {
      if (!inBounds(command.from) || !inBounds(command.to)) return { ok: false, error: 'out_of_bounds' };
      const piece = board[command.from.row][command.from.col];
      if (!piece || piece.owner !== side) return { ok: false, error: 'not_your_piece' };
      if (!canMove(board, side, command.from, command.to)) return { ok: false, error: 'illegal_move' };
      const captured = board[command.to.row][command.to.col];
      board[command.to.row][command.to.col] = piece;
      board[command.from.row][command.from.col] = null;
      if (captured?.type === PieceType.KING) return finish(side, otherSide(side), 'king_capture');
      return { ok: true, state: serializePvpState(api) };
    }

    if (command?.type === 'summon') {
      const pieceType = String(command.pieceType || '');
      const cost = SUMMON_COSTS[pieceType];
      if (!cost) return { ok: false, error: 'invalid_piece_type' };
      if (!inBounds(command.to)) return { ok: false, error: 'out_of_bounds' };
      if (board[command.to.row][command.to.col]) return { ok: false, error: 'occupied_square' };
      if (!isAdjacentToKing(board, side, command.to)) return { ok: false, error: 'not_adjacent_to_king' };
      if (mana[side] < cost) return { ok: false, error: 'not_enough_mana' };
      mana[side] -= cost;
      board[command.to.row][command.to.col] = { type: pieceType, owner: side };
      return { ok: true, state: serializePvpState(api) };
    }

    if (command?.type === 'endTurn') {
      currentTurn = otherSide(currentTurn);
      mana[currentTurn] = Math.min(MAX_MANA, mana[currentTurn] + MANA_PER_TURN);
      return { ok: true, state: serializePvpState(api) };
    }

    return { ok: false, error: 'unknown_command' };
  }

  function forfeit(side, reason = 'disconnect') {
    if (result) return { ok: false, error: 'game_over', result };
    if (!playerMap[side]) return { ok: false, error: 'unknown_side' };
    return finish(otherSide(side), side, reason);
  }

  const api = {
    roomId,
    players: playerMap,
    get board() { return board; },
    get mana() { return mana; },
    get currentTurn() { return currentTurn; },
    get result() { return result; },
    applyCommand,
    forfeit,
  };
  return api;
}

function serializePvpState(session) {
  return Object.freeze({
    roomId: session.roomId,
    currentTurn: session.currentTurn,
    mana: { ...session.mana },
    players: {
      [Owner.PLAYER]: session.players[Owner.PLAYER] || null,
      [Owner.AI]: session.players[Owner.AI] || null,
    },
    board: session.board.map(row => row.map(clonePiece)),
    result: session.result ? { ...session.result } : null,
  });
}

module.exports = {
  createPlayerIdentity,
  createPvpSession,
  serializePvpState,
};
