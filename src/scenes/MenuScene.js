// src/scenes/MenuScene.js
import { LAYOUT, Difficulty, TEXT_COLORS } from '../config.js';
import { createSteamService } from '../services/SteamService.js';
import { RELEASE_INFO } from '../releaseInfo.js';
import {
  addReleaseBadge,
  addStageBackground,
  addTextButton,
  UI_ASSETS,
  UI_COPY,
} from '../ui/visuals.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    this.buttons = [];
    this.steamService ||= createSteamService();
    if (shouldShowModeSelect(RELEASE_INFO)) {
      this.mode = 'mode';
      this._showModeSelect();
      return;
    }

    this.mode = 'difficulty';
    this._showDifficultySelect({ showBack: false });
  }

  _clearMenu() {
    this.children.removeAll(true);
    this.buttons = [];
  }

  _showModeSelect() {
    this._clearMenu();
    const cx = LAYOUT.GAME_WIDTH / 2;
    addStageBackground(this, UI_COPY.menu.title);

    addReleaseBadge(this, `v${RELEASE_INFO.version}`);

    const single = addTextButton(this, cx, 440, 322, 90, UI_COPY.menu.single, { fontSize: '22px', active: true, assetKey: UI_ASSETS.titleButtonFrame.key, textOffsetY: 0 });
    single.rect.on('pointerdown', () => this._showDifficultySelect());

    const multi = addTextButton(this, cx, 548, 322, 90, UI_COPY.menu.multiplayer, { fontSize: '22px', assetKey: UI_ASSETS.titleButtonFrame.key, textOffsetY: 0 });
    multi.rect.on('pointerdown', () => this.scene.start('MultiplayerLobby'));
  }

  _showDifficultySelect({ showBack = true } = {}) {
    this._clearMenu();
    const cx = LAYOUT.GAME_WIDTH / 2;
    addStageBackground(this, UI_COPY.menu.title);

    addReleaseBadge(this, `v${RELEASE_INFO.version}`);

    const difficulties = [
      { value: Difficulty.EASY, y: 326 },
      { value: Difficulty.MEDIUM, y: 428 },
      { value: Difficulty.HARD, y: 530 },
      { value: Difficulty.VERY_HARD, y: 632 },
    ];

    for (const { value, y } of difficulties) {
      const locked = value === Difficulty.VERY_HARD && !this._isVeryHardUnlocked();
      const label = UI_COPY.menu.difficulties[value];
      const hint = locked ? UI_COPY.menu.veryHardLocked : UI_COPY.menu.difficultyHints[value];
      const button = addTextButton(this, cx, y, 322, 92, label, { fontSize: '20px', assetKey: UI_ASSETS.titleButtonFrame.key });
      button.text.y = y - 2;
      this.add.text(cx, y + 28, hint, {
        fontSize: '11px',
        color: locked ? TEXT_COLORS.TIMER_LOW : TEXT_COLORS.MUTED,
        fontStyle: 'bold',
        align: 'center',
      }).setOrigin(0.5);
      if (!locked) this._wireDifficultyOption(button, cx, y, value);
    }

    if (showBack) {
      const back = addTextButton(this, cx, 724, 198, 52, UI_COPY.menu.back, {
        fontSize: '15px',
        assetKey: UI_ASSETS.titleButtonFrame.key,
        textOffsetY: 2,
      });
      back.rect.on('pointerdown', () => this._showModeSelect());
    }
  }

  _wireDifficultyOption(button, x, y, value) {
    const startPlacement = () => this.scene.start('Placement', { difficulty: value });
    button.rect.on('pointerdown', startPlacement);

    const hitArea = this.add.rectangle(x, y, 322, 100, 0x000000)
      .setAlpha(0.001)
      .setDepth(5)
      .setInteractive({ useHandCursor: true })
      .setData('difficultyHitArea', value);

    hitArea.on('pointerover', () => button.rect.setFillStyle(0x394779));
    hitArea.on('pointerout', () => button.rect.setFillStyle(0x263155));
    hitArea.on('pointerdown', startPlacement);
  }

  _isVeryHardUnlocked() {
    return Boolean(this.steamService?.isUnlocked?.('hard_win'));
  }
}

export function shouldShowModeSelect(releaseInfo = RELEASE_INFO) {
  return Boolean(releaseInfo);
}


