import { describe, it, expect, beforeAll } from 'vitest';
import { BOARD_SIZE, Difficulty, LAYOUT, Owner, TURN_TIME_LIMIT } from '../src/config.js';
import { Board } from '../src/game/Board.js';
import { Piece } from '../src/game/Piece.js';
import { PieceType } from '../src/config.js';

beforeAll(() => {
  globalThis.Phaser = { Scene: class {} };
});

describe('GameScene manual turn ending', () => {
  it('allows ending the player turn while a piece is selected', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let ended = false;

    scene.state = 'SELECTED';
    scene.board = { currentTurn: Owner.PLAYER };
    scene.tutorialMode = false;
    scene.events = { emit: () => {} };
    scene._endTurn = () => { ended = true; };

    scene.endTurnManually();

    expect(ended).toBe(true);
  }, 10000);


  it('allows ending after moving without summoning', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let ended = false;

    scene.state = 'WAITING';
    scene.board = { currentTurn: Owner.PLAYER };
    scene.hasMoved = true;
    scene.hasSummoned = false;
    scene.animating = false;
    scene.tutorialMode = false;
    scene.events = { emit: () => {} };
    scene._recordPlayerInput = () => {};
    scene._sendPvpCommand = () => false;
    scene._endTurn = () => { ended = true; };

    scene.endTurnManually();

    expect(ended).toBe(true);
  });

  it('cancels selected movement with a right-click', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let cleared = false;
    let movableShown = false;
    let threatsShown = false;
    let hintMode = null;

    scene.state = 'SELECTED';
    scene.selectedCell = { row: 4, col: 2 };
    scene.tutorialLocked = false;
    scene.animating = false;
    scene._clearHighlights = () => { cleared = true; };
    scene._showMovablePieces = () => { movableShown = true; };
    scene._showThreatsIfInCheck = () => { threatsShown = true; };
    scene._updateHint = mode => { hintMode = mode; };

    scene._onPointerDown({ rightButtonDown: () => true });

    expect(scene.state).toBe('WAITING');
    expect(scene.selectedCell).toBe(null);
    expect(cleared).toBe(true);
    expect(movableShown).toBe(true);
    expect(threatsShown).toBe(true);
    expect(hintMode).toBe('default');
  });

  it('does not auto-end from the tutorial timer before the turn-end lesson click', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let ended = false;
    let removed = false;

    scene.timeLeft = 1;
    scene.tutorialMode = true;
    scene.animating = false;
    scene.board = { currentTurn: Owner.PLAYER };
    scene.events = { emit: () => {} };
    scene.turnTimer = { remove: () => { removed = true; } };
    scene._endTurn = () => { ended = true; };

    scene._tickTimer();

    expect(removed).toBe(true);
    expect(ended).toBe(false);
  });

  it('uses a three minute chess clock', () => {
    expect(TURN_TIME_LIMIT).toBe(180);
  });

  it('aligns rendered board pieces by their bottom edge within a cell', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const images = [];

    scene.pieceObjects = {};
    scene.add = {
      ellipse: () => ({
        setDepth() { return this; },
        destroy() {},
        setVisible() {},
      }),
      image: (x, y, key) => {
        const image = {
          x, y, key, width: 0, height: 0,
          setDisplaySize(width, height) { this.width = width; this.height = height; return this; },
          setDepth() { return this; },
          destroy() {},
          setVisible() {},
        };
        images.push(image);
        return image;
      },
    };

    scene._renderPiece(4, 0, new Piece(PieceType.PAWN, Owner.PLAYER));
    scene._renderPiece(4, 1, new Piece(PieceType.QUEEN, Owner.PLAYER));

    const [pawn, queen] = images;
    const pawnBottom = pawn.y + pawn.height / 2;
    const queenBottom = queen.y + queen.height / 2;
    const cellCenterY = LAYOUT.BOARD_OFFSET_Y + 4 * LAYOUT.CELL_SIZE + LAYOUT.CELL_SIZE / 2;
    const liftedBottom = cellCenterY + LAYOUT.NON_PAWN_PIECE_SIZE / 2 - LAYOUT.PIECE_BOARD_LIFT;

    expect(pawn.height).toBe(LAYOUT.PIECE_SIZE);
    expect(queen.height).toBe(LAYOUT.NON_PAWN_PIECE_SIZE);
    expect(pawnBottom).toBe(queenBottom);
    expect(queenBottom).toBe(liftedBottom);
  });

  it('keeps each side chess clock instead of resetting every turn', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const emitted = [];

    scene.board = {
      addMana() {},
      currentTurn: Owner.AI,
      mana: { [Owner.PLAYER]: 0, [Owner.AI]: 0 },
      summonCounts: { [Owner.PLAYER]: {} },
    };
    scene.clockTimes = { [Owner.PLAYER]: 17, [Owner.AI]: 23 };
    scene.turnTimer = null;
    scene.pendingSummonType = 'PAWN';
    scene.aiOverlay = { setAlpha() {} };
    scene.events = { emit: (event, payload) => emitted.push({ event, payload }) };
    scene.time = { addEvent: () => ({ remove() {} }) };
    scene._showTurnBanner = () => {};
    scene._showMovablePieces = () => {};
    scene._showThreatsIfInCheck = () => {};
    scene._updateHint = () => {};

    scene._startTurn(Owner.PLAYER);

    expect(scene.timeLeft).toBe(17);
    expect(emitted.find(e => e.event === 'turn-start').payload.timeLeft).toBe(17);
    expect(scene.clockTimes[Owner.AI]).toBe(23);
  });

  it('recharges a side to ten seconds when starting a turn at ten seconds or less', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const emitted = [];

    scene.board = {
      addMana() {},
      currentTurn: Owner.AI,
      mana: { [Owner.PLAYER]: 0, [Owner.AI]: 0 },
      summonCounts: { [Owner.PLAYER]: {} },
    };
    scene.clockTimes = { [Owner.PLAYER]: 7, [Owner.AI]: 11 };
    scene.turnTimer = null;
    scene.pendingSummonType = 'PAWN';
    scene.aiOverlay = { setAlpha() {} };
    scene.events = { emit: (event, payload) => emitted.push({ event, payload }) };
    scene.time = { addEvent: () => ({ remove() {} }) };
    scene._showTurnBanner = () => {};
    scene._showMovablePieces = () => {};
    scene._showThreatsIfInCheck = () => {};
    scene._updateHint = () => {};

    scene._startTurn(Owner.PLAYER);

    const payload = emitted.find(e => e.event === 'turn-start').payload;
    expect(scene.timeLeft).toBe(10);
    expect(scene.clockTimes[Owner.PLAYER]).toBe(10);
    expect(scene.clockTimes[Owner.AI]).toBe(11);
    expect(payload.timeLeft).toBe(10);
    expect(payload.clockTimes[Owner.PLAYER]).toBe(10);
  });

  it('decrements only the active side clock and loses on flag fall', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let winner = null;
    let reason = null;

    scene.board = { currentTurn: Owner.AI };
    scene.clockTimes = { [Owner.PLAYER]: 12, [Owner.AI]: 1 };
    scene.tutorialMode = false;
    scene.events = { emit: () => {} };
    scene.turnTimer = { remove() {} };
    scene._gameOver = (value, resultReason) => { winner = value; reason = resultReason; };

    scene._tickTimer();

    expect(scene.clockTimes[Owner.PLAYER]).toBe(12);
    expect(scene.clockTimes[Owner.AI]).toBe(0);
    expect(winner).toBe(Owner.PLAYER);
    expect(reason).toBe('timeout');
  });

  it('warns after 30 seconds without player input', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const emitted = [];
    const delayedCalls = [];

    scene.board = { currentTurn: Owner.PLAYER };
    scene.state = 'WAITING';
    scene.tutorialMode = false;
    scene.idleWarningShown = false;
    scene.idleSeconds = 29;
    scene.events = { emit: (event, payload) => emitted.push({ event, payload }) };
    scene.time = { delayedCall: (delay, callback) => {
      const call = { delay, callback, removed: false, remove() { this.removed = true; } };
      delayedCalls.push(call);
      return call;
    } };

    scene._tickIdleWarning();

    expect(scene.idleWarningShown).toBe(true);
    expect(scene.idleWarningLossTimer).toBe(delayedCalls[0]);
    expect(delayedCalls[0].delay).toBe(10000);
    expect(emitted).toContainEqual({ event: 'idle-warning', payload: { seconds: 30 } });
  });

  it('loses if the idle warning is unanswered for 10 seconds', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let winner = null;
    let delayedCallback = null;

    scene.board = { currentTurn: Owner.PLAYER };
    scene.state = 'WAITING';
    scene.tutorialMode = false;
    scene.idleWarningShown = false;
    scene.idleSeconds = 29;
    scene.events = { emit: () => {} };
    scene.time = { delayedCall: (delay, callback) => {
      delayedCallback = callback;
      return { delay, remove() {} };
    } };
    scene._gameOver = value => { winner = value; };

    scene._tickIdleWarning();
    delayedCallback();

    expect(winner).toBe(Owner.AI);
  });

  it('does not warn for AI idle time', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const emitted = [];

    scene.board = { currentTurn: Owner.AI };
    scene.state = 'AI_TURN';
    scene.tutorialMode = false;
    scene.idleWarningShown = false;
    scene.idleSeconds = 29;
    scene.events = { emit: (event, payload) => emitted.push({ event, payload }) };

    scene._tickIdleWarning();

    expect(scene.idleWarningShown).toBe(false);
    expect(emitted).toEqual([]);
  });

  it('loses when the idle warning is declined', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let winner = null;

    scene.state = 'WAITING';
    scene._gameOver = value => { winner = value; };

    scene.resolveIdleWarning(false);

    expect(winner).toBe(Owner.AI);
  });

  it('resets idle tracking when the player asks for more thinking time', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let removed = false;

    scene.state = 'WAITING';
    scene.idleSeconds = 30;
    scene.idleWarningShown = true;
    scene.idleWarningLossTimer = { remove: () => { removed = true; } };

    scene.resolveIdleWarning(true);

    expect(scene.idleSeconds).toBe(0);
    expect(scene.idleWarningShown).toBe(false);
    expect(scene.idleWarningLossTimer).toBe(null);
    expect(removed).toBe(true);
  });

  it('keeps fog of war on easy difficulty instead of revealing the whole board', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);

    scene.difficulty = Difficulty.EASY;
    scene.board = new Board();
    scene.board.setPiece(4, 2, new Piece(PieceType.KING, Owner.PLAYER));
    scene.board.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
    scene.calc = { getMoves: () => [] };
    scene.detector = { getThreats: () => [] };

    const visible = scene._getVisibleCells();

    expect(visible.size).toBeLessThan(BOARD_SIZE * BOARD_SIZE);
    expect(visible.has('4,2')).toBe(true);
    expect(visible.has('0,0')).toBe(false);
  });

  it('reveals every allied piece move and attack zone as vision', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);

    scene.difficulty = Difficulty.MEDIUM;
    scene.board = new Board();
    scene.board.setPiece(4, 2, new Piece(PieceType.KING, Owner.PLAYER));
    scene.board.setPiece(2, 2, new Piece(PieceType.ROOK, Owner.PLAYER));
    scene.board.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
    scene.selectedCell = null;
    scene.calc = { getMoves: () => [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
    ] };
    scene.detector = { getThreats: () => [] };

    const visible = scene._getVisibleCells();

    expect(visible.has('0,0')).toBe(true);
    expect(visible.has('0,4')).toBe(true);
  });

  it('reports game results to achievement progress before leaving the game scene', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let recorded = null;
    const starts = [];

    scene.difficulty = Difficulty.HARD;
    scene.aiProfile = { id: 'bot-hard', label: 'Hard Bot' };
    scene.timeLeft = 72;
    scene.input = { off() {} };
    scene.turnTimer = null;
    scene.idleWarningTimer = null;
    scene._clearIdleWarningLossTimer = () => {};
    scene.time = { delayedCall: (delay, callback) => callback() };
    scene.scene = { stop() {}, start: (key, data) => starts.push({ key, data }) };
    scene.achievements = { recordGameOver: payload => { recorded = payload; } };

    scene._gameOver(Owner.PLAYER);

    expect(recorded).toEqual({
      winner: Owner.PLAYER,
      difficulty: Difficulty.HARD,
      timeRemaining: 72,
    });
    expect(starts).toEqual([
      {
        key: 'Result',
        data: {
          winner: Owner.PLAYER,
          difficulty: Difficulty.HARD,
          aiProfile: { id: 'bot-hard', label: 'Hard Bot' },
          resultReason: null,
        },
      },
    ]);
  });

  it('clears pending scene timers and schedules only one result transition on game over', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const removed = [];
    const scheduled = [];
    const starts = [];

    const makeTimer = name => ({ remove: () => removed.push(name) });
    scene.state = 'WAITING';
    scene.difficulty = Difficulty.EASY;
    scene.aiProfile = null;
    scene.timeLeft = 91;
    scene.turnTimer = makeTimer('turn');
    scene.idleWarningTimer = makeTimer('idle');
    scene.idleWarningLossTimer = makeTimer('idleLoss');
    scene.aiThinkTimer = makeTimer('aiThink');
    scene.gameOverTransitionTimer = null;
    scene.input = { off() {} };
    scene.time = {
      delayedCall: (delay, callback) => {
        scheduled.push({ delay, callback });
        return makeTimer('gameOverTransition');
      },
    };
    scene.scene = { stop() {}, start: (key, data) => starts.push({ key, data }) };
    scene.achievements = { recordGameOver() {} };

    scene._gameOver(Owner.AI);
    scene._gameOver(Owner.PLAYER);

    expect(removed).toEqual(['turn', 'idle', 'aiThink', 'idleLoss']);
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0].delay).toBe(800);

    scheduled[0].callback();

    expect(starts).toEqual([
      { key: 'Result', data: { winner: Owner.AI, difficulty: Difficulty.EASY, aiProfile: null, resultReason: null, multiplayerMode: undefined } },
    ]);
  });

  it('marks checkmate as the result reason when a king has no escape', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const endings = [];

    scene.board = {
      findKing: owner => ({ row: owner === Owner.PLAYER ? 4 : 0, col: 2 }),
    };
    scene.detector = {
      isCheckmate: (_board, owner) => owner === Owner.AI,
    };
    scene._gameOver = (winner, reason) => endings.push({ winner, reason });

    scene._checkGameOver();

    expect(endings).toEqual([
      { winner: Owner.PLAYER, reason: 'checkmate' },
    ]);
  });

  it('reveals the whole board before the checkmate result transition', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const destroyed = [];
    const emitted = [];
    let renderedAllPieces = false;

    scene.state = 'WAITING';
    scene.difficulty = Difficulty.EASY;
    scene.aiProfile = null;
    scene.timeLeft = 42;
    scene.turnTimer = null;
    scene.idleWarningTimer = null;
    scene.idleWarningLossTimer = null;
    scene.aiThinkTimer = null;
    scene.gameOverTransitionTimer = null;
    scene.input = { off() {} };
    scene.events = { emit: (event, payload) => emitted.push({ event, payload }) };
    scene.scene = { stop() {}, start() {} };
    scene.time = { delayedCall: () => ({ remove() {} }) };
    scene.achievements = { recordGameOver() {} };
    scene.board = {
      findKing: owner => ({ row: owner === Owner.AI ? 0 : 4, col: 2 }),
    };
    scene.fogGraphics = [
      { destroy: () => destroyed.push('fog-a') },
      { destroy: () => destroyed.push('fog-b') },
    ];
    scene._renderAllPieces = () => { renderedAllPieces = true; };
    scene._animateCheckmate = () => {};

    scene._gameOver(Owner.PLAYER, 'checkmate');

    expect(destroyed).toEqual(['fog-a', 'fog-b']);
    expect(scene.fogGraphics).toEqual([]);
    expect(renderedAllPieces).toBe(true);
    expect(emitted).toContainEqual({
      event: 'checkmate-reveal',
      payload: { winner: Owner.PLAYER, defeated: Owner.AI },
    });
  });


  it('treats every board cell as visible during the checkmate reveal', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);

    scene.revealAllBoard = true;
    scene.board = new Board();
    scene.board.setPiece(4, 2, new Piece(PieceType.KING, Owner.PLAYER));
    scene.board.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
    scene.calc = { getMoves: () => [] };
    scene.detector = { getThreats: () => [] };

    const visible = scene._getVisibleCells();

    expect(visible.size).toBe(BOARD_SIZE * BOARD_SIZE);
    expect(visible.has('0,0')).toBe(true);
    expect(visible.has('4,4')).toBe(true);
  });

  it('does not recreate fog while the checkmate reveal is active', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    let destroyed = false;
    const addedFog = [];

    scene.revealAllBoard = true;
    scene.fogGraphics = [{ destroy: () => { destroyed = true; } }];
    scene.board = new Board();
    scene.board.setPiece(4, 2, new Piece(PieceType.KING, Owner.PLAYER));
    scene.board.setPiece(0, 2, new Piece(PieceType.KING, Owner.AI));
    scene.calc = { getMoves: () => [] };
    scene.detector = { getThreats: () => [] };
    scene.textures = { exists: () => false };
    scene.add = {
      rectangle: (...args) => {
        addedFog.push(args);
        return { setDepth() { return this; } };
      },
    };

    scene._renderFog();

    expect(destroyed).toBe(true);
    expect(scene.fogGraphics).toEqual([]);
    expect(addedFog).toEqual([]);
  });

  it('records only player promotions for achievements', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const promotedOwners = [];

    scene.board = new Board();
    scene.board.setPiece(0, 0, new Piece(PieceType.PAWN, Owner.PLAYER));
    scene.board.setPiece(4, 4, new Piece(PieceType.PAWN, Owner.AI));
    scene.achievements = { recordPromotion: owner => promotedOwners.push(owner) };
    scene._animatePromotion = () => {};

    scene._checkPromotion();

    expect(promotedOwners).toEqual([Owner.PLAYER]);
  });
});

