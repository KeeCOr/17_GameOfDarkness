import { COLORS, LAYOUT, Owner } from '../config.js';

export const UI_RESOURCE_LIST = Object.freeze([
  {
    id: 'button-primary',
    type: 'button',
    purpose: 'Main menu, confirmation, and primary action buttons with a readable active state.',
    file: 'public/assets/ui/button-primary.svg',
  },
  {
    id: 'button-danger',
    type: 'button',
    purpose: 'Surrender and destructive action buttons with clear risk language.',
    file: 'public/assets/ui/button-danger.svg',
  },
  {
    id: 'frame-hud-panel',
    type: 'frame',
    purpose: 'Right HUD and modal panel frame with consistent gold edge and dark fill.',
    file: 'public/assets/ui/frame-hud-panel.svg',
  },
  {
    id: 'state-check-alert',
    type: 'state-feedback',
    purpose: 'Board-wide check warning using red vignette, king ring, and impact label.',
    file: 'public/assets/ui/state-check-alert.svg',
  },
  {
    id: 'fx-capture-impact',
    type: 'combat-effect',
    purpose: 'Strong capture impact: slash, shock ring, sparks, and short camera shake.',
    file: 'public/assets/ui/fx-capture-impact.svg',
  },
  {
    id: 'fx-promotion-burst',
    type: 'combat-effect',
    purpose: 'Promotion feedback: vertical beam, crown burst, and floating promotion label.',
    file: 'public/assets/ui/fx-promotion-burst.svg',
  },
  {
    id: 'brand-logo',
    type: 'brand',
    purpose: 'Full Chess Summon logo for title, store, and promotional use.',
    file: 'public/assets/brand/chesssummon-logo.svg',
  },
  {
    id: 'brand-mark',
    type: 'brand',
    purpose: 'Compact crown and summoning circle mark for icons and capsules.',
    file: 'public/assets/brand/chesssummon-mark.svg',
  },
  {
    id: 'mmr-tier-icons',
    type: 'rank',
    purpose: 'MMR tier shield icons from bronze through master.',
    file: 'public/assets/rank/mmr-*.svg',
  },
]);

export function playCaptureEffect(scene, x, y, { owner = Owner.AI } = {}) {
  const hostile = owner === Owner.AI;
  const slashColor = hostile ? 0xffe3a3 : 0xff4d5d;
  const ringColor = hostile ? COLORS.GOLD : COLORS.THREAT;
  scene.cameras?.main?.shake?.(140, 0.006);

  const ring = scene.add.graphics().setDepth(8);
  ring.lineStyle(4, ringColor, 0.95);
  ring.strokeCircle(x, y, 16);
  ring.lineStyle(2, 0xffffff, 0.75);
  ring.strokeCircle(x, y, 28);

  const slash = scene.add.graphics().setDepth(9);
  slash.lineStyle(8, slashColor, 1);
  slash.beginPath();
  slash.moveTo(x - 30, y - 26);
  slash.lineTo(x + 30, y + 26);
  slash.strokePath();
  slash.lineStyle(3, 0xffffff, 0.78);
  slash.beginPath();
  slash.moveTo(x - 22, y + 24);
  slash.lineTo(x + 28, y - 20);
  slash.strokePath();

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

  const beam = scene.add.graphics().setDepth(7);
  beam.fillStyle(beamColor, 0.24);
  beam.fillRect(x - 18, LAYOUT.BOARD_OFFSET_Y - 18, 36, LAYOUT.CELL_SIZE * 5 + 36);
  beam.lineStyle(2, 0xffffff, 0.7);
  beam.lineBetween(x, y - 52, x, y + 52);

  const burst = scene.add.graphics().setDepth(9);
  burst.lineStyle(3, COLORS.GOLD, 1);
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    burst.lineBetween(
      x + Math.cos(angle) * 18,
      y + Math.sin(angle) * 18,
      x + Math.cos(angle) * 44,
      y + Math.sin(angle) * 44,
    );
  }
  burst.fillStyle(COLORS.GOLD, 0.92);
  burst.fillTriangle(x, y - 32, x - 20, y - 4, x + 20, y - 4);
  burst.fillRect(x - 22, y - 4, 44, 9);

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
  scene.cameras?.main?.shake?.(220, 0.004);

  const overlay = scene.add.rectangle(
    LAYOUT.GAME_WIDTH / 2,
    LAYOUT.GAME_HEIGHT / 2,
    LAYOUT.GAME_WIDTH,
    LAYOUT.GAME_HEIGHT,
    COLORS.CRIMSON,
    0.18,
  ).setDepth(7);

  const ring = scene.add.graphics().setDepth(9);
  ring.lineStyle(5, COLORS.THREAT, 1);
  ring.strokeCircle(x, y, 35);
  ring.lineStyle(2, 0xffffff, 0.82);
  ring.strokeCircle(x, y, 47);

  scene.tweens.add({
    targets: overlay,
    alpha: 0,
    duration: 420,
    ease: 'Sine.easeOut',
    onComplete: () => overlay.destroy(),
  });
  scene.tweens.add({
    targets: ring,
    alpha: 0.1,
    scaleX: 1.45,
    scaleY: 1.45,
    duration: 520,
    yoyo: true,
    repeat: 1,
    onComplete: () => ring.destroy(),
  });
  showImpactLabel(scene, x, y - 62, 'CHECK', '#ff6b6b');
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
