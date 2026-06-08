import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(() => {
  globalThis.Phaser = { Scene: class {} };
});

function makeDisplayObject(extra = {}) {
  return {
    destroyed: false,
    handlers: {},
    destroy() { this.destroyed = true; },
    setAlpha() { return this; },
    setDepth() { return this; },
    setDisplaySize() { return this; },
    setFillStyle() { return this; },
    setStrokeStyle() { return this; },
    setInteractive() { return this; },
    setOrigin() { return this; },
    setTint() { return this; },
    clearTint() { return this; },
    setData(key, value) { this[key] = value; return this; },
    getData(key) { return this[key]; },
    on(event, callback) {
      this.handlers[event] = this.handlers[event] || [];
      this.handlers[event].push(callback);
      return this;
    },
    ...extra,
  };
}

describe('UI modal cleanup', () => {
  it('destroys idle warning button art backgrounds when the modal closes', async () => {
    const { UIScene } = await import('../src/scenes/UIScene.js');
    const scene = Object.create(UIScene.prototype);
    const rectangles = [];
    const images = [];
    const texts = [];

    scene.textures = { exists: () => true };
    scene.add = {
      rectangle: () => {
        const obj = makeDisplayObject();
        rectangles.push(obj);
        return obj;
      },
      image: () => {
        const obj = makeDisplayObject();
        images.push(obj);
        return obj;
      },
      text: () => {
        const obj = makeDisplayObject({
          setColor() { return this; },
          setText() { return this; },
        });
        texts.push(obj);
        return obj;
      },
      graphics: () => makeDisplayObject({
        fillStyle() { return this; },
        beginPath() { return this; },
        moveTo() { return this; },
        lineTo() { return this; },
        closePath() { return this; },
        fillPath() { return this; },
        lineStyle() { return this; },
        strokePath() { return this; },
      }),
    };
    scene.tweens = { add: ({ onComplete }) => onComplete?.() };
    scene.gameScene = { resolveIdleWarning: () => {} };

    scene._showIdleWarning();

    rectangles[1].handlers.pointerdown.forEach(callback => callback());

    expect(images).toHaveLength(3);
    expect(images.every(image => image.destroyed)).toBe(true);
    expect(texts.every(text => text.destroyed)).toBe(true);
  });

  it('destroys tutorial confirmation button art when advancing an info popup', async () => {
    const { TutorialScene } = await import('../src/scenes/TutorialScene.js');
    const scene = Object.create(TutorialScene.prototype);
    const rectangles = [];
    const images = [];
    const texts = [];
    const circles = [];

    scene.stepIndex = 4;
    scene._overlayObjs = [];
    scene.textures = { exists: () => true };
    scene.add = {
      rectangle: () => {
        const obj = makeDisplayObject();
        rectangles.push(obj);
        return obj;
      },
      image: () => {
        const obj = makeDisplayObject();
        images.push(obj);
        return obj;
      },
      text: () => {
        const obj = makeDisplayObject({
          setStroke() { return this; },
          setShadow() { return this; },
        });
        texts.push(obj);
        return obj;
      },
      graphics: () => makeDisplayObject({
        fillStyle() { return this; },
        fillRoundedRect() { return this; },
        lineStyle() { return this; },
        strokeRoundedRect() { return this; },
      }),
      circle: () => {
        const obj = makeDisplayObject();
        circles.push(obj);
        return obj;
      },
    };
    scene.tweens = { add: () => {} };
    scene._nextStep = () => scene._clearOverlay();

    scene._showStep();
    const confirmRect = rectangles[rectangles.length - 1];
    confirmRect.handlers.pointerdown.forEach(callback => callback());

    expect(images.length).toBeGreaterThanOrEqual(2);
    expect(images.every(image => image.destroyed)).toBe(true);
    expect(texts.every(text => text.destroyed)).toBe(true);
    expect(circles.every(circle => circle.destroyed)).toBe(true);
  });
});