describe('GameScene PvP session setup', () => {
  it('restores the server-authoritative board snapshot instead of requiring local placements', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);

    scene.init({
      multiplayerMode: 'pvp',
      pvpSide: 'PLAYER',
      pvpRoomId: 'room-a',
      pvpSession: {
        currentTurn: 'AI',
        mana: { PLAYER: 2, AI: 4 },
        board: [
          [null, null, { type: 'KING', owner: 'AI' }, null, null],
          [null, null, null, null, null],
          [null, null, null, null, null],
          [null, null, { type: 'PAWN', owner: 'PLAYER' }, null, null],
          [null, null, { type: 'KING', owner: 'PLAYER' }, null, null],
        ],
      },
    });
    scene.board = new Board();

    scene._setupBoard();

    expect(scene.multiplayerMode).toBe('pvp');
    expect(scene.board.currentTurn).toBe(Owner.AI);
    expect(scene.board.mana).toEqual({ [Owner.PLAYER]: 2, [Owner.AI]: 4 });
    expect(scene.board.getPiece(3, 2)).toEqual(new Piece(PieceType.PAWN, Owner.PLAYER));
    expect(scene.board.getPiece(0, 2)).toEqual(new Piece(PieceType.KING, Owner.AI));
  });
});

describe('GameScene PvP command sync', () => {
  it('sends move, summon, and end-turn commands to the server instead of resolving them locally', async () => {
    const { GameScene } = await import('../src/scenes/GameScene.js');
    const scene = Object.create(GameScene.prototype);
    const sent = [];

    scene.multiplayerMode = 'pvp';
    scene.pvpSocket = { send: payload => sent.push(JSON.parse(payload)) };
    scene.pvpSide = Owner.PLAYER;
    scene.board = new Board();
    scene.board.setPiece(4, 2, new Piece(PieceType.KING, Owner.PLAYER));
    scene.state = 'SELECTED';
    scene.selectedCell = { row: 4, col: 2 };
    scene.animating = false;
    scene.tutorialLocked = false;
    scene.hasMoved = false;
    scene.hasSummoned = false;
    scene.summonedCells = new Set();
    scene.calc = { getMoves: () => [{ row: 3, col: 2 }] };
    scene._recordPlayerInput = () => {};
    scene._clearHighlights = () => {};

    scene._onCellClick(3, 2);

    scene.state = 'SUMMON_MODE';
    scene.pendingSummonType = PieceType.PAWN;
    scene.summonSys = { getSummonableSquares: () => [{ row: 4, col: 1 }] };
    scene._onCellClick(4, 1);

    scene.state = 'WAITING';
    scene.board.currentTurn = Owner.PLAYER;
    scene.endTurnManually();

    expect(sent).toEqual([
      { type: 'pvpCommand', command: { type: 'move', from: { row: 4, col: 2 }, to: { row: 3, col: 2 } } },
      { type: 'pvpCommand', command: { type: 'summon', pieceType: PieceType.PAWN, to: { row: 4, col: 1 } } },
      { type: 'pvpCommand', command: { type: 'endTurn' } },
    ]);
    expect(scene.board.getPiece(4, 2)).toEqual(new Piece(PieceType.KING, Owner.PLAYER));
  });
});
