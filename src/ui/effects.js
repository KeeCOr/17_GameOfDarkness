import { COLORS, LAYOUT, Owner } from '../config.js';
import { UI_ASSETS } from './visuals.js';

export const UI_RESOURCE_LIST = Object.freeze([
  {
    id: 'button-primary',
    type: 'button',
    purpose: 'Main menu, confirmation, and primary action buttons with a readable active state.',
    file: 'public/assets/ui/title-button-frame.png',
  },
  {
    id: 'button-danger',
    type: 'button',
    purpose: 'Surrender and destructive action buttons with clear risk language.',
    file: 'public/assets/ui/game-action-button-frame.png',
  },
  {
    id: 'frame-hud-panel',
    type: 'frame',
    purpose: 'Right HUD and modal panel frame with consistent gold edge and dark fill.',
    file: 'public/assets/ui/game-bottom-hud-frame.png',
  },
  {
    id: 'stage-background',
    type: 'background',
    purpose: 'Dark stone-and-gold stage background generated from the approved start screen direction.',
    file: 'public/assets/ui/game-background.png',
  },
  {
    id: 'frame-top-hud',
    type: 'frame',
    purpose: 'Top chess-clock HUD frame inspired by the approved play screen.',
    file: 'public/assets/ui/game-top-hud-frame.png',
  },
  {
    id: 'frame-summon-card',
    type: 'frame',
    purpose: 'Summon row/card frame inspired by the approved play screen.',
    file: 'public/assets/ui/game-summon-card-frame.png',
  },
  {
    id: 'frame-mana',
    type: 'frame',
    purpose: 'Mana gauge frame with cyan/gold accents.',
    file: 'public/assets/ui/game-mana-frame.png',
  },
  {
    id: 'battle-entry-plate',
    type: 'cropped-bitmap',
    purpose: 'Cropped battle-start plate from the approved gameplay mockup for the in-game entry overlay.',
    file: 'public/assets/ui/battle-entry-plate.png',
  },
  {
    id: 'state-check-alert',
    type: 'runtime-effect',
    purpose: 'Board-wide check warning using red vignette, king ring, and impact label.',
    file: 'src/ui/effects.js',
  },
  {
    id: 'fx-capture-impact',
    type: 'bitmap-effect',
    purpose: 'Strong capture impact: bitmap slash, shock ring, sparks, and short camera shake.',
    file: 'public/assets/fx/capture-impact-*.png',
  },
  {
    id: 'fx-promotion-burst',
    type: 'bitmap-effect',
    purpose: 'Promotion feedback: bitmap vertical beam, crown burst, and floating promotion label.',
    file: 'public/assets/fx/promotion-*.png',
  },
  {
    id: 'fx-checkmate-reveal',
    type: 'runtime-effect',
    purpose: 'Final checkmate move reveals the whole board with a gold/emerald light sweep before the result transition.',
    file: 'src/ui/effects.js',
  },
  {
    id: 'brand-logo',
    type: 'brand',
    purpose: 'Generated 3D metallic Chess of Dark bitmap logo for title, store, and promotional use.',
    file: 'public/assets/brand/chesssummon-logo.png',
  },
  {
    id: 'brand-mark',
    type: 'brand',
    purpose: 'Compact crown and summoning circle mark for icons and capsules.',
    file: 'public/assets/brand/chesssummon-mark.png',
  },
  {
    id: 'mmr-tier-icons',
    type: 'rank',
    purpose: 'MMR tier shield icons from bronze through master.',
    file: 'public/assets/rank/mmr-*.png',
  },
]);

export function playCaptureEffect(scene, x, y, { owner = Owner.AI } = {}) {
  const hostile = owner === Owner.AI;
  const slashColor = hostile ? 0xffe3a3 : 0xff4d5d;
  const ringColor = hostile ? COLORS.GOLD : COLORS.THREAT;
  scene.cameras?.main?.shake?.(140, 0.006);

  const ring = scene.add.image(x, y, UI_ASSETS.fxCaptureRing.key)
    .setDisplaySize(112, 112)
    .setDepth(8)
    .setTint(ringColor);
  const slash = scene.add.image(x, y, UI_ASSETS.fxCaptureSlash.key)
    .setDisplaySize(124, 124)
    .setDepth(9)
    .setTint(slashColor);

  const sparks = [];
  const sparkColor = hostile ? 0xfff0b8 : 0xff8a8a;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const spark = scene.add.rectangle(
      x + Math.cos(angle) * 12,
      y + Math.sin(angle) * 12,
      5,
      14,
      sparkColor,
    ).setDepth(10).setRotation(angle);
    sparks.push(spark);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * 46,
      y: y + Math.sin(angle) * 46,
      alpha: 0,
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => spark.destroy(),
    });
  }

  scene.tweens.add({
    targets: ring,
    alpha: 0,
    scaleX: 2.15,
    scaleY: 2.15,
    duration: 340,
    ease: 'Quad.easeOut',
    onComplete: () => ring.destroy(),
  });
  scene.tweens.add({
    targets: slash,
    alpha: 0,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 260,
    ease: 'Power2',
    onComplete: () => slash.destroy(),
  });
  showImpactLabel(scene, x, y - 46, 'CAPTURE', hostile ? '#ffd98a' : '#ff7d86');
}

