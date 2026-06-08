import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { LAYOUT, PieceType } from '../src/config.js';
import {
  getPieceName, UI_COPY, getButtonColors, getTurnHint,
  UI_ASSETS, getButtonAssetKey, getPanelAssetKey, formatManaGaugeLabel,
} from '../src/ui/visuals.js';

describe('visual theme helpers', () => {
  it('provides labels for all summonable pieces', () => {
    for (const type of [PieceType.PAWN, PieceType.KNIGHT, PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN]) {
      expect(getPieceName(type)).toEqual(expect.any(String));
      expect(getPieceName(type).length).toBeGreaterThan(0);
    }
  });

  it('keeps primary UX copy present', () => {
    expect(UI_COPY.menu.subtitle).toEqual(expect.any(String));
    expect(UI_COPY.game.endTurn).toEqual(expect.any(String));
    expect(UI_COPY.game.surrender).toEqual(expect.any(String));
    expect(UI_COPY.tutorial.complete).toEqual(expect.any(String));
  });

  it('keeps one move and one summon guidance in help, not HUD action boxes', () => {
    const uiSceneSource = readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8');

    expect(uiSceneSource).not.toContain('_addActionSlot');
    expect(uiSceneSource).not.toContain('moveSlot');
    expect(uiSceneSource).not.toContain('summonSlot');
    expect(uiSceneSource).not.toContain('turnRule');
    expect(UI_COPY.help.lines.some(line => line.includes('1'))).toBe(true);
  });

  it('uses mana icon semantics instead of a separate cost label', () => {
    expect(UI_COPY.game.manaIconLabel).toEqual(expect.any(String));
    expect(UI_COPY.game.manaIconLabel.length).toBeGreaterThan(0);
    expect(UI_COPY.game.cost).toBe('');
  });

  it('shows the current mana count directly inside the mana gauge', () => {
    const uiSceneSource = readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8');

    expect(formatManaGaugeLabel(3)).toBe('보유 마나 3 / 10');
    expect(formatManaGaugeLabel(99)).toBe('보유 마나 10 / 10');
    expect(uiSceneSource).toContain('formatManaGaugeLabel');
    expect(uiSceneSource).toContain('manaText.setStroke');
  });

  it('keeps summon buttons focused on piece name and mana cost only', () => {
    const uiSceneSource = readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8');

    expect(uiSceneSource).not.toContain('getSummonGradeStars');
    expect(uiSceneSource).not.toContain('getSummonRequirementLabel');
    expect(uiSceneSource).not.toContain('SUMMON_CARD_META');
  });

  it('returns board hints for turn states', () => {
    expect(getTurnHint({ hasMoved: false, hasSummoned: false, mode: 'default' })).toEqual(expect.any(String));
    expect(getTurnHint({ hasMoved: false, hasSummoned: false, mode: 'summon' })).toEqual(expect.any(String));
    expect(getTurnHint({ hasMoved: true, hasSummoned: false, mode: 'default' })).toEqual(expect.any(String));
    expect(getTurnHint({ hasMoved: true, hasSummoned: true, mode: 'default' })).toEqual(expect.any(String));
  });

  it('moves board hint text into the compact top HUD', () => {
    const gameSceneSource = readFileSync(new URL('../src/scenes/GameScene.js', import.meta.url), 'utf8');
    const uiSceneSource = readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8');

    expect(gameSceneSource).toContain("this.events.emit('hint-change'");
    expect(gameSceneSource).not.toContain('HINT_FRAME_WIDTH');
    expect(uiSceneSource).toContain("gameScene.events.on('hint-change'");
    expect(uiSceneSource).toContain('this.hintText');
    expect(uiSceneSource).toContain('maxLines: 1');
    expect(uiSceneSource).toContain('compactHint');
    expect(uiSceneSource).not.toContain('wordWrap: { width: CONTENT_W - 82 }');
  });

  it('shows both chess clocks in the top HUD', () => {
    const uiSceneSource = readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8');

    expect(uiSceneSource).toContain('this.playerClockText');
    expect(uiSceneSource).toContain('this.aiClockText');
    expect(uiSceneSource).toContain('_setClockTexts');
    expect(uiSceneSource).toContain('clockTimes');
  });

  it('uses a taller help modal so body text and buttons stay separated', () => {
    const uiSceneSource = readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8');

    expect(uiSceneSource).toContain('400, 390');
    expect(uiSceneSource).toContain('cy + 160');
    expect(uiSceneSource).toContain('wordWrap: { width: 344 }');
  });

  it('returns distinct button colors for enabled, active, and disabled states', () => {
    const enabled = getButtonColors({ enabled: true, active: false });
    const active = getButtonColors({ enabled: true, active: true });
    const disabled = getButtonColors({ enabled: false, active: false });

    expect(enabled.fill).not.toBe(active.fill);
    expect(enabled.fill).not.toBe(disabled.fill);
    expect(disabled.alpha).toBeLessThan(enabled.alpha);
    expect(active.text).toBe(0xffffff);
  });

  it('maps reusable SVG assets to shared UI controls', () => {
    expect(UI_ASSETS.buttonPrimary).toEqual({
      key: 'ui_button_primary',
      path: 'assets/ui/button-primary.svg',
    });
    expect(UI_ASSETS.buttonDanger).toEqual({
      key: 'ui_button_danger',
      path: 'assets/ui/button-danger.svg',
    });
    expect(UI_ASSETS.frameHudPanel).toEqual({
      key: 'ui_frame_hud_panel',
      path: 'assets/ui/frame-hud-panel.svg',
    });
    expect(getButtonAssetKey()).toBe(UI_ASSETS.buttonPrimary.key);
    expect(getButtonAssetKey({ danger: true })).toBe(UI_ASSETS.buttonDanger.key);
    expect(getPanelAssetKey()).toBe(UI_ASSETS.frameHudPanel.key);
  });

  it('uses high-contrast metal button artwork for readability', () => {
    const primary = readFileSync(new URL('../public/assets/ui/button-primary.svg', import.meta.url), 'utf8');
    const danger = readFileSync(new URL('../public/assets/ui/button-danger.svg', import.meta.url), 'utf8');

    expect(primary).toContain('primaryBody');
    expect(primary).toContain('primaryEdge');
    expect(primary).toContain('#080D18');
    expect(primary).toContain('#FFE39A');
    expect(danger).toContain('dangerBody');
    expect(danger).toContain('dangerEdge');
    expect(danger).toContain('#14070B');
    expect(danger).toContain('#FFD1C9');
  });

  it('preloads reusable UI art before the menu scene starts', async () => {
    globalThis.Phaser = { Scene: class {} };
    const { BootScene } = await import('../src/scenes/BootScene.js');
    const scene = Object.create(BootScene.prototype);
    const loaded = [];
    scene.load = { svg: (key, path) => loaded.push({ key, path }) };

    scene.preload();

    expect(loaded).toContainEqual(UI_ASSETS.buttonPrimary);
    expect(loaded).toContainEqual(UI_ASSETS.buttonDanger);
    expect(loaded).toContainEqual(UI_ASSETS.frameHudPanel);
  });

  it('uses preloaded button and frame artwork when Phaser textures are available', async () => {
    const images = [];
    const rectangles = [];
    const graphics = [];
    const makeImage = key => ({
      key,
      setDisplaySize() { return this; },
      setAlpha() { return this; },
      setDepth() { return this; },
      setTint() { return this; },
      clearTint() { return this; },
    });
    const makeRectangle = () => ({
      setInteractive() { return this; },
      setAlpha() { return this; },
      setDepth() { return this; },
      setStrokeStyle() { return this; },
      setFillStyle() { return this; },
      setData(key, value) { this[key] = value; return this; },
      getData(key) { return this[key]; },
      on() { return this; },
    });
    const scene = {
      textures: { exists: () => true },
      add: {
        image: (_x, _y, key) => {
          const image = makeImage(key);
          images.push(image);
          return image;
        },
        rectangle: () => {
          const rectangle = makeRectangle();
          rectangles.push(rectangle);
          return rectangle;
        },
        text: () => ({
          setOrigin() { return this; },
          setDepth() { return this; },
          setColor() { return this; },
          setAlpha() { return this; },
        }),
        graphics: () => {
          const graphic = { setDepth() { return this; } };
          graphics.push(graphic);
          return graphic;
        },
      },
      tweens: { add: () => {} },
    };

    const { addPanel, addTextButton } = await import('../src/ui/visuals.js');
    const panel = addPanel(scene, 0, 0, 120, 80);
    const button = addTextButton(scene, 50, 50, 160, 44, 'Start');

    expect(panel.key).toBe(UI_ASSETS.frameHudPanel.key);
    expect(button.bg.key).toBe(UI_ASSETS.buttonPrimary.key);
    expect(images.map(image => image.key)).toEqual([
      UI_ASSETS.frameHudPanel.key,
      UI_ASSETS.buttonPrimary.key,
    ]);
    expect(rectangles).toHaveLength(1);
    expect(graphics).toHaveLength(0);
  });

  it('lets rendered board pieces slightly spill outside a single cell', () => {
    expect(LAYOUT.CELL_SIZE).toBeGreaterThanOrEqual(62);
    expect(LAYOUT.PIECE_SIZE).toBeGreaterThanOrEqual(LAYOUT.CELL_SIZE + 8);
    expect(LAYOUT.PIECE_SIZE).toBeLessThanOrEqual(LAYOUT.CELL_SIZE + 12);
    expect(LAYOUT.PIECE_SHADOW_WIDTH).toBeGreaterThanOrEqual(LAYOUT.CELL_SIZE - 14);
    expect(LAYOUT.PIECE_SHADOW_WIDTH).toBeLessThanOrEqual(LAYOUT.CELL_SIZE - 8);
  });

  it('reserves non-overlapping summon panel zones', () => {
    expect(LAYOUT.HUD_TOP_Y + LAYOUT.HUD_TOP_HEIGHT).toBeLessThan(LAYOUT.BOARD_OFFSET_Y - 8);
    expect(LAYOUT.HUD_PANEL_X + LAYOUT.HUD_PANEL_WIDTH).toBeLessThanOrEqual(LAYOUT.GAME_WIDTH - 12);
    const boardBottom = LAYOUT.BOARD_OFFSET_Y + LAYOUT.CELL_SIZE * 5 + 22;
    expect(LAYOUT.HUD_PANEL_Y - boardBottom).toBeLessThanOrEqual(18);
    const hintBottom = LAYOUT.HUD_SUMMON_LABEL_Y + 16 + 14;
    const firstSummonTop = LAYOUT.HUD_SUMMON_START_Y - LAYOUT.HUD_SUMMON_ROW_HEIGHT / 2;
    expect(hintBottom).toBeLessThanOrEqual(firstSummonTop - 6);
    const lastSummonBottom = LAYOUT.HUD_SUMMON_START_Y + LAYOUT.HUD_SUMMON_ROW_GAP * 4 + LAYOUT.HUD_SUMMON_ROW_HEIGHT / 2;
    expect(LAYOUT.HUD_MANA_Y).toBeGreaterThan(lastSummonBottom + 16);
    const manaGaugeBottom = LAYOUT.HUD_MANA_Y + 11;
    const footerButtonTop = LAYOUT.HUD_FOOTER_Y - 17;
    const footerButtonBottom = LAYOUT.HUD_FOOTER_Y + 17;
    expect(manaGaugeBottom).toBeLessThanOrEqual(footerButtonTop - 14);
    expect(footerButtonBottom).toBeLessThanOrEqual(LAYOUT.HUD_PANEL_Y + LAYOUT.HUD_PANEL_HEIGHT - 6);
  });

  it('uses a 9:16 portrait playfield with top HUD, board, and summon panel in separate vertical zones', () => {
    expect(LAYOUT.GAME_WIDTH).toBe(450);
    expect(LAYOUT.GAME_HEIGHT).toBe(800);

    const topHudBottom = LAYOUT.HUD_TOP_Y + LAYOUT.HUD_TOP_HEIGHT;
    const boardLeft = LAYOUT.BOARD_OFFSET_X - 22;
    const boardRight = LAYOUT.BOARD_OFFSET_X + LAYOUT.CELL_SIZE * 5 + 22;
    const boardBottom = LAYOUT.BOARD_OFFSET_Y + LAYOUT.CELL_SIZE * 5 + 22;
    const hudTop = LAYOUT.HUD_PANEL_Y;
    const hudBottom = LAYOUT.HUD_PANEL_Y + LAYOUT.HUD_PANEL_HEIGHT;

    expect(topHudBottom).toBeLessThan(LAYOUT.BOARD_OFFSET_Y);
    expect(LAYOUT.CELL_SIZE * 5).toBeGreaterThanOrEqual(310);
    expect(boardLeft).toBeGreaterThanOrEqual(0);
    expect(boardRight).toBeLessThanOrEqual(LAYOUT.GAME_WIDTH);
    expect(boardBottom).toBeLessThanOrEqual(hudTop);
    expect(hudTop - boardBottom).toBeLessThanOrEqual(18);
    expect(hudBottom).toBeLessThanOrEqual(LAYOUT.GAME_HEIGHT - 12);
  });
});
