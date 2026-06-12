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
    expect(uiSceneSource).not.toContain('summonHint');
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
    expect(uiSceneSource).toContain("align: 'center'");
    expect(uiSceneSource).toContain('fixedWidth: CONTENT_W');
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

  it('does not render a separate current-turn text label in the top HUD', () => {
    const uiSceneSource = readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8');

    expect(uiSceneSource).not.toContain('this.turnText');
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
    expect(UI_ASSETS.brandLogo).toEqual({
      key: 'brand_logo',
      path: 'assets/brand/chesssummon-logo.png',
      type: 'image',
    });
    expect(UI_ASSETS.stageBackground).toEqual({
      key: 'ui_stage_background',
      path: 'assets/ui/stage-background.svg',
    });
    expect(UI_ASSETS.titleBackground).toEqual({
      key: 'ui_title_background',
      path: 'assets/ui/title-background.png',
      type: 'image',
    });
    expect(UI_ASSETS.titleButtonFrame).toEqual({
      key: 'ui_title_button_frame',
      path: 'assets/ui/title-button-frame.png',
      type: 'image',
    });
    expect(UI_ASSETS.gameBackground).toEqual({
      key: 'ui_game_background',
      path: 'assets/ui/game-background.png',
      type: 'image',
    });
    expect(UI_ASSETS.gameTopHudFrame).toEqual({
      key: 'ui_game_top_hud_frame',
      path: 'assets/ui/game-top-hud-frame.png',
      type: 'image',
    });
    expect(UI_ASSETS.gameSummonCardFrame).toEqual({
      key: 'ui_game_summon_card_frame',
      path: 'assets/ui/game-summon-card-frame.png',
      type: 'image',
    });
    expect(UI_ASSETS.gameSummonTileFrame).toEqual({
      key: 'ui_game_summon_tile_frame',
      path: 'assets/ui/game-summon-tile-frame.png',
      type: 'image',
    });
    expect(UI_ASSETS.gameManaFrame).toEqual({
      key: 'ui_game_mana_frame',
      path: 'assets/ui/game-mana-frame.png',
      type: 'image',
    });
    expect(UI_ASSETS.gameActionButtonFrame).toEqual({
      key: 'ui_game_action_button_frame',
      path: 'assets/ui/game-action-button-frame.png',
      type: 'image',
    });
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
    expect(UI_ASSETS.frameTopHud).toEqual({
      key: 'ui_frame_top_hud',
      path: 'assets/ui/frame-top-hud.svg',
    });
    expect(UI_ASSETS.frameSummonCard).toEqual({
      key: 'ui_frame_summon_card',
      path: 'assets/ui/frame-summon-card.svg',
    });
    expect(UI_ASSETS.frameMana).toEqual({
      key: 'ui_frame_mana',
      path: 'assets/ui/frame-mana.svg',
    });
    expect(getButtonAssetKey()).toBe(UI_ASSETS.buttonPrimary.key);
    expect(getButtonAssetKey({ danger: true })).toBe(UI_ASSETS.buttonDanger.key);
    expect(getPanelAssetKey()).toBe(UI_ASSETS.frameHudPanel.key);
  });

  it('uses high-contrast metal button artwork for readability', () => {
    const logo = readFileSync(new URL('../public/assets/brand/chesssummon-logo.png', import.meta.url));
    const titleBackground = readFileSync(new URL('../public/assets/ui/title-background.png', import.meta.url));
    const titleButton = readFileSync(new URL('../public/assets/ui/title-button-frame.png', import.meta.url));
    const logoOrnament = readFileSync(new URL('../public/assets/brand/title-logo-ornament.png', import.meta.url));
    const gameBackground = readFileSync(new URL('../public/assets/ui/game-background.png', import.meta.url));
    const gameTopHud = readFileSync(new URL('../public/assets/ui/game-top-hud-frame.png', import.meta.url));
    const gameSummon = readFileSync(new URL('../public/assets/ui/game-summon-card-frame.png', import.meta.url));
    const gameSummonTile = readFileSync(new URL('../public/assets/ui/game-summon-tile-frame.png', import.meta.url));
    const gameMana = readFileSync(new URL('../public/assets/ui/game-mana-frame.png', import.meta.url));
    const gameAction = readFileSync(new URL('../public/assets/ui/game-action-button-frame.png', import.meta.url));
    const primary = readFileSync(new URL('../public/assets/ui/button-primary.svg', import.meta.url), 'utf8');
    const danger = readFileSync(new URL('../public/assets/ui/button-danger.svg', import.meta.url), 'utf8');
    const stage = readFileSync(new URL('../public/assets/ui/stage-background.svg', import.meta.url), 'utf8');
    const topHud = readFileSync(new URL('../public/assets/ui/frame-top-hud.svg', import.meta.url), 'utf8');
    const summon = readFileSync(new URL('../public/assets/ui/frame-summon-card.svg', import.meta.url), 'utf8');
    const mana = readFileSync(new URL('../public/assets/ui/frame-mana.svg', import.meta.url), 'utf8');

    expect(logo.length).toBeGreaterThan(500000);
    expect(logo.subarray(1, 4).toString()).toBe('PNG');
    expect(titleBackground.length).toBeGreaterThan(100000);
    expect(titleButton.length).toBeGreaterThan(100000);
    expect(logoOrnament.length).toBeGreaterThan(100000);
    expect(gameBackground.length).toBeGreaterThan(100000);
    expect(gameTopHud.length).toBeGreaterThan(30000);
    expect(gameSummon.length).toBeGreaterThan(15000);
    expect(gameSummonTile.length).toBeGreaterThan(10000);
    expect(gameMana.length).toBeGreaterThan(15000);
    expect(gameAction.length).toBeGreaterThan(10000);
    expect(primary).toContain('primaryBody');
    expect(primary).toContain('primaryEdge');
    expect(primary).toContain('#080D18');
    expect(primary).toContain('#FFE39A');
    expect(danger).toContain('dangerBody');
    expect(danger).toContain('dangerEdge');
    expect(danger).toContain('#14070B');
    expect(danger).toContain('#FFD1C9');
    expect(stage).toContain('stageStone');
    expect(topHud).toContain('topHudEdge');
    expect(summon).toContain('summonCardEdge');
    expect(mana).toContain('manaVial');
  });

  it('preloads reusable UI art before the menu scene starts', async () => {
    globalThis.Phaser = { Scene: class {} };
    const { BootScene } = await import('../src/scenes/BootScene.js');
    const scene = Object.create(BootScene.prototype);
    const loaded = [];
    scene.load = {
      svg: (key, path) => loaded.push({ key, path }),
      image: (key, path) => loaded.push({ key, path, type: 'image' }),
    };

    scene.preload();

    expect(loaded).toContainEqual(UI_ASSETS.buttonPrimary);
    expect(loaded).toContainEqual(UI_ASSETS.brandLogo);
    expect(loaded).toContainEqual(UI_ASSETS.buttonDanger);
    expect(loaded).toContainEqual(UI_ASSETS.frameHudPanel);
    expect(loaded).toContainEqual(UI_ASSETS.stageBackground);
    expect(loaded).toContainEqual(UI_ASSETS.titleBackground);
    expect(loaded).toContainEqual(UI_ASSETS.titleButtonFrame);
    expect(loaded).toContainEqual(UI_ASSETS.titleLogoOrnament);
    expect(loaded).toContainEqual(UI_ASSETS.gameBackground);
    expect(loaded).toContainEqual(UI_ASSETS.gameTopHudFrame);
    expect(loaded).toContainEqual(UI_ASSETS.gameSummonCardFrame);
    expect(loaded).toContainEqual(UI_ASSETS.gameSummonTileFrame);
    expect(loaded).toContainEqual(UI_ASSETS.gameManaFrame);
    expect(loaded).toContainEqual(UI_ASSETS.gameActionButtonFrame);
    expect(loaded).toContainEqual(UI_ASSETS.frameTopHud);
    expect(loaded).toContainEqual(UI_ASSETS.frameSummonCard);
    expect(loaded).toContainEqual(UI_ASSETS.frameMana);
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

  it('applies sliced/generated UI frames to the stage and gameplay HUD', () => {
    const visualsSource = readFileSync(new URL('../src/ui/visuals.js', import.meta.url), 'utf8');
    const uiSceneSource = readFileSync(new URL('../src/scenes/UIScene.js', import.meta.url), 'utf8');
    const gameSceneSource = readFileSync(new URL('../src/scenes/GameScene.js', import.meta.url), 'utf8');
    const resultSceneSource = readFileSync(new URL('../src/scenes/ResultScene.js', import.meta.url), 'utf8');

    expect(visualsSource).toContain('ui_stage_background');
    expect(visualsSource).toContain('ui_title_background');
    expect(visualsSource).toContain('ui_title_button_frame');
    expect(visualsSource).toContain('w / 2, 150, UI_ASSETS.brandLogo.key');
    expect(visualsSource).toContain('setDisplaySize(410, 205)');
    expect(visualsSource).toContain('ui_game_background');
    expect(visualsSource).toContain('ui_game_top_hud_frame');
    expect(visualsSource).not.toContain('scene.add.image(w / 2, 94, UI_ASSETS.titleLogoOrnament.key)');
    expect(visualsSource).toContain('addFramedImage');
    expect(gameSceneSource).toContain('UI_ASSETS.gameBackground.key');
    expect(gameSceneSource).not.toContain('UI_ASSETS.gameBoardFrame.key');
    expect(gameSceneSource).toContain('UI_ASSETS.stageBackground.key');
    expect(uiSceneSource).toContain('UI_ASSETS.gameTopHudFrame.key');
    expect(uiSceneSource).toContain('UI_ASSETS.gameSummonTileFrame.key');
    expect(uiSceneSource).toContain('UI_ASSETS.gameManaFrame.key');
    expect(uiSceneSource).toContain('UI_ASSETS.gameActionButtonFrame.key');
    expect(resultSceneSource).toContain('addStageBackground(this)');
    expect(resultSceneSource).toContain('addPanel(this, 35, 150, 380, 336');
    expect(resultSceneSource).toContain('addTextButton(this, cx, 590, 292, 70');
    expect(resultSceneSource).toContain('danger: !playerWon');
  });

  it('lets rendered board pieces slightly spill outside a single cell', () => {
    expect(LAYOUT.CELL_SIZE).toBeGreaterThanOrEqual(65);
    expect(LAYOUT.PIECE_SIZE).toBeGreaterThanOrEqual(LAYOUT.CELL_SIZE + 6);
    expect(LAYOUT.PIECE_SIZE).toBeLessThanOrEqual(LAYOUT.CELL_SIZE + 12);
    expect(LAYOUT.NON_PAWN_PIECE_SIZE).toBeGreaterThanOrEqual(LAYOUT.CELL_SIZE + 16);
    expect(LAYOUT.NON_PAWN_PIECE_SIZE).toBeLessThanOrEqual(LAYOUT.CELL_SIZE + 20);
    expect(LAYOUT.PIECE_SHADOW_WIDTH).toBeGreaterThanOrEqual(LAYOUT.CELL_SIZE - 14);
    expect(LAYOUT.PIECE_SHADOW_WIDTH).toBeLessThanOrEqual(LAYOUT.CELL_SIZE - 8);
  });

  it('uses a larger display size for non-pawn board pieces', () => {
    const gameSceneSource = readFileSync(new URL('../src/scenes/GameScene.js', import.meta.url), 'utf8');

    expect(gameSceneSource).toContain('_getPieceDisplaySize');
    expect(gameSceneSource).toContain('PieceType.PAWN');
    expect(gameSceneSource).toContain('LAYOUT.NON_PAWN_PIECE_SIZE');
  });

  it('reserves non-overlapping summon panel zones', () => {
    expect(LAYOUT.HUD_TOP_Y + LAYOUT.HUD_TOP_HEIGHT).toBeLessThan(LAYOUT.BOARD_OFFSET_Y - 8);
    expect(LAYOUT.HUD_PANEL_X + LAYOUT.HUD_PANEL_WIDTH).toBeLessThanOrEqual(LAYOUT.GAME_WIDTH - 12);
    const boardBottom = LAYOUT.BOARD_OFFSET_Y + LAYOUT.CELL_SIZE * 5 + 22;
    expect(LAYOUT.HUD_PANEL_Y - boardBottom).toBeLessThanOrEqual(18);
    const hintBottom = LAYOUT.HUD_SUMMON_LABEL_Y + 14;
    const firstSummonTop = LAYOUT.HUD_SUMMON_START_Y - LAYOUT.HUD_SUMMON_CARD_HEIGHT / 2;
    expect(hintBottom).toBeLessThanOrEqual(firstSummonTop - 6);
    expect(LAYOUT.HUD_SUMMON_CARD_HEIGHT).toBeGreaterThanOrEqual(100);
    expect(LAYOUT.HUD_SUMMON_CARD_WIDTH * 5).toBeLessThanOrEqual(LAYOUT.PANEL_WIDTH);
    expect(LAYOUT.HUD_SUMMON_ROW_GAP).toBeGreaterThanOrEqual(LAYOUT.HUD_SUMMON_CARD_WIDTH);
    const lastSummonBottom = LAYOUT.HUD_SUMMON_START_Y + LAYOUT.HUD_SUMMON_CARD_HEIGHT / 2;
    expect(LAYOUT.HUD_MANA_Y).toBeGreaterThan(lastSummonBottom + 16);
    const manaGaugeBottom = LAYOUT.HUD_MANA_Y + 11;
    const footerButtonTop = LAYOUT.HUD_FOOTER_Y - 19;
    const footerButtonBottom = LAYOUT.HUD_FOOTER_Y + 19;
    expect(manaGaugeBottom).toBeLessThanOrEqual(footerButtonTop - 14);
    expect(footerButtonBottom).toBeLessThanOrEqual(LAYOUT.HUD_PANEL_Y + LAYOUT.HUD_PANEL_HEIGHT - 6);
  });

  it('sizes the board to match the summon panel width', () => {
    const boardGridWidth = LAYOUT.CELL_SIZE * 5;
    const boardFrameWidth = boardGridWidth + 44;

    expect(Math.abs(boardGridWidth - LAYOUT.PANEL_WIDTH)).toBeLessThanOrEqual(2);
    expect(Math.abs(boardFrameWidth - LAYOUT.HUD_PANEL_WIDTH)).toBeLessThanOrEqual(2);
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
    expect(LAYOUT.CELL_SIZE * 5).toBeGreaterThanOrEqual(325);
    expect(boardLeft).toBeGreaterThanOrEqual(0);
    expect(boardRight).toBeLessThanOrEqual(LAYOUT.GAME_WIDTH);
    expect(boardBottom).toBeLessThanOrEqual(hudTop);
    expect(hudTop - boardBottom).toBeLessThanOrEqual(18);
    expect(hudBottom).toBeLessThanOrEqual(LAYOUT.GAME_HEIGHT - 4);
  });
});
