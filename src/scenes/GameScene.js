// src/scenes/GameScene.js
import { Board } from '../game/Board.js';
import { Piece } from '../game/Piece.js';
import { MoveCalculator } from '../game/MoveCalculator.js';
import { CheckDetector } from '../game/CheckDetector.js';
import { SummonSystem } from '../game/SummonSystem.js';
import { AIController } from '../game/AIController.js';
import { getAIThinkDelay } from '../game/aiTiming.js';
import { formatBotLabel } from '../game/botProfiles.js';
import { createSteamService } from '../services/SteamService.js';
import {
  PieceType, Owner, COLORS, LAYOUT, MANA_PER_TURN, TURN_TIME_LIMIT,
  BOARD_SIZE, Difficulty,
} from '../config.js';
import { getTurnHint, UI_ASSETS, UI_COPY } from '../ui/visuals.js';
import { formatActionFeedbackText, getActionFeedback } from '../ui/actionFeedback.js';
import { preloadActionSfx, playActionSfx } from '../audio/actionSfx.js';
import { playCaptureEffect, playCheckAlert, playCheckmateAlert, playCheckmateRevealEffect, playPromotionEffect } from '../ui/effects.js';
import { readSinglePlayerRating, SINGLE_PLAYER_MMR_DEFAULT } from '../game/singlePlayerRating.js';

const State = {
  WAITING: 'WAITING',
  SELECTED: 'SELECTED',
  SUMMON_MODE: 'SUMMON_MODE',
  AI_TURN: 'AI_TURN',
  GAME_OVER: 'GAME_OVER',
};

