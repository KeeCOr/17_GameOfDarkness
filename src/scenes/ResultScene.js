// src/scenes/ResultScene.js
import { COLORS, Difficulty, LAYOUT, TEXT_COLORS, Owner } from '../config.js';
import {
  addPanel,
  addStageBackground,
  addTextButton,
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
    addStageBackground(this);
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

    const replay = addTextButton(this, cx, 590, 292, 70, UI_COPY.result.replay, {
      fontSize: '22px',
      active: true,
      depth: 6,
    });
    replay.rect.on('pointerdown', () => this._replay());

    const menu = addTextButton(this, cx, 682, 292, 70, UI_COPY.result.menu, {
      fontSize: '20px',
      danger: !playerWon,
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
    this.add.circle(cx, 256, 156, glow, playerWon ? 0.1 : 0.14).setDepth(1);
    this.add.circle(cx, 256, 96, glow, playerWon ? 0.08 : 0.1).setDepth(1);

    addPanel(this, 35, 150, 380, 336, {
      depth: 2,
      alpha: 0.93,
      fill: COLORS.PANEL_DEEP,
      stroke: accent,
      strokeAlpha: playerWon ? 0.8 : 0.92,
      lineWidth: 3,
      radius: 8,
    });

    const g = this.add.graphics().setDepth(3);
    g.lineStyle(2, accent, playerWon ? 0.72 : 0.85);
    g.strokeRoundedRect(55, 171, 340, 294, 6);
    g.lineStyle(1, COLORS.GOLD, 0.35);
    g.lineBetween(82, 408, 368, 408);
    g.lineStyle(1, accent, playerWon ? 0.5 : 0.72);
    g.beginPath();
    g.moveTo(cx - 122, 168);
    g.lineTo(cx - 80, 188);
    g.lineTo(cx + 80, 188);
    g.lineTo(cx + 122, 168);
    g.strokePath();

    if (!playerWon) {
      g.lineStyle(3, 0xff5349, 0.74);
      g.beginPath();
      g.moveTo(cx - 4, 178);
      g.lineTo(cx - 28, 238);
      g.lineTo(cx + 12, 292);
      g.lineTo(cx - 18, 378);
      g.strokePath();
      g.lineStyle(2, 0xff9a8e, 0.48);
      g.lineBetween(cx - 28, 238, cx - 80, 288);
      g.lineBetween(cx + 12, 292, cx + 70, 338);
    }

    this._drawResultCrown(cx, 154, playerWon);
  }

  _drawResultCrown(cx, y, playerWon) {
    const g = this.add.graphics().setDepth(5);
    const fill = playerWon ? 0xf0c46a : 0x3a1a1d;
    const stroke = playerWon ? 0xffefac : 0xff6b5f;
    const alpha = playerWon ? 0.95 : 0.86;
    g.fillStyle(fill, alpha);
    g.lineStyle(2, stroke, playerWon ? 0.86 : 0.68);
    g.beginPath();
    g.moveTo(cx - 48, y + 46);
    g.lineTo(cx - 40, y + 4);
    g.lineTo(cx - 18, y + 30);
    g.lineTo(cx, y - 4);
    g.lineTo(cx + 18, y + 30);
    g.lineTo(cx + 40, y + 4);
    g.lineTo(cx + 48, y + 46);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.fillRoundedRect(cx - 50, y + 42, 100, 18, 5);
    g.strokeRoundedRect(cx - 50, y + 42, 100, 18, 5);
    if (!playerWon) {
      g.lineStyle(3, 0xff6b5f, 0.8);
      g.lineBetween(cx - 20, y + 8, cx + 24, y + 56);
    }
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
