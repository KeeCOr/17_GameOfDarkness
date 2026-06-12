import { describe, it, expect, beforeAll } from 'vitest';
import { Difficulty } from '../src/config.js';

beforeAll(() => {
  globalThis.Phaser = { Scene: class {} };
});

function makeMenuScene(options = {}) {
  const rectangles = [];
  const texts = [];
  const images = [];
  const starts = [];

  const textureKeys = new Set(options.textureKeys || []);

  const makeRect = (x, y, width, height, fill) => {
    const data = {};
    const handlers = {};
    const rect = {
      data,
      handlers,
      x,
      y,
      width,
      height,
      fill,
      setInteractive() { this.interactive = true; return this; },
      setAlpha(value) { this.alpha = value; return this; },
      setDepth(value) { this.depth = value; return this; },
      setStrokeStyle() { return this; },
      setFillStyle(value) { this.fill = value; return this; },
      setData(key, value) { data[key] = value; return this; },
      getData(key) { return data[key]; },
      on(event, handler) { handlers[event] = handler; return this; },
      destroy() {},
    };
    rectangles.push(rect);
    return rect;
  };

  const makeImage = (x, y, key) => {
    const image = {
      x,
      y,
      key,
      setDisplaySize(width, height) { this.width = width; this.height = height; return this; },
      setAlpha(value) { this.alpha = value; return this; },
      setDepth(value) { this.depth = value; return this; },
      setTint(value) { this.tint = value; return this; },
      clearTint() { this.tint = null; return this; },
      destroy() {},
    };
    images.push(image);
    return image;
  };

  const makeText = (_x, _y, value, style = {}) => {
    const text = {
      value,
      style,
      x: _x,
      y: _y,
      origin: null,
      depth: 0,
      setOrigin(x, y = x) { this.origin = { x, y }; return this; },
      setDepth(value) { this.depth = value; return this; },
      setColor(value) { this.color = value; return this; },
      setAlpha(value) { this.alpha = value; return this; },
      setText(value) { this.value = value; return this; },
      destroy() {},
    };
    texts.push(text);
    return text;
  };
  const text = {
    setOrigin() { return this; },
    setDepth() { return this; },
    setColor() { return this; },
    setAlpha() { return this; },
    destroy() {},
  };
  const graphics = {
    lineStyle() { return this; },
    strokeRect() { return this; },
    strokeCircle() { return this; },
    beginPath() { return this; },
    moveTo() { return this; },
    lineTo() { return this; },
    closePath() { return this; },
    strokePath() { return this; },
    destroy() {},
  };

  return {
    rectangles,
    texts,
    images,
    starts,
    scene: {
      add: {
        rectangle: makeRect,
        image: makeImage,
        text: makeText,
        graphics: () => graphics,
      },
      children: { removeAll() {} },
      textures: { exists: key => textureKeys.has(key) },
      tweens: { add() {} },
      scene: { start: (key, data) => starts.push({ key, data }) },
    },
  };
}

