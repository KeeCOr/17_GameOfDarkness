import { describe, it, expect } from 'vitest';
import { LAYOUT, PieceType, SUMMON_CARD_META, SummonRequirement } from '../src/config.js';
import {
  getPieceName, UI_COPY, getButtonColors, getTurnHint,
  getSummonGradeStars, getSummonRequirementLabel,
  UI_ASSETS, getButtonAssetKey, getPanelAssetKey,
} from '../src/ui/visuals.js';

describe('visual theme helpers', () => {
  it('provides readable Korean labels for all summonable pieces', () => {
    expect(getPieceName(PieceType.PAWN)).toBe('병사');
    expect(getPieceName(PieceType.KNIGHT)).toBe('기사');
    expect(getPieceName(PieceType.BISHOP)).toBe('주교');
    expect(getPieceName(PieceType.ROOK)).toBe('성채');
    expect(getPieceName(PieceType.QUEEN)).toBe('여왕');
  });

  it('keeps primary UX copy readable instead of mojibake', () => {
    expect(UI_COPY.menu.subtitle).toBe('난이도를 선택하세요');
    expect(UI_COPY.game.endTurn).toBe('턴 종료');
    expect(UI_COPY.game.surrender).toBe('기권');
    expect(UI_COPY.tutorial.complete).toContain('튜토리얼 완료');
  });

  it('explains one move and one summon per turn', () => {
    expect(UI_COPY.game.moveSlot).toBe('이동 1회');
    expect(UI_COPY.game.summonSlot).toBe('소환 1회');
    expect(UI_COPY.help.lines).toContain('한 턴에는 이동 1회와 소환 1회를 각각 사용할 수 있습니다.');
  });

  it('uses mana icon semantics instead of a separate cost label', () => {
    expect(UI_COPY.game.manaIconLabel).toBe('마나');
    expect(UI_COPY.game.cost).toBe('');
  });

  it('labels summon cards by requirement and star grade', () => {
    expect(SUMMON_CARD_META[PieceType.PAWN]).toEqual({ requirement: SummonRequirement.FREE, grade: 1 });
    expect(SUMMON_CARD_META[PieceType.ROOK]).toEqual({ requirement: SummonRequirement.TRIBUTE, grade: 3 });
    expect(SUMMON_CARD_META[PieceType.QUEEN]).toEqual({ requirement: SummonRequirement.TRIBUTE, grade: 5 });
    expect(getSummonRequirementLabel(SummonRequirement.FREE)).toBe('즉시');
    expect(getSummonRequirementLabel(SummonRequirement.TRIBUTE)).toBe('제물');
    expect(getSummonGradeStars(3)).toBe('★★★');
  });

  it('returns clear board hints for turn states', () => {
    expect(getTurnHint({ hasMoved: false, hasSummoned: false, mode: 'default' }))
      .toBe('말을 선택해 이동하거나, 소환 카드를 선택하세요');
    expect(getTurnHint({ hasMoved: false, hasSummoned: false, mode: 'summon' }))
      .toBe('초록 칸을 클릭하면 선택한 말을 소환합니다');
    expect(getTurnHint({ hasMoved: true, hasSummoned: false, mode: 'default' }))
      .toBe('이동 완료. 아직 소환 1회를 사용할 수 있습니다');
    expect(getTurnHint({ hasMoved: true, hasSummoned: true, mode: 'default' }))
      .toBe('이번 턴 행동 완료. 턴 종료를 누르세요');
  });

  it('returns distinct button colors for enabled, active, and disabled states', () => {
    const enabled = getButtonColors({ enabled: true, active: false });
    const active = getButtonColors({ enabled: true, active: true });
    const disabled = getButtonColors({ enabled: false, active: false });

    expect(enabled.fill).not.toBe(active.fill);
    expect(enabled.fill).not.toBe(disabled.fill);
    expect(disabled.alpha).toBeLessThan(enabled.alpha);
    expect(active.text).toBe(0x1a1208);
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

  it('keeps rendered board pieces inside a single cell', () => {
    expect(LAYOUT.PIECE_SIZE).toBeGreaterThanOrEqual(LAYOUT.CELL_SIZE);
    expect(LAYOUT.PIECE_SIZE).toBeLessThanOrEqual(LAYOUT.CELL_SIZE + 8);
    expect(LAYOUT.PIECE_SHADOW_WIDTH).toBeLessThanOrEqual(LAYOUT.CELL_SIZE - 18);
  });

  it('reserves non-overlapping summon panel zones', () => {
    expect(LAYOUT.HUD_TOP_Y + LAYOUT.HUD_TOP_HEIGHT).toBeLessThan(LAYOUT.BOARD_OFFSET_Y - 8);
    expect(LAYOUT.HUD_PANEL_X + LAYOUT.HUD_PANEL_WIDTH).toBeLessThanOrEqual(LAYOUT.GAME_WIDTH - 12);
    expect(LAYOUT.HUD_MANA_Y).toBeGreaterThan(LAYOUT.HUD_SUMMON_LABEL_Y);
    expect(LAYOUT.HUD_MANA_Y).toBeLessThan(LAYOUT.HUD_SUMMON_START_Y - 8);
    const lastSummonBottom = LAYOUT.HUD_SUMMON_START_Y + LAYOUT.HUD_SUMMON_ROW_GAP * 4 + LAYOUT.HUD_SUMMON_ROW_HEIGHT / 2;
    expect(lastSummonBottom).toBeLessThanOrEqual(LAYOUT.HUD_FOOTER_Y - 18);
  });

  it('uses a 9:16 portrait playfield with top HUD, board, and summon panel in separate vertical zones', () => {
    expect(LAYOUT.GAME_WIDTH).toBe(450);
    expect(LAYOUT.GAME_HEIGHT).toBe(800);

    const topHudBottom = LAYOUT.HUD_TOP_Y + LAYOUT.HUD_TOP_HEIGHT;
    const boardLeft = LAYOUT.BOARD_OFFSET_X - 22;
    const boardRight = LAYOUT.BOARD_OFFSET_X + LAYOUT.CELL_SIZE * 5 + 22;
    const boardBottom = LAYOUT.BOARD_OFFSET_Y + LAYOUT.CELL_SIZE * 5 + 72;
    const hudTop = LAYOUT.HUD_PANEL_Y;
    const hudBottom = LAYOUT.HUD_PANEL_Y + LAYOUT.HUD_PANEL_HEIGHT;

    expect(topHudBottom).toBeLessThan(LAYOUT.BOARD_OFFSET_Y);
    expect(boardLeft).toBeGreaterThanOrEqual(0);
    expect(boardRight).toBeLessThanOrEqual(LAYOUT.GAME_WIDTH);
    expect(boardBottom).toBeLessThan(hudTop);
    expect(hudBottom).toBeLessThanOrEqual(LAYOUT.GAME_HEIGHT - 12);
  });
});