export function playPromotionEffect(scene, x, y, { owner = Owner.PLAYER } = {}) {
  const player = owner === Owner.PLAYER;
  const beamColor = player ? COLORS.EMERALD : 0xff6b35;
  const labelColor = player ? '#7dffca' : '#ffad7a';
  scene.cameras?.main?.shake?.(180, 0.004);

  const beam = scene.add.image(x, LAYOUT.BOARD_OFFSET_Y + LAYOUT.CELL_SIZE * 2.5, UI_ASSETS.fxPromotionBeam.key)
    .setDisplaySize(74, LAYOUT.CELL_SIZE * 5 + 52)
    .setDepth(7)
    .setTint(beamColor);
  const burst = scene.add.image(x, y, UI_ASSETS.fxPromotionBurst.key)
    .setDisplaySize(126, 126)
    .setDepth(9)
    .setTint(player ? COLORS.GOLD : 0xffad7a);

  scene.tweens.add({
    targets: beam,
    alpha: 0,
    duration: 520,
    ease: 'Sine.easeOut',
    onComplete: () => beam.destroy(),
  });
  scene.tweens.add({
    targets: burst,
    alpha: 0,
    scaleX: 1.45,
    scaleY: 1.45,
    duration: 520,
    ease: 'Back.easeOut',
    onComplete: () => burst.destroy(),
  });
  showImpactLabel(scene, x, y - 58, 'PROMOTION', labelColor);
}

export function playCheckAlert(scene, x, y) {
  scene.cameras?.main?.shake?.(300, 0.009);

  // Full-screen red flash
  const overlay = scene.add.rectangle(
    LAYOUT.GAME_WIDTH / 2, LAYOUT.GAME_HEIGHT / 2,
    LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT,
    COLORS.CRIMSON, 0.32,
  ).setDepth(7);

  // Screen-edge danger border
  const border = scene.add.graphics().setDepth(8);
  border.lineStyle(20, COLORS.THREAT, 0.75);
  border.strokeRect(10, 10, LAYOUT.GAME_WIDTH - 20, LAYOUT.GAME_HEIGHT - 20);

  // Concentric rings expanding from king
  const ring = scene.add.graphics().setDepth(9);
  ring.lineStyle(5, COLORS.THREAT, 1);
  ring.strokeCircle(x, y, 32);
  ring.lineStyle(2, 0xffffff, 0.82);
  ring.strokeCircle(x, y, 46);

  scene.tweens.add({
    targets: overlay,
    alpha: 0,
    duration: 520,
    ease: 'Sine.easeOut',
    onComplete: () => overlay.destroy(),
  });
  scene.tweens.add({
    targets: border,
    alpha: 0,
    duration: 640,
    ease: 'Quad.easeOut',
    onComplete: () => border.destroy(),
  });
  scene.tweens.add({
    targets: ring,
    alpha: 0.1,
    scaleX: 1.7,
    scaleY: 1.7,
    duration: 580,
    yoyo: true,
    repeat: 1,
    onComplete: () => ring.destroy(),
  });

  // Prominent CHECK banner above board
  const bx = LAYOUT.GAME_WIDTH / 2;
  const by = LAYOUT.BOARD_OFFSET_Y - 28;
  const banner = scene.add.rectangle(bx, by, 192, 44, 0x1a0305, 0.93)
    .setDepth(11)
    .setStrokeStyle(2, COLORS.THREAT, 0.88);
  const label = scene.add.text(bx, by, 'CHECK!', {
    fontSize: '22px',
    color: '#ff4040',
    fontStyle: 'bold',
    letterSpacing: 4,
  }).setOrigin(0.5).setDepth(12);

  scene.tweens.add({
    targets: [banner, label],
    y: '-=22',
    alpha: 0,
    duration: 680,
    delay: 400,
    ease: 'Quad.easeIn',
    onComplete: () => { banner.destroy(); label.destroy(); },
  });
}

