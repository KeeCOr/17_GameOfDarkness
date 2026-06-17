// src/scenes/ResultScene.js
import { COLORS, Difficulty, LAYOUT, TEXT_COLORS, Owner } from '../config.js';
import {
  addStageBackground,
  addTextButton,
  UI_ASSETS,
  UI_COPY,
} from '../ui/visuals.js';
import { createDefaultPawnPlacements, requiresManualPlacement } from './PlacementScene.js';

export class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  init(data) {
    this.winner = data.winner;
    this.resultReason = data.resultReason || null;
    this.difficulty = data.difficulty || Difficulty.EASY;
    this.aiProfile = data.aiProfile || null;
    this.replaying = false;
  }

  create() {
    const cx = LAYOUT.GAME_WIDTH / 2;
    const playerWon = this.winner === Owner.PLAYER;
    addStageBackground(this, '', { preferTitleArt: true });
    this._drawResultPresentation(playerWon);

    this.add.text(cx, 84, 'CHESS OF DARK', {
      fontSize: '16px',
      color: TEXT_COLORS.GOLD,
      fontStyle: 'bold',
      fontFamily: 'Georgia, "Times New Roman", serif',
    }).setOrigin(0.5).setDepth(4).setStroke('#050812', 4);

    const title = this.add.text(cx, 226, playerWon ? UI_COPY.result.win : UI_COPY.result.lose, {
      fontSize: playerWon ? '52px' : '50px',
      color: playerWon ? '#fff1b8' : '#ffb3a9',
      fontStyle: 'bold',
      align: 'center',
      fontFamily: 'Georgia, "Times New Roman", serif',
    }).setOrigin(0.5).setDepth(5);
    title.setStroke('#050812', 8);
    title.setShadow(0, 4, '#000000', 8, true, true);

    const detail = this.add.text(cx, 304, getResultDetailText(this.winner, this.resultReason), {
      fontSize: '21px',
      color: playerWon ? TEXT_COLORS.SUCCESS : '#ffcbc6',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 330 },
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(5);
    detail.setStroke('#050812', 5);

    this.add.text(cx, 368, getResultReasonLabel(this.resultReason), {
      fontSize: '14px',
      color: playerWon ? '#bfffe0' : '#ffc1ba',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(5).setStroke('#050812', 4);

    const replay = addTextButton(this, cx, 590, 322, 70, UI_COPY.result.replay, {
      fontSize: '22px',
      active: true,
      assetKey: UI_ASSETS.titleButtonFrame.key,
      depth: 6,
    });
    replay.rect.on('pointerdown', () => this._replay());

    const menu = addTextButton(this, cx, 682, 322, 70, UI_COPY.result.menu, {
      fontSize: '20px',
      danger: !playerWon,
      assetKey: UI_ASSETS.titleButtonFrame.key,
      depth: 6,
    });
    menu.rect.on('pointerdown', () => {
      this.scene.stop('UI');
      this.scene.start('Menu');
    });
  }

  _drawResultPresentation(playerWon) {
    const cx = LAYOUT.GAME_WIDTH / 2;
    const accent = playerWon ? COLORS.GOLD : COLORS.CRIMSON;
    const glow = playerWon ? 0xf7c84b : 0xd93636;

    this.add.rectangle(cx, LAYOUT.GAME_HEIGHT / 2, LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT, 0x030711, 0.34)
      .setDepth(0);
    this.add.circle(cx, 252, 164, glow, playerWon ? 0.12 : 0.16).setDepth(1);
    this.add.circle(cx, 252, 104, glow, playerWon ? 0.08 : 0.1).setDepth(1);

    if (this.textures?.exists?.(UI_ASSETS.titleButtonFrame.key)) {
      this.add.image(cx, 294, UI_ASSETS.titleButtonFrame.key)
        .setDisplaySize(374, 282)
        .setAlpha(0.88)
        .setTint(playerWon ? 0xffffff : 0xffd8d4)
        .setDepth(2);
    } else {
      this.add.rectangle(cx, 294, 374, 282, COLORS.PANEL_DEEP, 0.9)
        .setStrokeStyle(3, accent, playerWon ? 0.8 : 0.92)
        .setDepth(2);
    }

    this.add.rectangle(cx, 410, 278, 1, accent, playerWon ? 0.58 : 0.76)
      .setDepth(3);
  }

  _replay() {
    if (this.replaying) return;
    this.replaying = true;
    this.scene.stop('UI');
    this.scene.stop('Tutorial');
    this.scene.stop('Game');

    const startReplay = () => {
      if (requiresManualPlacement(this.difficulty)) {
        this.scene.start('Placement', {
          difficulty: this.difficulty,
          skipTutorialPrompt: true,
          aiProfile: this.aiProfile,
        });
        return;
      }

      this.scene.start('Game', {
        difficulty: this.difficulty,
        playerPlacements: createDefaultPawnPlacements(),
        aiProfile: this.aiProfile,
      });
    };

    if (this.time?.delayedCall) {
      this.time.delayedCall(0, startReplay);
      return;
    }

    startReplay();
  }
}

export function getResultDetailText(winner, resultReason) {
  const playerWon = winner === Owner.PLAYER;
  if (resultReason === 'timeout') {
    return playerWon ? UI_COPY.result.timeoutWin : UI_COPY.result.timeoutLose;
  }
  if (resultReason === 'checkmate') {
    return playerWon ? UI_COPY.result.checkmateWin : UI_COPY.result.checkmateLose;
  }
  return playerWon ? '상대 왕을 무너뜨렸습니다' : '왕을 빼앗겼습니다';
}

export function getResultReasonLabel(resultReason) {
  if (resultReason === 'timeout') return 'TIME OUT';
  if (resultReason === 'checkmate') return 'CHECKMATE';
  return 'KING CAPTURED';
}
