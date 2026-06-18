import { describe, it, expect, beforeAll } from 'vitest';
import { Difficulty, LAYOUT, Owner } from '../src/config.js';
import { UI_COPY } from '../src/ui/visuals.js';

beforeAll(() => {
  globalThis.Phaser = { Scene: class {} };
});

describe('tutorial and replay flow', () => {
  it('keeps the result screen focused on MMR movement instead of outcome copy', async () => {
    const { ResultScene } = await import('../src/scenes/ResultScene.js');
    const scene = Object.create(ResultScene.prototype);
    const texts = [];

    globalThis.localStorage = {
      getItem: key => (key === 'chesssummon.singleMmr' ? '1000' : null),
      setItem() {},
    };
    scene.winner = Owner.AI;
    scene.resultReason = null;
    scene.difficulty = Difficulty.EASY;
    scene.aiProfile = null;
    scene.multiplayerMode = null;
    scene.textures = { exists: () => false };
    scene.add = {
      image: () => ({ setDisplaySize() { return this; }, setDepth() { return this; }, setAlpha() { return this; }, setTint() { return this; } }),
      rectangle: () => ({ setDepth() { return this; }, setAlpha() { return this; }, setStrokeStyle() { return this; }, setInteractive() { return this; }, on() { return this; }, setData() { return this; }, getData() { return true; } }),
      circle: () => ({ setDepth() { return this; } }),
      graphics: () => ({ lineStyle() { return this; }, strokeRect() { return this; }, beginPath() { return this; }, moveTo() { return this; }, lineTo() { return this; }, closePath() { return this; }, strokePath() { return this; } }),
      text: (x, y, value) => {
        const text = {
          x, y, value,
          setOrigin() { return this; },
          setDepth() { return this; },
          setStroke() { return this; },
          setShadow() { return this; },
          setColor() { return this; },
        };
        texts.push(text);
        return text;
      },
    };
    scene.tweens = { add: cfg => { cfg.onComplete?.(); } };

    scene.create();

    expect(texts.map(text => text.value)).not.toContain('CHESS OF DARK');
    expect(texts.map(text => text.value)).not.toContain(UI_COPY.result.lose);
    expect(texts.map(text => text.value).some(value => String(value).includes('KING CAPTURED'))).toBe(false);
    expect(texts.map(text => text.value).some(value => String(value).includes('SINGLE MMR'))).toBe(false);
    expect(texts.map(text => text.value)).toContain('-10');
  });

  it('uses a trophy icon and keeps rating text inside a taller result frame', async () => {
    const { ResultScene } = await import('../src/scenes/ResultScene.js');
    const { UI_ASSETS } = await import('../src/ui/visuals.js');
    const scene = Object.create(ResultScene.prototype);
    const images = [];
    const rectangles = [];
    const texts = [];

    globalThis.localStorage = {
      getItem: key => (key === 'chesssummon.singleMmr' ? '1000' : null),
      setItem() {},
    };
    scene.winner = Owner.PLAYER;
    scene.resultReason = null;
    scene.difficulty = Difficulty.EASY;
    scene.aiProfile = null;
    scene.multiplayerMode = null;
    scene.textures = { exists: key => [UI_ASSETS.titleButtonFrame.key, UI_ASSETS.resultTrophy.key].includes(key) };
    scene.add = {
      image: (x, y, key) => {
        const image = {
          x, y, key, width: 0, height: 0,
          setDisplaySize(width, height) { this.width = width; this.height = height; return this; },
          setDepth() { return this; },
          setAlpha() { return this; },
          setTint() { return this; },
        };
        images.push(image);
        return image;
      },
      rectangle: (x, y, width, height) => {
        const rect = { x, y, width, height, setDepth() { return this; }, setAlpha() { return this; }, setStrokeStyle() { return this; }, setInteractive() { return this; }, on() { return this; }, setData() { return this; }, getData() { return true; } };
        rectangles.push(rect);
        return rect;
      },
      circle: () => ({ setDepth() { return this; } }),
      graphics: () => ({ lineStyle() { return this; }, strokeRect() { return this; }, beginPath() { return this; }, moveTo() { return this; }, lineTo() { return this; }, closePath() { return this; }, strokePath() { return this; } }),
      text: (x, y, value) => {
        const text = { x, y, value, setOrigin() { return this; }, setDepth() { return this; }, setStroke() { return this; }, setShadow() { return this; }, setColor() { return this; }, setAlpha() { return this; } };
        texts.push(text);
        return text;
      },
    };
    scene.tweens = { add: cfg => { cfg.onComplete?.(); } };

    scene.create();

    expect(images.some(image => image.key === UI_ASSETS.resultTrophy.key && image.y === 214)).toBe(true);
    expect(images.some(image => image.key === UI_ASSETS.titleButtonFrame.key && image.width === 388 && image.height === 316)).toBe(true);
    expect(texts.map(text => text.value)).not.toContain('SINGLE MMR');
    expect(texts.find(text => text.value === '1012')?.y).toBe(286);
    expect(texts.find(text => String(text.value).includes('->'))?.y).toBe(416);
  });

  it('lowers the replay and main menu labels inside result buttons', async () => {
    const { ResultScene } = await import('../src/scenes/ResultScene.js');
    const scene = Object.create(ResultScene.prototype);
    const texts = [];

    globalThis.localStorage = {
      getItem: key => (key === 'chesssummon.singleMmr' ? '1000' : null),
      setItem() {},
    };
    scene.winner = Owner.PLAYER;
    scene.resultReason = null;
    scene.difficulty = Difficulty.EASY;
    scene.aiProfile = null;
    scene.multiplayerMode = null;
    scene.textures = { exists: () => false };
    scene.add = {
      image: () => ({ setDisplaySize() { return this; }, setDepth() { return this; }, setAlpha() { return this; }, setTint() { return this; } }),
      rectangle: () => ({ setDepth() { return this; }, setAlpha() { return this; }, setStrokeStyle() { return this; }, setInteractive() { return this; }, on() { return this; }, setData() { return this; }, getData() { return true; } }),
      circle: () => ({ setDepth() { return this; } }),
      graphics: () => ({ lineStyle() { return this; }, strokeRect() { return this; }, beginPath() { return this; }, moveTo() { return this; }, lineTo() { return this; }, closePath() { return this; }, strokePath() { return this; } }),
      text: (x, y, value) => {
        const text = {
          x, y, value,
          setOrigin() { return this; },
          setDepth() { return this; },
          setStroke() { return this; },
          setShadow() { return this; },
          setColor() { return this; },
          setAlpha() { return this; },
        };
        texts.push(text);
        return text;
      },
    };
    scene.tweens = { add: cfg => { cfg.onComplete?.(); } };

    scene.create();

    expect(texts.find(text => text.value === UI_COPY.result.replay)?.y).toBe(592);
    expect(texts.find(text => text.value === UI_COPY.result.menu)?.y).toBe(684);
  });

  it('keeps every tutorial copy step in the tutorial sequence', async () => {
    const { TUTORIAL_STEPS } = await import('../src/scenes/TutorialScene.js');
    const texts = TUTORIAL_STEPS.map(step => step.text);

    expect(texts).toContain(UI_COPY.tutorial.steps[4]);
  });

  it('builds click blockers around the highlighted tutorial target', async () => {
    const { buildTutorialMaskRects } = await import('../src/scenes/TutorialScene.js');
    const highlight = { x: 100, y: 120, w: 200, h: 160 };

    const rects = buildTutorialMaskRects(800, 600, highlight);

    expect(rects).toEqual([
      { x: 400, y: 60, w: 800, h: 120 },
      { x: 400, y: 440, w: 800, h: 320 },
      { x: 50, y: 200, w: 100, h: 160 },
      { x: 550, y: 200, w: 500, h: 160 },
    ]);
  });

  it('blocks clicks outside the highlighted tutorial target', async () => {
    const { TutorialScene } = await import('../src/scenes/TutorialScene.js');
    const scene = Object.create(TutorialScene.prototype);
    const rectangles = [];
    const makeRectangle = () => {
      const rect = {
        interactive: false,
        setDepth() { return this; },
        setAlpha() { return this; },
        setStrokeStyle() { return this; },
        setInteractive() { this.interactive = true; return this; },
        on() { return this; },
        setData() { return this; },
        destroy() {},
      };
      rectangles.push(rect);
      return rect;
    };
    const text = { setOrigin() { return this; }, setDepth() { return this; }, destroy() {} };
    const graphics = {
      setDepth() { return this; },
      lineStyle() { return this; },
      strokeRoundedRect() { return this; },
      fillStyle() { return this; },
      fillRoundedRect() { return this; },
      destroy() {},
    };

    scene.stepIndex = 0;
    scene._overlayObjs = [];
    scene.add = {
      rectangle: makeRectangle,
      graphics: () => graphics,
      text: () => text,
      circle: () => ({ setDepth() { return this; }, destroy() {} }),
    };
    scene.tweens = { add: () => {} };

    scene._showStep();

    expect(rectangles).toHaveLength(4);
    expect(rectangles.every(rect => rect.interactive)).toBe(true);
  });

  it('blocks the whole tutorial screen when there is only an info step', async () => {
    const { TutorialScene } = await import('../src/scenes/TutorialScene.js');
    const scene = Object.create(TutorialScene.prototype);
    const rectangles = [];
    const makeRectangle = () => {
      const rect = {
        interactive: false,
        setDepth() { return this; },
        setAlpha() { return this; },
        setStrokeStyle() { return this; },
        setInteractive() { this.interactive = true; return this; },
        on() { return this; },
        setData() { return this; },
        destroy() {},
      };
      rectangles.push(rect);
      return rect;
    };
    const text = { setOrigin() { return this; }, setDepth() { return this; }, destroy() {} };
    const graphics = {
      setDepth() { return this; },
      lineStyle() { return this; },
      strokeRoundedRect() { return this; },
      fillStyle() { return this; },
      fillRoundedRect() { return this; },
      destroy() {},
    };

    scene.stepIndex = 4;
    scene._overlayObjs = [];
    scene.add = {
      rectangle: makeRectangle,
      graphics: () => graphics,
      text: () => text,
      circle: () => ({ setDepth() { return this; }, destroy() {} }),
    };
    scene.tweens = { add: () => {} };

    scene._showStep();

    expect(rectangles[0].interactive).toBe(true);
  });

  it('restarts easy replay directly as a playable game without tutorial prompt', async () => {
    const { ResultScene } = await import('../src/scenes/ResultScene.js');
    const scene = Object.create(ResultScene.prototype);
    const starts = [];
    const stops = [];
    const delayed = [];

    scene.difficulty = Difficulty.EASY;
    scene.replaying = false;
    scene.scene = {
      stop: key => stops.push(key),
      start: (key, data) => starts.push({ key, data }),
    };
    scene.time = { delayedCall: (delay, callback) => delayed.push({ delay, callback }) };

    scene._replay();
    scene._replay();

    expect(stops).toEqual(['UI', 'Tutorial', 'Game']);
    expect(starts).toEqual([]);
    expect(delayed).toHaveLength(1);
    expect(delayed[0].delay).toBe(0);

    delayed[0].callback();

    expect(starts).toHaveLength(1);
    expect(starts[0].key).toBe('Game');
    expect(starts[0].data.difficulty).toBe(Difficulty.EASY);
    expect(starts[0].data.tutorialMode).toBeUndefined();
    expect(starts[0].data.playerPlacements).toHaveLength(4);
  });

  it('keeps hard replay in placement because pawns must be edited manually', async () => {
    const { ResultScene } = await import('../src/scenes/ResultScene.js');
    const scene = Object.create(ResultScene.prototype);
    const starts = [];
    const stops = [];
    const delayed = [];

    scene.difficulty = Difficulty.HARD;
    scene.replaying = false;
    scene.scene = {
      stop: key => stops.push(key),
      start: (key, data) => starts.push({ key, data }),
    };
    scene.time = { delayedCall: (delay, callback) => delayed.push({ delay, callback }) };

    scene._replay();

    expect(stops).toEqual(['UI', 'Tutorial', 'Game']);
    expect(starts).toEqual([]);
    expect(delayed).toHaveLength(1);

    delayed[0].callback();

    expect(starts).toEqual([
      { key: 'Placement', data: { difficulty: Difficulty.HARD, skipTutorialPrompt: true, aiProfile: undefined } },
    ]);
  });

  it('keeps very hard replay in placement because pawns must be edited manually', async () => {
    const { ResultScene } = await import('../src/scenes/ResultScene.js');
    const scene = Object.create(ResultScene.prototype);
    const starts = [];
    const stops = [];
    const delayed = [];

    scene.difficulty = Difficulty.VERY_HARD;
    scene.replaying = false;
    scene.scene = {
      stop: key => stops.push(key),
      start: (key, data) => starts.push({ key, data }),
    };
    scene.time = { delayedCall: (delay, callback) => delayed.push({ delay, callback }) };

    scene._replay();

    expect(stops).toEqual(['UI', 'Tutorial', 'Game']);
    expect(starts).toEqual([]);
    expect(delayed).toHaveLength(1);

    delayed[0].callback();

    expect(starts).toEqual([
      { key: 'Placement', data: { difficulty: Difficulty.VERY_HARD, skipTutorialPrompt: true, aiProfile: undefined } },
    ]);
  });

  it('treats very hard as a manual placement difficulty', async () => {
    const { requiresManualPlacement } = await import('../src/scenes/PlacementScene.js');

    expect(requiresManualPlacement(Difficulty.HARD)).toBe(true);
    expect(requiresManualPlacement(Difficulty.VERY_HARD)).toBe(true);
    expect(requiresManualPlacement(Difficulty.MEDIUM)).toBe(false);
  });

  it('starts hard mode battle immediately with the edited pawn positions', async () => {
    const { PlacementScene } = await import('../src/scenes/PlacementScene.js');
    const scene = Object.create(PlacementScene.prototype);
    const starts = [];

    scene.difficulty = Difficulty.HARD;
    scene.pawnCount = 4;
    scene.placed = {
      '3,0': true,
      '3,1': true,
      '4,0': true,
      '4,4': true,
    };
    scene.scene = { start: (key, data) => starts.push({ key, data }) };
    scene.time = { delayedCall: () => { throw new Error('hard mode start should not depend on a delayed timer'); } };

    scene._startGame();

    expect(starts).toEqual([
      {
        key: 'Game',
        data: {
          difficulty: Difficulty.HARD,
          playerPlacements: [
            { row: 3, col: 0 },
            { row: 3, col: 1 },
            { row: 4, col: 0 },
            { row: 4, col: 4 },
          ],
        },
      },
    ]);
  });

  it('does not start hard mode battle before four pawns are placed', async () => {
    const { PlacementScene } = await import('../src/scenes/PlacementScene.js');
    const scene = Object.create(PlacementScene.prototype);
    const starts = [];

    scene.difficulty = Difficulty.HARD;
    scene.pawnCount = 3;
    scene.placed = {
      '3,0': true,
      '3,1': true,
      '4,0': true,
    };
    scene.scene = { start: (key, data) => starts.push({ key, data }) };
    scene.time = { delayedCall: () => { throw new Error('incomplete hard mode placement should not schedule start'); } };

    scene._startGame();

    expect(starts).toEqual([]);
  });

  it('renders placed pawns with the same image key and size as in-game pieces', async () => {
    const { PlacementScene } = await import('../src/scenes/PlacementScene.js');
    const scene = Object.create(PlacementScene.prototype);
    const images = [];

    scene.placed = {};
    scene.pawnCount = 0;
    scene.cellGraphics = { '3,0': { text: null } };
    scene.add = {
      image: (x, y, key) => {
        const image = {
          x, y, key, width: null, height: null,
          setDisplaySize(width, height) { this.width = width; this.height = height; return this; },
          setDepth() { return this; },
          destroy() {},
        };
        images.push(image);
        return image;
      },
      ellipse: () => ({ setDepth() { return this; }, destroy() {} }),
      text: () => ({ setOrigin() { return this; }, destroy() {} }),
    };
    scene._updateReadyButton = () => {};
    const cell = { setFillStyle() {} };

    scene._togglePawn(3, 0, 120, 220, cell, true);

    expect(images).toHaveLength(1);
    expect(images[0]).toMatchObject({
      key: 'pawn_w',
      y: 220 - LAYOUT.PIECE_BOARD_LIFT,
      width: LAYOUT.PIECE_SIZE,
      height: LAYOUT.PIECE_SIZE,
    });
  });
});