export function playCheckmateRevealEffect(scene, x, y, { winner } = {}) {
  const playerWon = winner === Owner.PLAYER;
  const accentColor = playerWon ? COLORS.EMERALD : COLORS.THREAT;
  const labelColor = playerWon ? '#7dffca' : '#ff8a8a';
  scene.cameras?.main?.flash?.(360, playerWon ? 125 : 255, playerWon ? 255 : 110, playerWon ? 202 : 110);
  scene.cameras?.main?.shake?.(260, 0.006);

  const boardCx = LAYOUT.BOARD_OFFSET_X + (LAYOUT.CELL_SIZE * 5) / 2;
  const boardCy = LAYOUT.BOARD_OFFSET_Y + (LAYOUT.CELL_SIZE * 5) / 2;
  const boardSize = LAYOUT.CELL_SIZE * 5;

  const veil = scene.add.rectangle(
    LAYOUT.GAME_WIDTH / 2, LAYOUT.GAME_HEIGHT / 2,
    LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT,
    0xf8d67a, 0.16,
  ).setDepth(12).setAlpha(0);
  const boardLight = scene.add.rectangle(boardCx, boardCy, boardSize + 26, boardSize + 26, accentColor, 0.18)
    .setDepth(13)
    .setAlpha(0)
    .setStrokeStyle?.(3, COLORS.GOLD, 0.82);
  const sweep = scene.add.rectangle(LAYOUT.BOARD_OFFSET_X - 42, boardCy, 28, boardSize + 86, 0xffffff, 0.42)
    .setDepth(16)
    .setAngle?.(-15);

  const labelBg = scene.add.rectangle(boardCx, LAYOUT.BOARD_OFFSET_Y - 42, 232, 38, 0x050912, 0.9)
    .setDepth(17)
    .setStrokeStyle(2, COLORS.GOLD, 0.72)
    .setAlpha(0);
  const label = scene.add.text(boardCx, LAYOUT.BOARD_OFFSET_Y - 42, 'FINAL VISION', {
    fontSize: '18px',
    color: labelColor,
    fontStyle: 'bold',
    letterSpacing: 3,
  }).setOrigin(0.5).setDepth(18).setAlpha(0);

  scene.tweens.add({
    targets: [veil, boardLight, labelBg, label],
    alpha: 1,
    duration: 180,
    ease: 'Sine.easeOut',
  });
  scene.tweens.add({
    targets: sweep,
    x: LAYOUT.BOARD_OFFSET_X + boardSize + 42,
    alpha: 0,
    duration: 520,
    ease: 'Cubic.easeOut',
    onComplete: () => sweep.destroy(),
  });
  scene.tweens.add({
    targets: boardLight,
    scaleX: 1.08,
    scaleY: 1.08,
    alpha: 0,
    duration: 900,
    delay: 480,
    ease: 'Sine.easeOut',
    onComplete: () => boardLight.destroy(),
  });
  scene.tweens.add({
    targets: [veil, labelBg, label],
    alpha: 0,
    duration: 420,
    delay: 900,
    ease: 'Sine.easeIn',
    onComplete: () => { veil.destroy(); labelBg.destroy(); label.destroy(); },
  });

  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10;
    const spark = scene.add.rectangle(
      x + Math.cos(angle) * 10,
      y + Math.sin(angle) * 10,
      5,
      18,
      playerWon ? 0x7dffca : 0xff9a70,
      0.82,
    ).setDepth(17).setRotation(angle);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * 72,
      y: y + Math.sin(angle) * 72,
      alpha: 0,
      duration: 520,
      ease: 'Quad.easeOut',
      onComplete: () => spark.destroy(),
    });
  }
}

