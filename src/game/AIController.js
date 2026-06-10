import { MoveCalculator } from './MoveCalculator.js';
import { CheckDetector } from './CheckDetector.js';
import { SummonSystem } from './SummonSystem.js';
import { Piece } from './Piece.js';
import {
  Difficulty, Owner, PieceType, SUMMON_COSTS, PIECE_VALUES, MINIMAX_DEPTH,
} from '../config.js';

const SUMMONABLE_TYPES = [PieceType.PAWN, PieceType.KNIGHT, PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN];
const VERY_HARD_MINIMAX_DEPTH = MINIMAX_DEPTH + 1;

export function getSearchDepthForDifficulty(difficulty) {
  return difficulty === Difficulty.VERY_HARD ? VERY_HARD_MINIMAX_DEPTH : MINIMAX_DEPTH;
}

export class AIController {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.calc = new MoveCalculator();
    this.detector = new CheckDetector();
    this.summon = new SummonSystem();
  }

  getAction(board) {
    switch (this.difficulty) {
      case Difficulty.EASY:   return this._easyAction(board);
      case Difficulty.MEDIUM: return this._mediumAction(board);
      case Difficulty.HARD:   return this._hardAction(board);
      case Difficulty.VERY_HARD: return this._hardAction(board);
      default: return { type: 'pass' };
    }
  }

  _safeMove(board, move) {
    const clone = board.clone();
    clone.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
    return !this.detector.isInCheck(clone, Owner.AI);
  }

  getMove(board) {
    const allMoves = this._getAllMoves(board, Owner.AI);
    if (allMoves.length === 0) return null;
    const inCheck = this.detector.isInCheck(board, Owner.AI);
    switch (this.difficulty) {
      case Difficulty.EASY: {
        // 체크 상황이면 체크를 벗어나는 수 우선
        const safe = inCheck ? allMoves.filter(m => this._safeMove(board, m)) : allMoves;
        const pool = safe.length > 0 ? safe : allMoves;
        return { type: 'move', ...pool[Math.floor(Math.random() * pool.length)] };
      }
      case Difficulty.MEDIUM: {
        const safe = allMoves.filter(m => this._safeMove(board, m));
        const pool = safe.length > 0 ? safe : allMoves;
        const captures = pool.filter(m => board.getPiece(m.to.row, m.to.col) !== null);
        if (captures.length > 0) {
          captures.sort((a, b) =>
            PIECE_VALUES[board.getPiece(b.to.row, b.to.col).type] -
            PIECE_VALUES[board.getPiece(a.to.row, a.to.col).type]);
          return { type: 'move', ...captures[0] };
        }
        return { type: 'move', ...pool[Math.floor(Math.random() * pool.length)] };
      }
      case Difficulty.HARD: {
        const safeMoves = allMoves.filter(m => this._safeMove(board, m));
        const candidates = safeMoves.length > 0 ? safeMoves : allMoves;
        return this._searchBestMove(board, candidates);
      }
      case Difficulty.VERY_HARD: {
        const safeMoves = allMoves.filter(m => this._safeMove(board, m));
        const candidates = safeMoves.length > 0 ? safeMoves : allMoves;
        const mateMove = this._findImmediateCheckmateMove(board, candidates, Owner.PLAYER);
        if (mateMove) return { type: 'move', ...mateMove };
        return this._searchBestMove(board, candidates);
      }
      default: return null;
    }
  }

  _searchBestMove(board, candidates) {
    const depth = getSearchDepthForDifficulty(this.difficulty);
    const ordered = this._orderMoveCandidates(board, candidates, Owner.AI);
    let bestScore = -Infinity;
    let bestMove = ordered[0];
    for (const move of ordered) {
      const clone = board.clone();
      clone.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
      const score = this._minimax(clone, depth - 1, -Infinity, Infinity, false);
      if (score > bestScore) { bestScore = score; bestMove = move; }
    }
    return { type: 'move', ...bestMove };
  }

  _findImmediateCheckmateMove(board, moves, targetOwner) {
    for (const move of this._orderMoveCandidates(board, moves, Owner.AI)) {
      const clone = board.clone();
      clone.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
      if (this.detector.isCheckmate(clone, targetOwner)) return move;
    }
    return null;
  }

  _orderMoveCandidates(board, moves, owner) {
    const opponent = owner === Owner.AI ? Owner.PLAYER : Owner.AI;
    return [...moves].sort((a, b) => this._scoreMoveOrdering(board, b, opponent) - this._scoreMoveOrdering(board, a, opponent));
  }

  _scoreMoveOrdering(board, move, opponent) {
    const captured = board.getPiece(move.to.row, move.to.col);
    let score = captured ? (PIECE_VALUES[captured.type] || 0) * 10 : 0;
    const clone = board.clone();
    clone.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
    if (this.detector.isCheckmate(clone, opponent)) score += 10000;
    else if (this.detector.isInCheck(clone, opponent)) score += 50;
    return score;
  }

  getSummon(board) {
    const options = this._getSummonOptions(board, Owner.AI);
    if (options.length === 0) return null;
    switch (this.difficulty) {
      case Difficulty.EASY:
        return { type: 'summon', ...options[Math.floor(Math.random() * options.length)] };
      case Difficulty.MEDIUM:
        {
        const sorted = [...options].sort((a, b) => PIECE_VALUES[b.pieceType] - PIECE_VALUES[a.pieceType]);
        return { type: 'summon', ...sorted[0] };
      }
      case Difficulty.HARD:
      case Difficulty.VERY_HARD:
        return { type: 'summon', ...this._bestSummonOption(board, options, Owner.AI) };
      default: return null;
    }
  }

  // --- Easy: random move or random summon ---
  _easyAction(board) {
    const allMoves = this._getAllMoves(board, Owner.AI);
    const summonOptions = this._getSummonOptions(board, Owner.AI);
    const options = [...allMoves.map(m => ({ type: 'move', ...m })),
                     ...summonOptions.map(s => ({ type: 'summon', ...s }))];
    if (options.length === 0) return { type: 'pass' };
    return options[Math.floor(Math.random() * options.length)];
  }

  // --- Medium: capture if possible, else advance, summon cheap pieces ---
  _mediumAction(board) {
    const allMoves = this._getAllMoves(board, Owner.AI);
    // prefer capturing moves
    const captures = allMoves.filter(m => board.getPiece(m.to.row, m.to.col) !== null);
    if (captures.length > 0) {
      captures.sort((a, b) => {
        const va = PIECE_VALUES[board.getPiece(a.to.row, a.to.col).type] || 0;
        const vb = PIECE_VALUES[board.getPiece(b.to.row, b.to.col).type] || 0;
        return vb - va;
      });
      return { type: 'move', ...captures[0] };
    }
    // summon if affordable
    const summonOptions = this._getSummonOptions(board, Owner.AI);
    const affordable = summonOptions.filter(s => SUMMON_COSTS[s.pieceType] <= board.mana[Owner.AI]);
    if (affordable.length > 0) return { type: 'summon', ...affordable[Math.floor(Math.random() * affordable.length)] };
    // else random move
    if (allMoves.length > 0) return { type: 'move', ...allMoves[Math.floor(Math.random() * allMoves.length)] };
    return { type: 'pass' };
  }

  // --- Hard and Very Hard: minimax with alpha-beta ---
  _hardAction(board) {
    let bestScore = -Infinity;
    let bestAction = { type: 'pass' };
    const depth = getSearchDepthForDifficulty(this.difficulty);
    const actions = this._orderActions(board, this._generateActions(board, Owner.AI), Owner.AI);
    for (const action of actions) {
      const clone = this._applyAction(board.clone(), action, Owner.AI);
      if (this.difficulty === Difficulty.VERY_HARD && this.detector.isCheckmate(clone, Owner.PLAYER)) {
        return action;
      }
      const score = this._minimax(clone, depth - 1, -Infinity, Infinity, false);
      if (score > bestScore) { bestScore = score; bestAction = action; }
    }
    return bestAction;
  }

  _orderActions(board, actions, owner) {
    const opponent = owner === Owner.AI ? Owner.PLAYER : Owner.AI;
    return [...actions].sort((a, b) => this._scoreActionOrdering(board, b, owner, opponent) - this._scoreActionOrdering(board, a, owner, opponent));
  }

  _scoreActionOrdering(board, action, owner, opponent) {
    const clone = this._applyAction(board.clone(), action, owner);
    let score = this.detector.isCheckmate(clone, opponent) ? 10000 : 0;
    if (this.detector.isInCheck(clone, opponent)) score += 50;
    if (action.type === 'move') {
      const captured = board.getPiece(action.to.row, action.to.col);
      if (captured) score += (PIECE_VALUES[captured.type] || 0) * 10;
    } else if (action.type === 'summon') {
      score += (PIECE_VALUES[action.pieceType] || 0);
    }
    return score;
  }

  _minimax(board, depth, alpha, beta, maximizing) {
    const owner = maximizing ? Owner.AI : Owner.PLAYER;
    if (depth === 0) return this._evaluate(board);
    if (this.detector.isCheckmate(board, Owner.PLAYER)) return 10000;
    if (this.detector.isCheckmate(board, Owner.AI)) return -10000;

    const actions = this._generateActions(board, owner);
    if (actions.length === 0) return this._evaluate(board);

    if (maximizing) {
      let max = -Infinity;
      for (const action of actions) {
        const clone = this._applyAction(board.clone(), action, owner);
        const score = this._minimax(clone, depth - 1, alpha, beta, false);
        max = Math.max(max, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return max;
    } else {
      let min = Infinity;
      for (const action of actions) {
        const clone = this._applyAction(board.clone(), action, owner);
        const score = this._minimax(clone, depth - 1, alpha, beta, true);
        min = Math.min(min, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return min;
    }
  }

  _evaluate(board) {
    let score = 0;
    const center = [1, 2, 3];
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++) {
        const p = board.getPiece(r, c);
        if (!p) continue;
        const val = PIECE_VALUES[p.type] || 0;
        const centerBonus = (center.includes(r) && center.includes(c)) ? 0.1 : 0;
        score += p.owner === Owner.AI ? val + centerBonus : -(val + centerBonus);
      }
    if (this.detector.isInCheck(board, Owner.PLAYER)) score += 2;
    if (this.detector.isInCheck(board, Owner.AI)) score -= 2;
    return score;
  }

  _generateActions(board, owner) {
    const actions = [];
    const moves = this._getAllMoves(board, owner).filter(move => this._safeMoveForOwner(board, move, owner));
    actions.push(...moves.map(m => ({ type: 'move', ...m })));
    const summons = this._getSummonOptions(board, owner);
    actions.push(...summons.map(s => ({ type: 'summon', ...s })));
    return actions;
  }

  _safeMoveForOwner(board, move, owner) {
    const clone = board.clone();
    clone.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
    return !this.detector.isInCheck(clone, owner);
  }

  _getAllMoves(board, owner) {
    const result = [];
    for (const { row, col } of board.getAllPieces(owner)) {
      const moves = this.calc.getMoves(board, row, col);
      for (const to of moves) result.push({ from: { row, col }, to });
    }
    return result;
  }

  _getSummonOptions(board, owner) {
    const options = [];
    const squares = this.summon.getSummonableSquares(board, owner);
    for (const type of SUMMONABLE_TYPES) {
      if (this.summon.canSummon(board, owner, type)) {
        for (const sq of squares)
          options.push({ pieceType: type, to: sq });
      }
    }
    return options;
  }

  _bestSummonOption(board, options, owner) {
    const inCheck = this.detector.isInCheck(board, owner);
    let best = options[0];
    let bestScore = -Infinity;

    for (const option of options) {
      const clone = board.clone();
      this.summon.summon(clone, owner, option.pieceType, option.to.row, option.to.col);
      const resolvesCheck = !this.detector.isInCheck(clone, owner);
      if (inCheck && !resolvesCheck) continue;
      const opponent = owner === Owner.AI ? Owner.PLAYER : Owner.AI;
      const score = this._evaluate(clone)
        + (inCheck && resolvesCheck ? 50 : 0)
        + (this.detector.isInCheck(clone, opponent) ? 4 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = option;
      }
    }

    return best;
  }

  _applyAction(board, action, owner) {
    if (action.type === 'move')
      board.movePiece(action.from.row, action.from.col, action.to.row, action.to.col);
    else if (action.type === 'summon')
      this.summon.summon(board, owner, action.pieceType, action.to.row, action.to.col);
    board.addMana(owner, 2); // simulate next turn mana
    return board;
  }
}
