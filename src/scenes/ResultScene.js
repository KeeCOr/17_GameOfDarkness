// src/scenes/ResultScene.js
import { COLORS, Difficulty, LAYOUT, TEXT_COLORS, Owner } from '../config.js';
import {
  addStageBackground,
  addTextButton,
  UI_ASSETS,
  UI_COPY,
} from '../ui/visuals.js';
import { updateSinglePlayerRating } from '../game/singlePlayerRating.js';
import { createDefaultPawnPlacements, requiresManualPlacement } from './PlacementScene.js';

export class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  init(data) {
    this.winner = data.winner;
    this.resultReason = data.resultReason || null;
    this.difficulty = data.difficulty || Difficulty.EASY;
    this.aiProfile = data.aiProfile || null;
    this.multiplayerMode = data.multiplayerMode || null;
    this.replaying = false;
  }

  create() {
    const cx = LAYOUT.GAME_WIDTH / 2;
    const playerWon = this.winner === Owner.PLAYER;
    addStageBackground(this, '', { preferTitleArt: true });
    this._drawResultPresentation(playerWon);
    this._showSinglePlayerRatingChange(playerWon);

    const replay = addTextButton(this, cx, 590, 322, 70, UI_COPY.result.replay, {
      fontSize: '22px',
      active: true,
      assetKey: UI_ASSETS.titleButtonFrame.key,
      depth: 6,
      textOffsetY: 2,
    });
    replay.rect.on('pointerdown', () => this._replay());

    const menu = addTextButton(this, cx, 682, 322, 70, UI_COPY.result.menu, {
      fontSize: '20px',
      danger: !playerWon,
      assetKey: UI_ASSETS.titleButtonFrame.key,
      depth: 6,
      textOffsetY: 2,
    });
    menu.rect.on('pointerdown', () => {
      this.scene.stop('UI');
      this.scene.start('Menu');
    });
  }

  _showSinglePlayerRatingChange(playerWon) {
    const cx = LAYOUT.GAME_WIDTH / 2;
    const rating = updateSinglePlayerRating({
      winner: this.winner,
      multiplayerMode: this.multiplayerMode,
    });
    const deltaLabel = rating.delta > 0 ? `+${rating.delta}` : String(rating.delta);
    const deltaColor = rating.delta >= 0 ? TEXT_COLORS.SUCCESS : '#ff8f86';

    if (this.textures?.exists?.(UI_ASSETS.resultTrophy.key)) {
      this.add.image(cx, 214, UI_ASSETS.resultTrophy.key)
        .setDisplaySize(58, 58)
        .setDepth(5);
    } else {
      this.add.circle(cx, 214, 26, COLORS.GOLD, 0.9).setDepth(5);
    }

    const score = this.add.text(cx, 286, String(rating.current), {
      fontSize: '58px',
      color: playerWon ? '#fff1b8' : '#ffcbc6',
      fontStyle: 'bold',
      align: 'center',
      fontFamily: 'Georgia, "Times New Roman", serif',
    }).setOrigin(0.5).setDepth(5);
    score.setStroke?.('#050812', 8);
    score.setShadow?.(0, 4, '#000000', 8, true, true);

    const delta = this.add.text(cx, 360, deltaLabel, {
      fontSize: '30px',
      color: deltaColor,
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(5);
    delta.setStroke?.('#050812', 6);

    const progress = this.add.text(cx, 416, `${rating.previous} -> ${rating.current}${rating.capped ? '  CAP' : ''}`, {
      fontSize: '14px',
      color: TEXT_COLORS.MUTED,
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(5);
    progress.setStroke?.('#050812', 4);

    if (rating.delta < 0 && this.tweens?.add) {
      this.tweens.add({
        targets: delta,
        y: delta.y + 18,
        alpha: 0.72,
        duration: 520,
        ease: 'Cubic.easeIn',
        yoyo: true,
      });
    }
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
        .setDisplaySize(388, 316)
        .setAlpha(0.86)
        .setDepth(2);
    } else {
      this.add.rectangle(cx, 294, 374, 282, COLORS.PANEL_DEEP, 0.9)
        .setDepth(2)
        .setStrokeStyle(3, accent, playerWon ? 0.8 : 0.92);
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
  return '';
}