export function playCheckmateAlert(scene, x, y, { winner } = {}) {
  scene.cameras?.main?.shake?.(500, 0.014);

  const playerWon = winner === Owner.PLAYER;
  const accentColor = playerWon ? COLORS.EMERALD : COLORS.THREAT;
  const sparkColor = playerWon ? 0x7dffca : 0xff6b6b;
  const headerColor = playerWon ? '#6fffe0' : '#ff6b6b';

  // Dark dramatic veil — fades in, holds, then fades out
  const veil = scene.add.rectangle(
    LAYOUT.GAME_WIDTH / 2, LAYOUT.GAME_HEIGHT / 2,
    LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT,
    0x000000, 0,
  ).setDepth(14);
  scene.tweens.add({
    targets: veil,
    alpha: 0.60,
    duration: 220,
    ease: 'Sine.easeIn',
    onComplete: () => {
      scene.tweens.add({
        targets: veil,
        alpha: 0,
        duration: 700,
        delay: 1400,
        ease: 'Sine.easeOut',
        onComplete: () => veil.destroy(),
      });
    },
  });

  // Staggered expanding rings from defeated king
  for (let i = 0; i < 3; i++) {
    scene.time.delayedCall(i * 130, () => {
      const r = scene.add.graphics().setDepth(15);
      r.lineStyle(4 - i, accentColor, 1 - i * 0.15);
      r.strokeCircle(x, y, 28 + i * 18);
      scene.tweens.add({
        targets: r,
        scaleX: 4,
        scaleY: 4,
        alpha: 0,
        duration: 750,
        ease: 'Quad.easeOut',
        onComplete: () => r.destroy(),
      });
    });
  }

  // Radial sparks from king
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const spark = scene.add.rectangle(
      x + Math.cos(angle) * 20,
      y + Math.sin(angle) * 20,
      4, 16, sparkColor,
    ).setDepth(17).setRotation(angle);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * 90,
      y: y + Math.sin(angle) * 90,
      alpha: 0,
      duration: 580,
      ease: 'Quad.easeOut',
      onComplete: () => spark.destroy(),
    });
  }

  // Burst rings + ray lines at king
  const burst = scene.add.graphics().setDepth(16);
  burst.lineStyle(7, accentColor, 1);
  burst.strokeCircle(x, y, 44);
  burst.lineStyle(3, COLORS.GOLD, 0.9);
  burst.strokeCircle(x, y, 62);
  burst.lineStyle(2, 0xffffff, 0.74);
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    burst.lineBetween(
      x + Math.cos(angle) * 34,
      y + Math.sin(angle) * 34,
      x + Math.cos(angle) * 88,
      y + Math.sin(angle) * 88,
    );
  }
  scene.tweens.add({
    targets: burst,
    alpha: 0,
    scaleX: 2.0,
    scaleY: 2.0,
    duration: 900,
    ease: 'Back.easeOut',
    onComplete: () => burst.destroy(),
  });

  // Center CHECKMATE plate
  const cx = LAYOUT.GAME_WIDTH / 2;
  const cy = LAYOUT.GAME_HEIGHT / 2;
  const plate = scene.add.rectangle(cx, cy + 10, 320, 88, 0x050912, 0.95)
    .setDepth(18)
    .setStrokeStyle(2, COLORS.GOLD, 0.9)
    .setAlpha(0);
  const title = scene.add.text(cx, cy - 6, 'CHECKMATE', {
    fontSize: '30px',
    color: headerColor,
    fontStyle: 'bold',
    letterSpacing: 5,
  }).setOrigin(0.5).setDepth(19).setAlpha(0);
  const sub = scene.add.text(cx, cy + 24, playerWon ? 'YOU WIN' : 'YOU LOSE', {
    fontSize: '15px',
    color: '#d4a843',
    fontStyle: 'bold',
    letterSpacing: 3,
  }).setOrigin(0.5).setDepth(19).setAlpha(0);

  scene.tweens.add({
    targets: [plate, title, sub],
    alpha: 1,
    duration: 260,
    delay: 200,
    ease: 'Sine.easeOut',
  });
  scene.tweens.add({
    targets: [plate, title, sub],
    alpha: 0,
    duration: 400,
    delay: 1700,
    ease: 'Sine.easeIn',
    onComplete: () => { plate.destroy(); title.destroy(); sub.destroy(); },
  });
}

export function showImpactLabel(scene, x, y, label, color) {
  const bg = scene.add.rectangle(x, y, 128, 30, 0x050710, 0.86)
    .setDepth(11)
    .setStrokeStyle(1, 0xffffff, 0.32);
  const text = scene.add.text(x, y, label, {
    fontSize: '16px',
    color,
    fontStyle: 'bold',
    letterSpacing: 1,
  }).setOrigin(0.5).setDepth(12);

  scene.tweens.add({
    targets: [bg, text],
    y: y - 24,
    alpha: 0,
    duration: 620,
    ease: 'Quad.easeOut',
    onComplete: () => {
      bg.destroy();
      text.destroy();
    },
  });
}
