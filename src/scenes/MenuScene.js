// src/scenes/MenuScene.js
import { LAYOUT, Difficulty, TEXT_COLORS } from '../config.js';
import { createSteamService } from '../services/SteamService.js';
import { RELEASE_CHANNELS, RELEASE_INFO } from '../releaseInfo.js';
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

    this.add.text(cx, 198, '5x5 ?꾩닠???꾩뿉??蹂묒궗瑜??뚰솚???뺤쓣 臾대꼫?⑤━?몄슂', {
      fontSize: '16px',
      color: TEXT_COLORS.MUTED,
    }).setOrigin(0.5);

    this.add.text(cx, 252, UI_COPY.menu.modeTitle, {
      fontSize: '22px',
      color: TEXT_COLORS.GOLD,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    addReleaseBadge(this, RELEASE_INFO.displayLabel);

    const single = addTextButton(this, cx, 365, 286, 70, UI_COPY.menu.single, { fontSize: '22px', active: true, assetKey: UI_ASSETS.titleButtonFrame.key });
    single.rect.on('pointerdown', () => this._showDifficultySelect());

    const multi = addTextButton(this, cx, 455, 286, 70, UI_COPY.menu.multiplayer, { fontSize: '22px', assetKey: UI_ASSETS.titleButtonFrame.key });
    multi.rect.on('pointerdown', () => this.scene.start('MultiplayerLobby'));
  }

  _showDifficultySelect({ showBack = true } = {}) {
    this._clearMenu();
    const cx = LAYOUT.GAME_WIDTH / 2;
    addStageBackground(this, UI_COPY.menu.title);

    this.add.text(cx, 196, UI_COPY.menu.single, {
      fontSize: '16px',
      color: TEXT_COLORS.MUTED,
    }).setOrigin(0.5);

    this.add.text(cx, 242, UI_COPY.menu.subtitle, {
      fontSize: '22px',
      color: TEXT_COLORS.GOLD,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    addReleaseBadge(this, RELEASE_INFO.displayLabel);

    const difficulties = [
      { value: Difficulty.EASY, y: 312 },
      { value: Difficulty.MEDIUM, y: 382 },
      { value: Difficulty.HARD, y: 452 },
      { value: Difficulty.VERY_HARD, y: 522 },
    ];

    for (const { value, y } of difficulties) {
      const locked = value === Difficulty.VERY_HARD && !this._isVeryHardUnlocked();
      const label = UI_COPY.menu.difficulties[value];
      const hint = locked ? UI_COPY.menu.veryHardLocked : UI_COPY.menu.difficultyHints[value];
      const button = addTextButton(this, cx, y, 286, 66, label, { fontSize: '21px', enabled: !locked, assetKey: UI_ASSETS.titleButtonFrame.key });
      this.add.text(cx, y + 36, hint, {
        fontSize: '12px',
        color: locked ? TEXT_COLORS.TIMER_LOW : TEXT_COLORS.MUTED,
      }).setOrigin(0.5);
      if (!locked) this._wireDifficultyOption(button, cx, y, value);
    }

    if (showBack) {
      const back = addTextButton(this, cx, 632, 178, 48, UI_COPY.menu.back, { fontSize: '15px', assetKey: UI_ASSETS.titleButtonFrame.key });
      back.rect.on('pointerdown', () => this._showModeSelect());
    }
  }

  _wireDifficultyOption(button, x, y, value) {
    const startPlacement = () => this.scene.start('Placement', { difficulty: value });
    button.rect.on('pointerdown', startPlacement);

    const hitArea = this.add.rectangle(x, y + 18, 270, 76, 0x000000)
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
  return releaseInfo?.channel === RELEASE_CHANNELS.STEAM;
}