const PIECE_TYPES = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  preload() {
    for (const t of PIECE_TYPES) {
      this.load.image(`${t}_w`, `assets/pieces/${t}_w.png`);
      this.load.image(`${t}_d`, `assets/pieces/${t}_d.png`);
    }
    this.load.image('ui_battle_entry_plate', 'assets/ui/battle-entry-plate.png');
    preloadActionSfx(this);
  }

  init(data) {
    this.difficulty = data.difficulty;
    this.playerPlacements = data.playerPlacements || [];
    this.tutorialMode = data.tutorialMode || false;
    this.aiProfile = data.aiProfile || null;
    this.multiplayerMode = data.multiplayerMode || 'single';
    this.pvpSide = data.pvpSide || null;
    this.pvpRoomId = data.pvpRoomId || null;
    this.pvpSession = data.pvpSession || null;
    this.pvpSocket = data.pvpSocket || null;
  }

  create() {
    this.board = new Board();
    this.calc = new MoveCalculator();
    this.detector = new CheckDetector();
    this.summonSys = new SummonSystem();
    this.ai = new AIController(this.difficulty);
    this.achievements = createSteamService();
    this.achievements.startMatch();
    this.state = State.WAITING;
    this.selectedCell = null;
    this.highlightGraphics = [];
    this.pieceObjects = {};
    this.clockTimes = {
      [Owner.PLAYER]: TURN_TIME_LIMIT,
      [Owner.AI]: TURN_TIME_LIMIT,
    };
    this.timeLeft = this.clockTimes[Owner.PLAYER];
    this.pendingSummonType = null;
    this.turnTimer = null;
    this.idleWarningTimer = null;
    this.idleWarningLossTimer = null;
    this.aiThinkTimer = null;
    this.gameOverTransitionTimer = null;
    this.idleSeconds = 0;
    this.idleWarningShown = false;
    this.hasMoved = false;
    this.hasSummoned = false;
    this.fogGraphics = [];
    this.revealAllBoard = false;
    this.animating = false;
    this.checkRing = null;
    this.currentHintMode = 'default';
    this.summonedCells = new Set();
    this.entryIntroShown = false;

    this._drawStage();
    this._setupBoard();
    this._drawBoard();
    const boardCX = LAYOUT.BOARD_OFFSET_X + (BOARD_SIZE * LAYOUT.CELL_SIZE) / 2;
    const boardCY = LAYOUT.BOARD_OFFSET_Y + (BOARD_SIZE * LAYOUT.CELL_SIZE) / 2;
    this.aiOverlay = this.add.rectangle(
      boardCX, boardCY,
      BOARD_SIZE * LAYOUT.CELL_SIZE, BOARD_SIZE * LAYOUT.CELL_SIZE,
      0x000000,
    ).setDepth(1).setAlpha(0);
    this.tutorialLocked = false;
    this._refreshBoard();
    this.events.once('shutdown', this.shutdown, this);
    this.scene.launch('UI');
    this.events.on('tutorial-complete', () => this.achievements.recordTutorialComplete());
    this.input.on('pointerdown', this._onPointerDown, this);
    this._attachPvpSocket();
    const firstPlayer = this._determineFirstPlayer();
    const secondPlayer = firstPlayer === Owner.PLAYER ? Owner.AI : Owner.PLAYER;
    this.board.addMana(secondPlayer, 1);
    this._startTurn(firstPlayer);
    if (this.tutorialMode) this.scene.launch('Tutorial');
  }

  _determineFirstPlayer() {
    if (this.pvpSession?.currentTurn) return this.pvpSession.currentTurn;
    const playerMmr = readSinglePlayerRating();
    const aiMmr = SINGLE_PLAYER_MMR_DEFAULT;
    if (playerMmr < aiMmr) return Owner.PLAYER;
    if (playerMmr > aiMmr) return Owner.AI;
    return Math.random() < 0.5 ? Owner.PLAYER : Owner.AI;
  }

  _drawStage() {
    const stageKey = this.textures.exists(UI_ASSETS.gameBackground.key)
      ? UI_ASSETS.gameBackground.key
      : UI_ASSETS.stageBackground.key;
    if (this.textures.exists(stageKey)) {
      this.add.image(LAYOUT.GAME_WIDTH / 2, LAYOUT.GAME_HEIGHT / 2, stageKey)
        .setDisplaySize(LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT)
        .setDepth(-10);
    } else {
      this.add.rectangle(LAYOUT.GAME_WIDTH / 2, LAYOUT.GAME_HEIGHT / 2, LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT, COLORS.BACKDROP);
    }
    this.add.rectangle(LAYOUT.GAME_WIDTH / 2, LAYOUT.GAME_HEIGHT / 2, LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT, COLORS.PANEL_BG, 0.2);
    const boardFrameW = BOARD_SIZE * LAYOUT.CELL_SIZE + 44;
    const boardFrameX = LAYOUT.BOARD_OFFSET_X - 22;
    const boardFrameY = LAYOUT.BOARD_OFFSET_Y - 22;
    if (this.textures.exists(UI_ASSETS.gameBoardFrame.key)) {
      this.add.image(boardFrameX + boardFrameW / 2, boardFrameY + boardFrameW / 2, UI_ASSETS.gameBoardFrame.key)
        .setDisplaySize(boardFrameW, boardFrameW)
        .setDepth(-1);
    } else {
      const g = this.add.graphics();
      g.fillStyle(COLORS.PANEL_DEEP, 0.78);
      g.fillRoundedRect(boardFrameX, boardFrameY, boardFrameW, boardFrameW, 10);
      g.lineStyle(3, COLORS.PANEL_EDGE, 0.74);
      g.strokeRoundedRect(boardFrameX, boardFrameY, boardFrameW, boardFrameW, 10);
      g.lineStyle(1, COLORS.GOLD, 0.25);
      g.strokeRoundedRect(LAYOUT.BOARD_OFFSET_X - 11, LAYOUT.BOARD_OFFSET_Y - 11,
        BOARD_SIZE * LAYOUT.CELL_SIZE + 22, BOARD_SIZE * LAYOUT.CELL_SIZE + 22, 4);
    }
  }

  _setupBoard() {
    if (this.multiplayerMode === 'pvp' && this.pvpSession?.board) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const piece = this.pvpSession.board[r]?.[c];
          this.board.setPiece(r, c, piece ? new Piece(piece.type, piece.owner) : null);
        }
      }
      this.board.currentTurn = this.pvpSession.currentTurn || Owner.PLAYER;
      this.board.mana = { ...this.board.mana, ...(this.pvpSession.mana || {}) };
      return;
    }

    this.board.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
    this.board.setPiece(1, 0, new Piece(PieceType.PAWN, Owner.AI));
    this.board.setPiece(1, 1, new Piece(PieceType.PAWN, Owner.AI));
    this.board.setPiece(1, 3, new Piece(PieceType.PAWN, Owner.AI));
    this.board.setPiece(1, 4, new Piece(PieceType.PAWN, Owner.AI));
    this.board.setPiece(4, 2, new Piece(PieceType.KING, Owner.PLAYER));
    for (const { row, col } of this.playerPlacements)
      this.board.setPiece(row, col, new Piece(PieceType.PAWN, Owner.PLAYER));
  }

  _drawBoard() {
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) {
        const x = LAYOUT.BOARD_OFFSET_X + c * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
        const y = LAYOUT.BOARD_OFFSET_Y + r * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
        const isLight = (r + c) % 2 === 0;
        const key = isLight ? UI_ASSETS.gameBoardCellLight.key : UI_ASSETS.gameBoardCellDark.key;
        const cell = this.textures.exists(key)
          ? this.add.image(x, y, key).setDisplaySize(LAYOUT.CELL_SIZE - 2, LAYOUT.CELL_SIZE - 2)
          : this.add.rectangle(x, y, LAYOUT.CELL_SIZE - 2, LAYOUT.CELL_SIZE - 2, isLight ? 0x5e6470 : 0x171d27);
        cell.setAlpha(isLight ? 0.94 : 0.98);
        cell.setInteractive({ useHandCursor: true });
        cell.on('pointerdown', () => this._onCellClick(r, c));
      }
  }

  _refreshBoard() {
    this._renderAllPieces();
    this._renderFog();
  }

  _renderAllPieces() {
    Object.values(this.pieceObjects).forEach(o => o.destroy());
    this.pieceObjects = {};
    const visible = this._getVisibleCells();
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = this.board.getPiece(r, c);
        if (piece && (piece.owner === Owner.PLAYER || visible.has(`${r},${c}`)))
          this._renderPiece(r, c, piece);
      }
  }

  _getVisibleCells() {
    const visible = new Set();
    if (this.revealAllBoard) {
      for (let r = 0; r < BOARD_SIZE; r++)
        for (let c = 0; c < BOARD_SIZE; c++)
          visible.add(`${r},${c}`);
      return visible;
    }
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = this.board.getPiece(r, c);
        if (!piece || piece.owner !== Owner.PLAYER) continue;
        visible.add(`${r},${c}`);
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE)
              visible.add(`${nr},${nc}`);
          }
        const moves = this.calc.getMoves(this.board, r, c);
        for (const m of moves) visible.add(`${m.row},${m.col}`);
      }
    const threats = this.detector.getThreats(this.board, Owner.PLAYER);
    for (const t of threats) visible.add(`${t.row},${t.col}`);
    return visible;
  }

  _renderFog() {
    this.fogGraphics.forEach(g => g.destroy());
    this.fogGraphics = [];
    if (this.revealAllBoard) return;
    const visible = this._getVisibleCells();
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!visible.has(`${r},${c}`)) {
          const x = LAYOUT.BOARD_OFFSET_X + c * LAYOUT.CELL_SIZE;
          const y = LAYOUT.BOARD_OFFSET_Y + r * LAYOUT.CELL_SIZE;
          const fog = this.textures.exists(UI_ASSETS.gameBoardFogCell.key)
            ? this.add.image(x + LAYOUT.CELL_SIZE / 2, y + LAYOUT.CELL_SIZE / 2, UI_ASSETS.gameBoardFogCell.key)
              .setDisplaySize(LAYOUT.CELL_SIZE, LAYOUT.CELL_SIZE)
            : this.add.rectangle(x + LAYOUT.CELL_SIZE / 2, y + LAYOUT.CELL_SIZE / 2, LAYOUT.CELL_SIZE, LAYOUT.CELL_SIZE, 0x030711, 0.86);
          fog.setDepth(2);
          this.fogGraphics.push(fog);
        }
      }
  }

  _renderPiece(r, c, piece) {
    const { x, y: cellCenterY } = this._getCellCenter(r, c);
    const renderPos = this._getPieceRenderPosition(r, c, piece);
    const key = `${piece.type.toLowerCase()}_${piece.owner === Owner.PLAYER ? 'w' : 'd'}`;
    const displaySize = this._getPieceDisplaySize(piece);
    const shadowWidth = piece.type === PieceType.PAWN ? LAYOUT.PIECE_SHADOW_WIDTH : LAYOUT.NON_PAWN_PIECE_SHADOW_WIDTH;
    const shadow = this.textures?.exists?.(UI_ASSETS.gamePieceShadow.key)
      ? this.add.image(x + 2, cellCenterY + LAYOUT.CELL_SIZE * 0.34, UI_ASSETS.gamePieceShadow.key)
        .setDisplaySize(shadowWidth, LAYOUT.PIECE_SHADOW_HEIGHT * 2.7)
        .setAlpha(0.72)
      : this.add.ellipse(
        x + 2,
        cellCenterY + LAYOUT.CELL_SIZE * 0.34,
        shadowWidth,
        LAYOUT.PIECE_SHADOW_HEIGHT,
        0x000000,
        0.34,
      );
    shadow.setDepth(3);
    const obj = this.add.image(renderPos.x, renderPos.y, key)
      .setDisplaySize(displaySize, displaySize)
      .setDepth(4);
    this.pieceObjects[`${r},${c}`] = {
      destroy: () => { shadow.destroy(); obj.destroy(); },
      setVisible: visible => { shadow.setVisible(visible); obj.setVisible(visible); },
    };
  }

  _getPieceDisplaySize(piece) {
    return piece?.type === PieceType.PAWN ? LAYOUT.PIECE_SIZE : LAYOUT.NON_PAWN_PIECE_SIZE;
  }

  _getCellCenter(r, c) {
    return {
      x: LAYOUT.BOARD_OFFSET_X + c * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2,
      y: LAYOUT.BOARD_OFFSET_Y + r * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2,
    };
  }

  _getPieceRenderPosition(r, c, piece) {
    const center = this._getCellCenter(r, c);
    const displaySize = this._getPieceDisplaySize(piece);
    const bottomY = center.y + LAYOUT.NON_PAWN_PIECE_SIZE / 2 - LAYOUT.PIECE_BOARD_LIFT;
    return {
      x: center.x,
      y: bottomY - displaySize / 2,
    };
  }

  _clearHighlights() {
    this.highlightGraphics.forEach(g => g.destroy());
    this.highlightGraphics = [];
  }

  _highlightCells(cells, color, alpha = 0.45) {
    const assetKey = this._getHighlightAssetKey(color);
    for (const { row, col } of cells) {
      const x = LAYOUT.BOARD_OFFSET_X + col * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
      const y = LAYOUT.BOARD_OFFSET_Y + row * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
      const highlight = assetKey && this.textures.exists(assetKey)
        ? this.add.image(x, y, assetKey).setDisplaySize(LAYOUT.CELL_SIZE - 8, LAYOUT.CELL_SIZE - 8)
        : this.add.rectangle(x, y, LAYOUT.CELL_SIZE - 8, LAYOUT.CELL_SIZE - 8, color, alpha);
      highlight.setAlpha(assetKey ? Math.max(0.52, alpha + 0.12) : alpha);
      highlight.setDepth(3);
      this.highlightGraphics.push(highlight);
    }
  }

  _getHighlightAssetKey(color) {
    if (color === COLORS.THREAT) return UI_ASSETS.gameCellHighlightThreat.key;
    if (color === COLORS.SUMMON_HIGHLIGHT) return UI_ASSETS.gameCellHighlightSummon.key;
    if (color === COLORS.SELECTED) return UI_ASSETS.gameCellHighlightSelected.key;
    if (color === COLORS.MOVABLE_PIECE) return UI_ASSETS.gameCellHighlightMovable.key;
    return UI_ASSETS.gameCellHighlightMove.key;
  }

  _onPointerDown(pointer) {
    if (!pointer?.rightButtonDown?.()) return;
    if (this.state !== State.SELECTED) return;
    if (this.animating || this.tutorialLocked) return;
    this._recordPlayerInput();
    this._cancelSelectedMove();
  }

  _cancelSelectedMove() {
    this._clearHighlights();
    this.state = State.WAITING;
    this.selectedCell = null;
    this._showMovablePieces();
    this._showThreatsIfInCheck();
    this._updateHint('default');
  }

  _isPvpMode() {
    return this.multiplayerMode === 'pvp';
  }

  _localOwner() {
    return this._isPvpMode() ? (this.pvpSide || Owner.PLAYER) : Owner.PLAYER;
  }

  _sendPvpCommand(command) {
    if (!this._isPvpMode() || !this.pvpSocket) return false;
    this.pvpSocket.send(JSON.stringify({ type: 'pvpCommand', command }));
    return true;
  }

  _attachPvpSocket() {
    if (!this._isPvpMode() || !this.pvpSocket?.addEventListener) return;
    this.pvpSocket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.type === 'pvpState') this._applyPvpSnapshot(message.state);
      if (message.type === 'pvpResult') {
        const winner = message.result?.winnerSide || Owner.AI;
        this._gameOver(winner, message.result?.reason || 'pvp');
      }
    });
  }

  _applyPvpSnapshot(state) {
    if (!state?.board) return;
    this.pvpSession = state;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = state.board[r]?.[c];
        this.board.setPiece(r, c, piece ? new Piece(piece.type, piece.owner) : null);
      }
    }
    this.board.currentTurn = state.currentTurn || Owner.PLAYER;
    this.board.mana = { ...this.board.mana, ...(state.mana || {}) };
    this.hasMoved = false;
    this.hasSummoned = false;
    this.state = State.WAITING;
    this.selectedCell = null;
    this.pendingSummonType = null;
    this._clearHighlights();
    this._refreshBoard();
    this._emitPlayerAction();
  }

  _onCellClick(r, c) {
    if (this.state === State.AI_TURN || this.state === State.GAME_OVER) return;
    if (this.animating) return;
    if (this.tutorialLocked) return;
    this._recordPlayerInput();

    if (this.state === State.SUMMON_MODE) {
      const squares = this.summonSys.getSummonableSquares(this.board, this._localOwner());
      if (squares.some(s => s.row === r && s.col === c)) {
        if (this._sendPvpCommand({ type: 'summon', pieceType: this.pendingSummonType, to: { row: r, col: c } })) {
          this._clearHighlights();
          this.state = State.WAITING;
          this.pendingSummonType = null;
          return;
        }
        const summonedType = this.pendingSummonType;
        const manaBefore = this.board.mana[Owner.PLAYER];
        this.summonSys.summon(this.board, Owner.PLAYER, summonedType, r, c);
        playActionSfx(this, { type: 'summon' });
        this.achievements.recordSummon(summonedType);
        this.hasSummoned = true;
        this.summonedCells.add(`${r},${c}`);
        this._clearHighlights();
        this.state = State.WAITING;
        this.pendingSummonType = null;
        this._refreshBoard();
        this._animateSummon(r, c);
        const gaveCheck = this.detector.isInCheck(this.board, Owner.AI);
          if (gaveCheck) this.achievements.recordCheck();
        if (this.tutorialMode) this.events.emit('tutorial-summoned');
        this._checkGameOver();
        if (this.state === State.GAME_OVER) return;
        if (this.hasMoved) {
          if (!this.tutorialMode) { this._endTurn(); return; }
          this._emitPlayerAction({
            type: 'summon',
            pieceType: summonedType,
            manaBefore,
            manaAfter: this.board.mana[Owner.PLAYER],
            gaveCheck,
          });
          return;
        }
        this._showMovablePieces();
        this._showThreatsIfInCheck();
        this._emitPlayerAction({
          type: 'summon',
          pieceType: summonedType,
          manaBefore,
          manaAfter: this.board.mana[Owner.PLAYER],
          gaveCheck,
        });
        return;
      }
      this._clearHighlights();
      this.state = State.WAITING;
      this.pendingSummonType = null;
      this._showMovablePieces();
      this._updateHint('default');
      this.events.emit('summon-cancel');
      return;
    }

    if (this.state === State.SELECTED) {
      if (this.selectedCell.row === r && this.selectedCell.col === c) {
        this._cancelSelectedMove();
        return;
      }
      const moves = this.calc.getMoves(this.board, this.selectedCell.row, this.selectedCell.col);
      if (moves.some(m => m.row === r && m.col === c)) {
        const capturedPiece = this.board.getPiece(r, c);
        const isCapture = !!capturedPiece;
        const { row: fr, col: fc } = this.selectedCell;
        if (this._sendPvpCommand({ type: 'move', from: { row: fr, col: fc }, to: { row: r, col: c } })) {
          this._clearHighlights();
          this.state = State.WAITING;
          this.selectedCell = null;
          return;
        }
        this._clearHighlights();
        this.state = State.WAITING;
        this.selectedCell = null;
        this.animating = true;
        this._animateMove(fr, fc, r, c, isCapture, () => {
          this.animating = false;
          this.board.movePiece(fr, fc, r, c);
          playActionSfx(this, { type: 'move', capture: isCapture });
          if (isCapture) this.achievements.recordCapture();
          this.hasMoved = true;
          if (this.tutorialMode) this.events.emit('tutorial-piece-moved');
          this._checkPromotion();
          this._refreshBoard();
          const gaveCheck = this.detector.isInCheck(this.board, Owner.AI);
          if (gaveCheck) this.achievements.recordCheck();
          this._checkGameOver();
          if (this.state === State.GAME_OVER) return;
          if (this.hasSummoned || this.timeLeft <= 0) {
            if (!this.tutorialMode) { this._endTurn(); return; }
            this._emitPlayerAction({
              type: 'move',
              capture: isCapture,
              capturedPieceType: capturedPiece?.type,
              gaveCheck,
            });
            return;
          }
          this._showThreatsIfInCheck();
          this._emitPlayerAction({
            type: 'move',
            capture: isCapture,
            capturedPieceType: capturedPiece?.type,
            gaveCheck,
          });
        });
        return;
      }
      this._cancelSelectedMove();
    }

    const piece = this.board.getPiece(r, c);
    if (piece && piece.owner === this._localOwner()) {
      if (this.hasMoved) return;
      if (this.summonedCells.has(`${r},${c}`)) return;
      this.state = State.SELECTED;
      this.selectedCell = { row: r, col: c };
      const moves = this.calc.getMoves(this.board, r, c);
      this._clearHighlights();
      this._highlightCells([{ row: r, col: c }], COLORS.SELECTED);
      this._highlightCells(moves, COLORS.MOVE_HIGHLIGHT);
      this._showThreatsIfInCheck();
      this._showMovePreviewFeedback(moves);
      playActionSfx(this, 'piece-select');
      if (this.tutorialMode) this.events.emit('tutorial-piece-selected');
    }
  }

  _animateMove(fr, fc, tr, tc, isCapture, callback) {
    const fromCenter = this._getCellCenter(fr, fc);
    const toCenter = this._getCellCenter(tr, tc);
    const piece = this.board.getPiece(fr, fc);

    if (isCapture)
      playCaptureEffect(this, toCenter.x, toCenter.y, { owner: this.board.getPiece(tr, tc)?.owner });

    if (!piece) { callback(); return; }
    const origObj = this.pieceObjects[`${fr},${fc}`];
    if (origObj) origObj.setVisible(false);

    const key = `${piece.type.toLowerCase()}_${piece.owner === Owner.PLAYER ? 'w' : 'd'}`;
    const displaySize = this._getPieceDisplaySize(piece);
    const fromPos = this._getPieceRenderPosition(fr, fc, piece);
    const toPos = this._getPieceRenderPosition(tr, tc, piece);
    const animPiece = this.add.image(fromPos.x, fromPos.y, key)
      .setDisplaySize(displaySize, displaySize)
      .setDepth(6);

    this.tweens.add({
      targets: animPiece,
      x: toPos.x,
      y: toPos.y,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        animPiece.destroy();
        callback();
      },
    });
  }

  _animateSummon(r, c) {
    const x = LAYOUT.BOARD_OFFSET_X + c * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
    const y = LAYOUT.BOARD_OFFSET_Y + r * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
    const flash = this.add.graphics();
    flash.fillStyle(COLORS.GOLD, 0.92);
    flash.fillCircle(x, y, LAYOUT.CELL_SIZE / 2);
    flash.lineStyle(3, 0xffffff, 0.8);
    flash.strokeCircle(x, y, LAYOUT.CELL_SIZE / 2 + 4);
    flash.setDepth(6);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 420, onComplete: () => flash.destroy() });
  }

  _animateCheck() {
    const kingPos = this.board.findKing(Owner.PLAYER);
    if (!kingPos) return;
    if (this.checkRing) { this.checkRing.destroy(); this.checkRing = null; }
    const x = LAYOUT.BOARD_OFFSET_X + kingPos.col * LAYOUT.CELL_SIZE;
    const y = LAYOUT.BOARD_OFFSET_Y + kingPos.row * LAYOUT.CELL_SIZE;
    const cx = x + LAYOUT.CELL_SIZE / 2;
    const cy = y + LAYOUT.CELL_SIZE / 2;
    playCheckAlert(this, cx, cy);
    const ring = this.textures.exists(UI_ASSETS.gameCellHighlightThreat.key)
      ? this.add.image(cx, cy, UI_ASSETS.gameCellHighlightThreat.key).setDisplaySize(LAYOUT.CELL_SIZE + 6, LAYOUT.CELL_SIZE + 6)
      : this.add.rectangle(cx, cy, LAYOUT.CELL_SIZE - 6, LAYOUT.CELL_SIZE - 6, COLORS.THREAT, 0.38);
    ring.setDepth(5);
    this.checkRing = ring;
    this.tweens.add({ targets: ring, alpha: 0.25, scaleX: 1.1, scaleY: 1.1, duration: 300, yoyo: true, repeat: -1 });
  }

  _animatePromotion(r, c, owner) {
    const x = LAYOUT.BOARD_OFFSET_X + c * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
    const y = LAYOUT.BOARD_OFFSET_Y + r * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
    playPromotionEffect(this, x, y, { owner });
  }

  _clearCheckRing() {
    if (this.checkRing) { this.checkRing.destroy(); this.checkRing = null; }
  }

  _showBattleEntryOverlay(owner) {
    const cx = LAYOUT.BOARD_OFFSET_X + (BOARD_SIZE * LAYOUT.CELL_SIZE) / 2;
    const cy = LAYOUT.BOARD_OFFSET_Y + (BOARD_SIZE * LAYOUT.CELL_SIZE) / 2;
    const enemyName = formatBotLabel(this.aiProfile) || UI_COPY.game.aiTurn;
    const panelW = 336;
    const panelH = 228;

    const veil = this.add.rectangle(
      LAYOUT.GAME_WIDTH / 2, LAYOUT.GAME_HEIGHT / 2,
      LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT,
      0x02040a, 0.46,
    ).setDepth(12).setAlpha(0);

    const plate = this.textures?.exists?.('ui_battle_entry_plate')
      ? this.add.image(cx, cy, 'ui_battle_entry_plate').setDisplaySize(panelW + 24, panelH).setDepth(14).setAlpha(0)
      : null;
    const rune = plate ? null : this.add.circle(cx, cy, 134, 0x37d9ff, 0.11).setDepth(13).setAlpha(0);
    const outer = plate || this.add.rectangle(cx, cy, panelW, panelH, COLORS.GOLD, 0.96).setDepth(14).setAlpha(0);
    const inner = plate ? null : this.add.rectangle(cx, cy, panelW - 10, panelH - 10, 0x101728, 0.95).setDepth(14).setAlpha(0);
    const topLine = plate ? null : this.add.rectangle(cx, cy - 96, panelW - 38, 2, 0xf7c84b, 0.82).setDepth(15).setAlpha(0);
    const bottomLine = plate ? null : this.add.rectangle(cx, cy + 96, panelW - 38, 2, 0x37d9ff, 0.5).setDepth(15).setAlpha(0);
    const textBand = plate ? null : this.add.rectangle(cx, cy - 58, panelW - 54, 64, 0x050812, 0.42).setDepth(15).setAlpha(0);
    const duelDivider = plate ? null : this.add.rectangle(cx, cy - 12, panelW - 82, 1, 0xf7c84b, 0.44).setDepth(15).setAlpha(0);

    const title = this.add.text(cx, cy - 72, '전투 시작', {
      fontSize: '30px',
      color: '#fff5c7',
      fontStyle: 'bold',
      stroke: '#261407',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(16).setAlpha(0);

    const subtitle = this.add.text(cx, cy - 42, '정을 지키고 전장을 장악하세요', {
      fontSize: '14px',
      color: '#d9e6ff',
      stroke: '#050812',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(16).setAlpha(0);

    const playerKing = this.add.image(cx - 102, cy + 34, 'king_w')
      .setDisplaySize(60, 60)
      .setDepth(16)
      .setAlpha(0);
    const enemyKing = this.add.image(cx + 102, cy + 34, 'king_d')
      .setDisplaySize(60, 60)
      .setDepth(16)
      .setAlpha(0);

    const playerTag = this.add.text(cx - 102, cy + 84, 'PLAYER', {
      fontSize: '12px', color: '#6fffe0', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(16).setAlpha(0);
    const enemyTag = this.add.text(cx + 102, cy + 84, enemyName, {
      fontSize: '12px', color: '#ff9a70', fontStyle: 'bold',
      fixedWidth: 96,
      align: 'center',
    }).setOrigin(0.5).setDepth(16).setAlpha(0);

    const versus = this.add.text(cx, cy + 34, 'VS', {
      fontSize: '24px',
      color: '#f7c84b',
      fontStyle: 'bold',
      stroke: '#050812',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(17).setAlpha(0);

    const sparks = [];
    if (!plate) {
      for (let i = 0; i < 10; i++) {
        const offsetX = -144 + i * 32;
        const offsetY = i % 2 === 0 ? -108 : 108;
        sparks.push(this.add.circle(cx + offsetX, cy + offsetY, i % 3 === 0 ? 4 : 3,
          i % 2 === 0 ? 0xf7c84b : 0x37d9ff, 0.8).setDepth(16).setAlpha(0));
      }
    }

    const targets = [
      veil, rune, outer, inner, topLine, bottomLine, textBand, duelDivider, title, subtitle,
      playerKing, enemyKing, playerTag, enemyTag, versus, ...sparks,
    ].filter(Boolean);

    rune?.setScale(0.9);

    this.tweens.add({
      targets,
      alpha: 1,
      duration: 210,
      ease: 'Power2',
    });
    if (rune) {
      this.tweens.add({
        targets: [rune],
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 720,
        ease: 'Sine.easeInOut',
        yoyo: true,
      });
    }
    this.tweens.add({
      targets: [playerKing, enemyKing],
      displayWidth: 68,
      displayHeight: 68,
      duration: 260,
      ease: 'Back.easeOut',
    });
    this.time.delayedCall(950, () => {
      this.tweens.add({
        targets,
        alpha: 0,
        duration: 260,
        ease: 'Power2',
        onComplete: () => targets.forEach(target => target.destroy()),
      });
    });
  }

  _showTurnBanner(owner) {
    if (!this.entryIntroShown && owner === Owner.PLAYER) {
      this.entryIntroShown = true;
      this._showBattleEntryOverlay(owner);
      return;
    }

    const cx = LAYOUT.BOARD_OFFSET_X + (BOARD_SIZE * LAYOUT.CELL_SIZE) / 2;
    const cy = LAYOUT.BOARD_OFFSET_Y + (BOARD_SIZE * LAYOUT.CELL_SIZE) / 2;
    const isPlayer = owner === Owner.PLAYER;
    const label = isPlayer ? UI_COPY.game.playerTurn : formatBotLabel(this.aiProfile) || UI_COPY.game.aiTurn;
    const textColor = isPlayer ? '#2ecc71' : '#ff6b35';

    const txt = this.add.text(cx, cy + 8, label, {
      fontSize: '30px', color: textColor, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(11).setAlpha(0.95);
    txt.setStroke?.('#050812', 5);
    txt.setShadow?.(0, 2, '#000000', 5, true, true);

    this.tweens.add({
      targets: txt,
      y: cy - 58,
      alpha: 0,
      duration: 760,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  _showMovablePieces() {
    if (this.hasMoved) return;
    const movable = [];
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) {
        const piece = this.board.getPiece(r, c);
        if (piece && piece.owner === Owner.PLAYER && !this.summonedCells.has(`${r},${c}`)) {
          const moves = this.calc.getMoves(this.board, r, c);
          if (moves.length > 0) movable.push({ row: r, col: c });
        }
      }
    this._highlightCells(movable, COLORS.MOVABLE_PIECE, 0.32);
  }

  _showThreatsIfInCheck() {
    if (this.detector.isInCheck(this.board, Owner.PLAYER)) {
      const threats = this.detector.getThreats(this.board, Owner.PLAYER);
      this._highlightCells(threats, COLORS.THREAT, 0.7);
      this.events.emit('check', true);
      this._animateCheck();
    } else {
      this._clearCheckRing();
      this.events.emit('check', false);
    }
  }

  _recordPlayerCheckIfNeeded() {
    if (this.detector.isInCheck(this.board, Owner.AI)) {
      this.achievements.recordCheck();
    }
  }

  _showMovePreviewFeedback(moves = []) {
    const captureCount = moves.filter(({ row, col }) => Boolean(this.board.getPiece(row, col))).length;
    const feedback = getActionFeedback({
      type: 'move-preview',
      moveCount: moves.length,
      captureCount,
    });
    const color = feedback.tone === 'success' ? '#7dffb8' : '#ffffff';
    playActionSfx(this, 'move-preview');
    this.events.emit('hint-change', { hint: formatActionFeedbackText(feedback), color, mode: 'selected' });
  }

  _showSummonPreviewFeedback(squares = []) {
    const feedback = getActionFeedback({
      type: 'summon-preview',
      summonableCount: squares.length,
      hasMoved: this.hasMoved,
      hasSummoned: this.hasSummoned,
    });
    const color = feedback.tone === 'summon' ? '#6fffe0' : '#ffffff';
    this.events.emit('hint-change', { hint: formatActionFeedbackText(feedback), color, mode: 'summon' });
  }

  _updateHint(mode = 'default') {
    this.currentHintMode = mode;
    const hint = getTurnHint({
      hasMoved: this.hasMoved,
      hasSummoned: this.hasSummoned,
      mode,
    });
    const color = mode === 'summon' ? '#6fffe0' : (mode === 'ai' ? '#f7c84b' : '#ffffff');
    this.events.emit('hint-change', { hint, color, mode });
  }

  _emitPlayerAction(action = null) {
    this._updateHint('default');
    this.events.emit('player-action', {
      hasMoved: this.hasMoved,
      hasSummoned: this.hasSummoned,
      mana: this.board.mana[Owner.PLAYER],
      summonCounts: this.board.summonCounts[Owner.PLAYER],
      action,
    });
  }

  _startTurn(owner) {
    this.board.addMana(owner, MANA_PER_TURN);
    this.board.currentTurn = owner;
    if (!this.clockTimes) {
      this.clockTimes = {
        [Owner.PLAYER]: TURN_TIME_LIMIT,
        [Owner.AI]: TURN_TIME_LIMIT,
      };
    }
    if (this.clockTimes[owner] <= 10) this.clockTimes[owner] = 10;
    this.timeLeft = this.clockTimes[owner];
    this.hasMoved = false;
    this.hasSummoned = false;
    this.summonedCells = new Set();
    this.pendingSummonType = null;

    if (this.turnTimer) { this.turnTimer.remove(); this.turnTimer = null; }
    if (this.idleWarningTimer) { this.idleWarningTimer.remove(); this.idleWarningTimer = null; }
    this._clearIdleWarningLossTimer();
    this._showTurnBanner(owner);
    this.events.emit('turn-start', {
      turn: owner,
      mana: this.board.mana,
      timeLeft: this.timeLeft,
      clockTimes: { ...this.clockTimes },
      summonCounts: this.board.summonCounts[Owner.PLAYER],
    });

    this.turnTimer = this.time.addEvent({
      delay: 1000,
      callback: this._tickTimer,
      callbackScope: this,
      loop: true,
    });

    if (owner === Owner.AI) {
      this.state = State.AI_TURN;
      this.aiOverlay.setAlpha(0.25);
      this._updateHint('ai');
      if (this.aiThinkTimer) { this.aiThinkTimer.remove(); this.aiThinkTimer = null; }
      this.aiThinkTimer = this.time.delayedCall(this._getAIThinkDelay(), this._doAITurn, [], this);
    } else {
      this.idleSeconds = 0;
      this.idleWarningShown = false;
      this.idleWarningTimer = this.time.addEvent({
        delay: 1000,
        callback: this._tickIdleWarning,
        callbackScope: this,
        loop: true,
      });
      this.aiOverlay.setAlpha(0);
      this.state = State.WAITING;
      this._showMovablePieces();
      this._showThreatsIfInCheck();
      this._updateHint('default');
    }
  }

  _tickTimer() {
    const owner = this.board.currentTurn;
    if (!this.clockTimes) {
      this.clockTimes = {
        [Owner.PLAYER]: owner === Owner.PLAYER ? this.timeLeft : TURN_TIME_LIMIT,
        [Owner.AI]: owner === Owner.AI ? this.timeLeft : TURN_TIME_LIMIT,
      };
    }
    this.clockTimes[owner] = Math.max(0, this.clockTimes[owner] - 1);
    this.timeLeft = this.clockTimes[owner];
    this.events.emit('timer-tick', {
      turn: owner,
      timeLeft: this.timeLeft,
      clockTimes: { ...this.clockTimes },
    });
    if (this.timeLeft <= 0) {
      if (this.turnTimer) { this.turnTimer.remove(); this.turnTimer = null; }
      if (this.tutorialMode) return;
      this._gameOver(owner === Owner.PLAYER ? Owner.AI : Owner.PLAYER, 'timeout');
    }
  }

  _tickIdleWarning() {
    if (this.tutorialMode) return;
    if (this.state === State.GAME_OVER || this.state === State.AI_TURN) return;
    if (this.board.currentTurn !== Owner.PLAYER) return;
    if (this.idleWarningShown) return;

    this.idleSeconds = (this.idleSeconds || 0) + 1;
    if (this.idleSeconds >= 30) {
      this.idleWarningShown = true;
      this._startIdleWarningLossTimer();
      this.events.emit('idle-warning', { seconds: 30 });
    }
  }

  _recordPlayerInput() {
    if (this.board?.currentTurn !== Owner.PLAYER) return;
    if (this.state === State.GAME_OVER || this.state === State.AI_TURN) return;
    this.idleSeconds = 0;
  }

  resolveIdleWarning(keepThinking) {
    if (this.state === State.GAME_OVER) return;
    this._clearIdleWarningLossTimer();
    if (keepThinking) {
      this.idleSeconds = 0;
      this.idleWarningShown = false;
      return;
    }
    this._gameOver(Owner.AI);
  }

  _startIdleWarningLossTimer() {
    this._clearIdleWarningLossTimer();
    if (!this.time?.delayedCall) return;
    this.idleWarningLossTimer = this.time.delayedCall(10000, () => {
      if (this.state === State.GAME_OVER) return;
      this.resolveIdleWarning(false);
    });
  }

  _clearIdleWarningLossTimer() {
    if (this.idleWarningLossTimer) {
      this.idleWarningLossTimer.remove();
      this.idleWarningLossTimer = null;
    }
  }

  _getAIThinkDelay() {
    return getAIThinkDelay(this.difficulty);
  }

  _endTurn() {
    if (this.turnTimer) { this.turnTimer.remove(); this.turnTimer = null; }
    if (this.idleWarningTimer) { this.idleWarningTimer.remove(); this.idleWarningTimer = null; }
    this._clearIdleWarningLossTimer();
    this._clearHighlights();
    this.selectedCell = null;
    this.pendingSummonType = null;
    this.state = State.WAITING;
    this._updateHint('ai');
    const next = this.board.currentTurn === Owner.PLAYER ? Owner.AI : Owner.PLAYER;
    this._startTurn(next);
  }

  _doAITurn() {
    this.aiThinkTimer = null;
    if (this.state === State.GAME_OVER) return;
    const moveAction = this.ai.getMove(this.board);
    if (moveAction) {
      const isCapture = !!this.board.getPiece(moveAction.to.row, moveAction.to.col);
      const visible = this._getVisibleCells();
      const srcVisible = visible.has(`${moveAction.from.row},${moveAction.from.col}`);
      if (srcVisible) {
        this.animating = true;
        this._animateMove(moveAction.from.row, moveAction.from.col, moveAction.to.row, moveAction.to.col, isCapture, () => {
          this.animating = false;
          this.board.movePiece(moveAction.from.row, moveAction.from.col, moveAction.to.row, moveAction.to.col);
          this._doAIPostMove();
        });
        return;
      } else if (isCapture && visible.has(`${moveAction.to.row},${moveAction.to.col}`)) {
        const cx = LAYOUT.BOARD_OFFSET_X + moveAction.to.col * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
        const cy = LAYOUT.BOARD_OFFSET_Y + moveAction.to.row * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
        playCaptureEffect(this, cx, cy, { owner: this.board.getPiece(moveAction.to.row, moveAction.to.col)?.owner });
      }
      this.board.movePiece(moveAction.from.row, moveAction.from.col, moveAction.to.row, moveAction.to.col);
    }
    this._doAIPostMove();
  }

  _doAIPostMove() {
    if (this.state === State.GAME_OVER) return;
    const summonAction = this.ai.getSummon(this.board);
    if (summonAction) {
      this.summonSys.summon(this.board, Owner.AI, summonAction.pieceType, summonAction.to.row, summonAction.to.col);
    }
    this._checkPromotion();
    this._refreshBoard();
    if (summonAction) {
      const visible = this._getVisibleCells();
      if (visible.has(`${summonAction.to.row},${summonAction.to.col}`))
        this._animateSummon(summonAction.to.row, summonAction.to.col);
    }
    this._checkGameOver();
    if (this.state !== State.GAME_OVER) this._endTurn();
  }

  _checkGameOver() {
    if (!this.board.findKing(Owner.PLAYER)) {
      this._gameOver(Owner.AI);
    } else if (!this.board.findKing(Owner.AI)) {
      this._gameOver(Owner.PLAYER);
    } else if (this.detector.isCheckmate(this.board, Owner.PLAYER)) {
      this._gameOver(Owner.AI, 'checkmate');
    } else if (this.detector.isCheckmate(this.board, Owner.AI)) {
      this._gameOver(Owner.PLAYER, 'checkmate');
    }
  }

  _gameOver(winner, resultReason = null) {
    if (this.state === State.GAME_OVER) return;
    this.state = State.GAME_OVER;
    playActionSfx(this, { type: 'game-over', won: winner === Owner.PLAYER });
    if (resultReason === 'checkmate') {
      this._revealBoardForCheckmate(winner);
      this._animateCheckmate(winner);
    }
    this.achievements?.recordGameOver?.({
      winner,
      difficulty: this.difficulty,
      timeRemaining: this.timeLeft || 0,
    });
    this.input.off('pointerdown', this._onPointerDown, this);
    this._clearSceneTimers();
    this.gameOverTransitionTimer = this.time.delayedCall(resultReason === 'checkmate' ? 2500 : 800, () => {
      this.gameOverTransitionTimer = null;
      this.scene.stop('UI');
      if (this.tutorialMode) this.scene.stop('Tutorial');
      this.scene.start('Result', {
        winner,
        difficulty: this.difficulty,
        aiProfile: this.aiProfile,
        resultReason,
        multiplayerMode: this.multiplayerMode,
      });
    });
  }

  _revealBoardForCheckmate(winner) {
    const defeated = winner === Owner.PLAYER ? Owner.AI : Owner.PLAYER;
    this.revealAllBoard = true;
    if (Array.isArray(this.highlightGraphics)) this._clearHighlights?.();
    this._clearCheckRing?.();
    this.fogGraphics?.forEach(g => g.destroy());
    this.fogGraphics = [];
    this._renderAllPieces?.();

    const kingPos = this.board?.findKing?.(defeated);
    if (kingPos && this.add && this.tweens && this.time) {
      const x = LAYOUT.BOARD_OFFSET_X + kingPos.col * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
      const y = LAYOUT.BOARD_OFFSET_Y + kingPos.row * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
      playCheckmateRevealEffect(this, x, y, { winner, defeated });
    }

    this.events?.emit?.('checkmate-reveal', { winner, defeated });
  }

  _animateCheckmate(winner) {
    const defeated = winner === Owner.PLAYER ? Owner.AI : Owner.PLAYER;
    const kingPos = this.board.findKing(defeated);
    if (!kingPos) return;
    const x = LAYOUT.BOARD_OFFSET_X + kingPos.col * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
    const y = LAYOUT.BOARD_OFFSET_Y + kingPos.row * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
    playCheckmateAlert(this, x, y, { winner });
  }

  startSummonMode(pieceType) {
    if (this.tutorialLocked) return;
    if (this.hasSummoned) return;
    this._recordPlayerInput();
    if (this.state === State.SUMMON_MODE && this.pendingSummonType === pieceType) {
      this._clearHighlights();
      this.pendingSummonType = null;
      this.state = State.WAITING;
      this._showMovablePieces();
      this._updateHint('default');
      this.events.emit('summon-cancel');
      return;
    }
    if (this.state !== State.WAITING && this.state !== State.SUMMON_MODE) return;
    if (!this.summonSys.canSummon(this.board, this._localOwner(), pieceType)) return;
    this.pendingSummonType = pieceType;
    this.state = State.SUMMON_MODE;
    this._clearHighlights();
    const squares = this.summonSys.getSummonableSquares(this.board, this._localOwner());
    this._highlightCells(squares, COLORS.SUMMON_HIGHLIGHT);
    this._showSummonPreviewFeedback(squares);
    this.events.emit('summon-mode', { pieceType, hasMoved: this.hasMoved, hasSummoned: this.hasSummoned });
    if (this.tutorialMode) this.events.emit('tutorial-summon-clicked');
  }

  _checkPromotion() {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const pp = this.board.getPiece(0, c);
      if (pp?.type === PieceType.PAWN && pp.owner === Owner.PLAYER) {
        this.board.setPiece(0, c, new Piece(PieceType.QUEEN, Owner.PLAYER));
        this.achievements?.recordPromotion?.(Owner.PLAYER);
        this._animatePromotion?.(0, c, Owner.PLAYER);
      }
      const ap = this.board.getPiece(4, c);
      if (ap?.type === PieceType.PAWN && ap.owner === Owner.AI) {
        this.board.setPiece(4, c, new Piece(PieceType.QUEEN, Owner.AI));
        this._animatePromotion?.(4, c, Owner.AI);
      }
    }
  }

  endTurnManually() {
    const canEnd = [State.WAITING, State.SELECTED, State.SUMMON_MODE].includes(this.state);
    if (canEnd && this.board.currentTurn === this._localOwner() && !this.animating) {
      this._recordPlayerInput();
      if (this.tutorialMode) this.events.emit('tutorial-turn-ended');
      if (this._sendPvpCommand({ type: 'endTurn' })) return;
      this._endTurn();
    }
  }

  surrender() {
    if (this.state === State.GAME_OVER) return;
    this._gameOver(Owner.AI);
  }

  getMana() { return this.board.mana; }
  getCurrentTurn() { return this.board.currentTurn; }
  getSummonCounts() { return this.board.summonCounts[Owner.PLAYER]; }

  _clearSceneTimers() {
    if (this.turnTimer) { this.turnTimer.remove(); this.turnTimer = null; }
    if (this.idleWarningTimer) { this.idleWarningTimer.remove(); this.idleWarningTimer = null; }
    if (this.aiThinkTimer) { this.aiThinkTimer.remove(); this.aiThinkTimer = null; }
    if (this.gameOverTransitionTimer) { this.gameOverTransitionTimer.remove(); this.gameOverTransitionTimer = null; }
    this._clearIdleWarningLossTimer();
  }

  shutdown() {
    this.input?.off?.('pointerdown', this._onPointerDown, this);
    this._clearSceneTimers();
  }
}



