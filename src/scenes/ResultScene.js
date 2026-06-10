// src/scenes/ResultScene.js
import { Difficulty, LAYOUT, TEXT_COLORS, Owner } from '../config.js';
import { addStageBackground, addTextButton, UI_COPY } from '../ui/visuals.js';
import { createDefaultPawnPlacements } from './PlacementScene.js';

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
    addStageBackground(this, playerWon ? UI_COPY.result.win : UI_COPY.result.lose);

    this.add.text(cx, 165, getResultDetailText(this.winner, this.resultReason), {
      fontSize: '18px',
      color: playerWon ? TEXT_COLORS.SUCCESS : TEXT_COLORS.DANGER,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const replay = addTextButton(this, cx, 320, 220, 54, UI_COPY.result.replay);
    replay.rect.on('pointerdown', () => this._replay());

    const menu = addTextButton(this, cx, 390, 220, 54, UI_COPY.result.menu);
    menu.rect.on('pointerdown', () => {
      this.scene.stop('UI');
      this.scene.start('Menu');
    });
  }

  _replay() {
    if (this.replaying) return;
    this.replaying = true;
    this.scene.stop('UI');
    this.scene.stop('Tutorial');
    this.scene.stop('Game');

    const startReplay = () => {
      if (this.difficulty === Difficulty.HARD) {
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
  return playerWon ? '왕좌를 지켜냈습니다' : '왕좌를 빼앗겼습니다';
}