describe('menu flow', () => {
  it('uses the full mode select flow on Steam release builds', async () => {
    const { shouldShowModeSelect } = await import('../src/scenes/MenuScene.js');

    expect(shouldShowModeSelect({ channel: 'steam' })).toBe(true);
    expect(shouldShowModeSelect({ channel: 'desktop' })).toBe(false);
    expect(shouldShowModeSelect({ channel: 'html' })).toBe(false);
  });

  it('opens directly on difficulty select during test distribution', async () => {
    const { MenuScene } = await import('../src/scenes/MenuScene.js');
    const { scene, rectangles, texts } = makeMenuScene();
    Object.setPrototypeOf(scene, MenuScene.prototype);

    scene.create();

    expect(rectangles.some(rect => rect.getData('difficultyHitArea') === Difficulty.EASY)).toBe(true);
    expect(rectangles.some(rect => rect.getData('difficultyHitArea') === Difficulty.MEDIUM)).toBe(true);
    expect(rectangles.some(rect => rect.getData('difficultyHitArea') === Difficulty.HARD)).toBe(true);
    expect(rectangles.some(rect => rect.getData('difficultyHitArea') === Difficulty.VERY_HARD)).toBe(false);
    expect(texts.some(text => text.value === '?뚮젅??紐⑤뱶 ?좏깮')).toBe(false);
  }, 10000);

  it('shows clean start copy without the mode-select title', async () => {
    const { MenuScene } = await import('../src/scenes/MenuScene.js');
    const { UI_COPY } = await import('../src/ui/visuals.js');
    const { scene, texts } = makeMenuScene();
    Object.setPrototypeOf(scene, MenuScene.prototype);

    scene._showModeSelect();

    expect(texts.some(text => text.value === '5x5 어둠의 전장에서 말을 소환해 왕을 무너뜨리세요')).toBe(false);
    expect(texts.some(text => text.value === UI_COPY.menu.modeTitle)).toBe(false);
    expect(texts.find(text => text.value === UI_COPY.menu.single)?.style.fontSize).toBe('22px');
    expect(texts.find(text => text.value === UI_COPY.menu.multiplayer)?.style.fontSize).toBe('22px');
    expect(texts.some(text => /[�]|\\?꾩|硫|筌|諭/.test(String(text.value)))).toBe(false);
  }, 10000);

  it('locks very hard until hard mode is cleared', async () => {
    const { MenuScene } = await import('../src/scenes/MenuScene.js');
    const { UI_COPY } = await import('../src/ui/visuals.js');
    const { scene, rectangles, texts, starts } = makeMenuScene();
    Object.setPrototypeOf(scene, MenuScene.prototype);
    scene.steamService = { isUnlocked: () => false };

    scene._showDifficultySelect();

    expect(rectangles.some(rect => rect.getData('difficultyHitArea') === Difficulty.VERY_HARD)).toBe(false);
    expect(texts.some(text => text.value === UI_COPY.menu.veryHardLocked)).toBe(true);
    expect(starts).toEqual([]);
  }, 10000);

  it('moves difficulty selection copy into taller buttons', async () => {
    const { MenuScene } = await import('../src/scenes/MenuScene.js');
    const { UI_ASSETS, UI_COPY } = await import('../src/ui/visuals.js');
    const { scene, images, texts } = makeMenuScene({ textureKeys: [UI_ASSETS.titleButtonFrame.key] });
    Object.setPrototypeOf(scene, MenuScene.prototype);

    scene._showDifficultySelect({ showBack: false });

    expect(texts.some(text => text.value === UI_COPY.menu.single && text.y === 266)).toBe(false);
    expect(texts.some(text => text.value === UI_COPY.menu.subtitle)).toBe(false);
    expect(texts.some(text => text.value === UI_COPY.menu.difficultyHints.EASY)).toBe(true);
    expect(texts.some(text => text.value === UI_COPY.menu.difficultyHints.MEDIUM)).toBe(true);
    expect(texts.find(text => text.value === UI_COPY.menu.difficulties.EASY)?.y).toBe(313);
    expect(texts.find(text => text.value === UI_COPY.menu.difficultyHints.EASY)?.y).toBe(346);

    const titleButtonFrames = images.filter(image => image.key === UI_ASSETS.titleButtonFrame.key);
    expect(titleButtonFrames.some(image => image.y === 326 && image.width === 322 && image.height === 92)).toBe(true);
    expect(titleButtonFrames.some(image => image.y === 632 && image.width === 322 && image.height === 92)).toBe(true);
  }, 10000);

  it('keeps the locked very hard option in the same full button format', async () => {
    const { MenuScene } = await import('../src/scenes/MenuScene.js');
    const { UI_ASSETS, UI_COPY } = await import('../src/ui/visuals.js');
    const { scene, images, texts, starts } = makeMenuScene({ textureKeys: [UI_ASSETS.titleButtonFrame.key] });
    Object.setPrototypeOf(scene, MenuScene.prototype);
    scene.steamService = { isUnlocked: () => false };

    scene._showDifficultySelect({ showBack: false });

    const titleButtonFrames = images.filter(image => image.key === UI_ASSETS.titleButtonFrame.key);
    const lockedFrame = titleButtonFrames.find(image => image.y === 632);
    const lockedLabel = texts.find(text => text.value === UI_COPY.menu.difficulties.VERY_HARD);
    const lockedHint = texts.find(text => text.value === UI_COPY.menu.veryHardLocked);

    expect(titleButtonFrames).toHaveLength(4);
    expect(lockedFrame).toMatchObject({ width: 322, height: 92, alpha: 1 });
    expect(lockedLabel).toMatchObject({ y: 619 });
    expect(lockedLabel.style.color).toBe('#ffffff');
    expect(lockedHint).toMatchObject({ y: 652 });
    expect(starts).toEqual([]);
  }, 10000);

  it('uses taller mode buttons with more touch padding', async () => {
    const { MenuScene } = await import('../src/scenes/MenuScene.js');
    const { UI_ASSETS } = await import('../src/ui/visuals.js');
    const { scene, images } = makeMenuScene({ textureKeys: [UI_ASSETS.titleButtonFrame.key] });
    Object.setPrototypeOf(scene, MenuScene.prototype);

    scene._showModeSelect();

    const titleButtonFrames = images.filter(image => image.key === UI_ASSETS.titleButtonFrame.key);
    expect(titleButtonFrames.some(image => image.y === 440 && image.width === 322 && image.height === 90)).toBe(true);
    expect(titleButtonFrames.some(image => image.y === 548 && image.width === 322 && image.height === 90)).toBe(true);
  }, 10000);

  it('unlocks very hard after hard mode has been cleared', async () => {
    const { MenuScene } = await import('../src/scenes/MenuScene.js');
    const { scene, rectangles, starts } = makeMenuScene();
    Object.setPrototypeOf(scene, MenuScene.prototype);
    scene.steamService = { isUnlocked: id => id === 'hard_win' };

    scene._showDifficultySelect();
    const veryHardHitArea = rectangles.find(rect => rect.getData('difficultyHitArea') === Difficulty.VERY_HARD);

    expect(veryHardHitArea).toBeDefined();
    veryHardHitArea.handlers.pointerdown();
    expect(starts).toEqual([
      { key: 'Placement', data: { difficulty: Difficulty.VERY_HARD } },
    ]);
  }, 10000);

  it('lets the enlarged difficulty hit area start placement', async () => {
    const { MenuScene } = await import('../src/scenes/MenuScene.js');
    const { scene, rectangles, starts } = makeMenuScene();
    Object.setPrototypeOf(scene, MenuScene.prototype);

    scene._showDifficultySelect();
    const hardHitArea = rectangles.find(rect => rect.getData('difficultyHitArea') === Difficulty.HARD);

    expect(hardHitArea).toBeDefined();
    hardHitArea.handlers.pointerdown();
    expect(starts).toEqual([
      { key: 'Placement', data: { difficulty: Difficulty.HARD } },
    ]);
  }, 10000);

  it('shows release channel and version on menu screens', async () => {
    const { MenuScene } = await import('../src/scenes/MenuScene.js');
    const { RELEASE_INFO } = await import('../src/releaseInfo.js');
    const { scene, texts } = makeMenuScene();
    Object.setPrototypeOf(scene, MenuScene.prototype);

    scene._showModeSelect();

    expect(texts.some(text => text.value === RELEASE_INFO.displayLabel)).toBe(true);
  });
});
