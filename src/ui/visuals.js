import { COLORS, LAYOUT, MAX_MANA, PieceType, SummonRequirement, TEXT_COLORS } from '../config.js';

export const UI_ASSETS = Object.freeze({
  brandLogo: Object.freeze({ key: 'brand_logo', path: 'assets/brand/chesssummon-logo.svg' }),
  titleLogoOrnament: Object.freeze({ key: 'brand_title_logo_ornament', path: 'assets/brand/title-logo-ornament.png', type: 'image' }),
  stageBackground: Object.freeze({ key: 'ui_stage_background', path: 'assets/ui/stage-background.svg' }),
  titleBackground: Object.freeze({ key: 'ui_title_background', path: 'assets/ui/title-background.png', type: 'image' }),
  titleButtonFrame: Object.freeze({ key: 'ui_title_button_frame', path: 'assets/ui/title-button-frame.png', type: 'image' }),
  buttonPrimary: Object.freeze({ key: 'ui_button_primary', path: 'assets/ui/button-primary.svg' }),
  buttonDanger: Object.freeze({ key: 'ui_button_danger', path: 'assets/ui/button-danger.svg' }),
  frameHudPanel: Object.freeze({ key: 'ui_frame_hud_panel', path: 'assets/ui/frame-hud-panel.svg' }),
  frameTopHud: Object.freeze({ key: 'ui_frame_top_hud', path: 'assets/ui/frame-top-hud.svg' }),
  frameSummonCard: Object.freeze({ key: 'ui_frame_summon_card', path: 'assets/ui/frame-summon-card.svg' }),
  frameMana: Object.freeze({ key: 'ui_frame_mana', path: 'assets/ui/frame-mana.svg' }),
});

export const UI_COPY = Object.freeze({
  menu: {
    title: 'Chess of Dark',
    modeTitle: '플레이 모드 선택',
    single: '싱글 플레이',
    multiplayer: '멀티 플레이',
    back: '뒤로',
    subtitle: '난이도를 선택하세요',
    veryHardLocked: '어려움 승리 후 해금',
    difficulties: {
      VERY_HARD: '매우 어려움',
      EASY: '쉬움',
      MEDIUM: '보통',
      HARD: '어려움',
    },
    difficultyHints: {
      VERY_HARD: '깊은 수읽기 + 체크메이트 압박',
      EASY: '자동 배치 + 튜토리얼 선택',
      MEDIUM: '자동 배치로 바로 시작',
      HARD: '직접 배치 후 전투',
    },
  },
  placement: {
    title: '전초 배치',
    subtitle: '하단 2개 행에 병사 4명을 배치하세요',
    ready: '전투 시작',
    count: '배치 병사',
  },
  tutorialPrompt: {
    title: '튜토리얼을 볼까요?',
    body: '게임 방법을 단계별로 알려드립니다',
    yes: '네',
    no: '아니요',
  },
  game: {
    playerTurn: '내 턴',
    aiTurn: 'AI 턴',
    mana: '마나',
    manaIconLabel: '마나',
    action: '이번 턴 행동',
    moveSlot: '이동 1회',
    summonSlot: '소환 1회',
    turnRule: '이동 1회 + 소환 1회',
    turnRuleSub: '둘 다 사용하면 턴 종료',
    moveReady: '가능',
    moveDone: '완료',
    summonReady: '가능',
    summonDone: '완료',
    summon: '소환 카드',
    endTurn: '턴 종료',
    surrender: '기권',
    help: '?',
    check: '체크!',
    confirmSurrender: '정말 기권하시겠습니까?',
    idleWarningTitle: '입력이 없습니다',
    idleWarningBody: '30초 동안 입력이 없습니다. 10초 안에 선택하지 않으면 패배합니다.',
    keepThinking: '조금 더 생각한다',
    loseNow: '패배',
    cancel: '취소',
    cost: '',
    notEnoughMana: '마나 부족',
    selected: '선택',
  },
  hints: {
    default: '말을 선택해 이동하거나, 소환 카드를 선택하세요',
    selected: '밝은 칸으로 이동하면 새 시야가 열립니다',
    summon: '초록 칸을 클릭하면 선택한 말을 소환합니다',
    moveRemaining: '소환 완료. 아직 이동 1회를 사용할 수 있습니다',
    summonRemaining: '이동 완료. 아직 소환 1회를 사용할 수 있습니다',
    done: '이번 턴 행동 완료. 턴 종료를 누르세요',
    ai: 'AI가 수를 계산하고 있습니다',
  },
  help: {
    title: '전투 도움말',
    lines: [
      '한 턴에는 이동 1회와 소환 1회를 각각 사용할 수 있습니다.',
      '소환은 아군 말 주변 8칸 중 빈 칸에만 가능합니다.',
      '말을 선택하면 이동 가능한 칸이 밝게 표시됩니다.',
      '시야는 내 말 주변 1칸, 이동 가능한 경로, 체크 위협 말이 밝혀집니다.',
      '두 행동을 모두 사용했다면 턴 종료를 누르세요.',
    ],
    close: '확인',
  },
  tutorial: {
    steps: [
      '병사를 클릭해보세요',
      '이동할 칸을 선택하세요\n이동하면 새 시야가 열립니다',
      '마나 +2!\n소환 카드는 턴마다 1번 사용할 수 있습니다',
      '아군 주변 초록 칸을 클릭해\n소환하세요',
      '한 턴에는 이동 1회와 소환 1회가 가능합니다',
      '턴 종료 버튼을 눌러\nAI에게 턴을 넘겨보세요',
      '튜토리얼 완료!\n자유롭게 플레이하세요',
    ],
    checkHint: '체크! 이동으로 왕의 위협을 피하세요.',
    complete: '튜토리얼 완료!',
    confirm: '확인',
  },
  result: {
    win: '승리!',
    lose: '패배...',
    timeoutLose: '시간이 부족해서 졌습니다',
    timeoutWin: '상대 시간이 부족해 승리했습니다',
    checkmateLose: '체크메이트로 패배했습니다',
    checkmateWin: '체크메이트로 승리했습니다',
    replay: '다시하기',
    menu: '메인 메뉴',
  },
  multiplayer: {
    title: '온라인 멀티 플레이',
    nicknamePrompt: '랭크에 사용할 닉네임을 입력하세요',
    connecting: '서버에 연결 중...',
    offline: '서버 연결 실패: npm run online:server 를 먼저 실행하세요',
    account: '계정',
    rank: '랭크 포인트',
    queue: '빠른 매칭',
    queued: '상대를 찾는 중...',
    matched: '매칭 완료',
    aiMatched: 'AI 상대 매칭',
    server: 'ws://localhost:8787',
  },
});

export function getPieceName(type) {
  return {
    [PieceType.PAWN]: '병사',
    [PieceType.KNIGHT]: '기사',
    [PieceType.BISHOP]: '주교',
    [PieceType.ROOK]: '성채',
    [PieceType.QUEEN]: '여왕',
    [PieceType.KING]: '왕',
  }[type] || type;
}

export function getSummonRequirementLabel(requirement) {
  return requirement === SummonRequirement.TRIBUTE ? '제물' : '즉시';
}

export function getSummonGradeStars(grade = 1) {
  const count = Math.max(1, Math.min(5, Number(grade) || 1));
  return '★'.repeat(count);
}

export function getTurnHint({ hasMoved = false, hasSummoned = false, mode = 'default' } = {}) {
  if (mode === 'ai') return UI_COPY.hints.ai;
  if (mode === 'selected') return UI_COPY.hints.selected;
  if (mode === 'summon') return UI_COPY.hints.summon;
  if (hasMoved && hasSummoned) return UI_COPY.hints.done;
  if (hasMoved) return UI_COPY.hints.summonRemaining;
  if (hasSummoned) return UI_COPY.hints.moveRemaining;
  return UI_COPY.hints.default;
}

export function formatManaGaugeLabel(value, maxMana = MAX_MANA) {
  const max = Math.max(1, Number(maxMana) || MAX_MANA);
  const mana = Math.max(0, Math.min(max, Number(value) || 0));
  return `보유 마나 ${mana} / ${max}`;
}

export function getButtonColors({ enabled = true, active = false, danger = false } = {}) {
  if (!enabled) {
    return { fill: COLORS.BUTTON_DISABLED, stroke: 0x2f3548, text: 0x9aa6bf, alpha: 0.46, bgTint: 0x72798a };
  }
  if (active) {
    return { fill: 0x5c3b16, stroke: 0xffdf7a, text: 0xffffff, alpha: 1, bgTint: 0xffdf7a };
  }
  if (danger) {
    return { fill: COLORS.CRIMSON, stroke: 0xff8a7a, text: 0xffffff, alpha: 1, bgTint: null };
  }
  return { fill: COLORS.BUTTON_BG, stroke: 0xd4a64a, text: 0xffffff, alpha: 1, bgTint: null };
}

export function getButtonAssetKey({ danger = false } = {}) {
  return danger ? UI_ASSETS.buttonDanger.key : UI_ASSETS.buttonPrimary.key;
}

export function getPanelAssetKey() {
  return UI_ASSETS.frameHudPanel.key;
}

function hasTexture(scene, key) {
  return Boolean(scene?.textures?.exists?.(key));
}

export function addStageBackground(scene, title = '') {
  const { GAME_WIDTH: w, GAME_HEIGHT: h } = LAYOUT;
  const useTitleArt = title === UI_COPY.menu.title && hasTexture(scene, UI_ASSETS.titleBackground.key);
  const stageKey = useTitleArt ? UI_ASSETS.titleBackground.key : UI_ASSETS.stageBackground.key;
  if (hasTexture(scene, stageKey)) {
    scene.add.image(w / 2, h / 2, stageKey)
      .setDisplaySize(w, h)
      .setDepth(-10);
  } else {
    scene.add.rectangle(w / 2, h / 2, w, h, COLORS.BACKDROP);
    scene.add.rectangle(w / 2, h / 2, w - 54, h - 42, COLORS.PANEL_DEEP).setAlpha(0.94);
    scene.add.rectangle(w / 2, h / 2, w - 86, h - 82, COLORS.PANEL_BG).setAlpha(0.32);
  }

  const g = scene.add.graphics();
  g.lineStyle(2, COLORS.PANEL_EDGE, 0.58);
  g.strokeRect(36, 30, w - 72, h - 60);
  g.lineStyle(1, COLORS.GOLD, 0.22);
  for (let i = 0; i < 5; i++) {
    const inset = 60 + i * 25;
    g.strokeRect(inset, 52 + i * 18, w - inset * 2, h - 104 - i * 36);
  }
  g.lineStyle(2, COLORS.GOLD, 0.24);
  g.beginPath();
  g.moveTo(72, 86);
  g.lineTo(w / 2, 48);
  g.lineTo(w - 72, 86);
  g.moveTo(72, h - 86);
  g.lineTo(w / 2, h - 48);
  g.lineTo(w - 72, h - 86);
  g.closePath();
  g.strokePath();

  if (title) {
    if (title === UI_COPY.menu.title && hasTexture(scene, UI_ASSETS.brandLogo.key)) {
      if (hasTexture(scene, UI_ASSETS.titleLogoOrnament.key)) {
        scene.add.image(w / 2, 94, UI_ASSETS.titleLogoOrnament.key)
          .setDisplaySize(360, 170)
          .setAlpha(0.94)
          .setDepth(0.8);
      }
      return scene.add.image(w / 2, 118, UI_ASSETS.brandLogo.key)
        .setDisplaySize(360, 142)
        .setDepth(1);
    }
    const titleText = scene.add.text(w / 2, 88, title, {
      fontSize: '43px',
      color: '#fff0b8',
      fontStyle: 'bold',
      fontFamily: 'Georgia, "Times New Roman", serif',
    }).setOrigin(0.5);
    titleText.setStroke?.('#050812', 5);
    titleText.setShadow?.(0, 2, '#000000', 4, true, true);
  }
}

export function addFramedImage(scene, x, y, width, height, key, options = {}) {
  if (!hasTexture(scene, key)) return null;
  return scene.add.image(x, y, key)
    .setDisplaySize(width, height)
    .setAlpha(options.alpha ?? 1)
    .setDepth(options.depth ?? 0);
}

export function addPanel(scene, x, y, width, height, options = {}) {
  const depth = options.depth ?? 0;
  const alpha = options.alpha ?? 0.96;
  const assetKey = getPanelAssetKey();
  if (hasTexture(scene, assetKey)) {
    return scene.add.image(x + width / 2, y + height / 2, assetKey)
      .setDisplaySize(width, height)
      .setAlpha(alpha)
      .setDepth(depth);
  }
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(options.fill ?? COLORS.PANEL_DEEP, alpha);
  g.fillRoundedRect(x, y, width, height, options.radius ?? 8);
  g.lineStyle(options.lineWidth ?? 2, options.stroke ?? COLORS.PANEL_EDGE, options.strokeAlpha ?? 0.65);
  g.strokeRoundedRect(x, y, width, height, options.radius ?? 8);
  return g;
}

export function addSectionLabel(scene, x, y, text, depth = 0) {
  return scene.add.text(x, y, text, {
    fontSize: '12px',
    color: TEXT_COLORS.GOLD,
    fontStyle: 'bold',
  }).setDepth(depth);
}

export function addDivider(scene, x, y, width, depth = 0) {
  const g = scene.add.graphics().setDepth(depth);
  g.lineStyle(1, COLORS.PANEL_EDGE, 0.35);
  g.lineBetween(x, y, x + width, y);
  return g;
}

export function addReleaseBadge(scene, label, depth = 0) {
  return scene.add.text(LAYOUT.GAME_WIDTH / 2, LAYOUT.GAME_HEIGHT - 28, label, {
    fontSize: '11px',
    color: TEXT_COLORS.MUTED,
    fontStyle: 'bold',
  }).setOrigin(0.5).setDepth(depth);
}

export function addTextButton(scene, x, y, width, height, label, options = {}) {
  const state = getButtonColors(options);
  const depth = options.depth ?? 0;
  const assetKey = options.assetKey || getButtonAssetKey(options);
  const bg = hasTexture(scene, assetKey)
    ? scene.add.image(x, y, assetKey)
      .setDisplaySize(width, height)
      .setAlpha(state.alpha)
      .setDepth(depth)
    : null;
  const rect = scene.add.rectangle(x, y, width, height, state.fill)
    .setInteractive({ useHandCursor: true })
    .setAlpha(bg ? 0.001 : state.alpha)
    .setDepth(bg ? depth + 0.2 : depth);
  rect.setStrokeStyle(1, state.stroke, 0.85);

  const text = scene.add.text(x, y, label, {
    fontSize: options.fontSize || '18px',
    color: `#${state.text.toString(16).padStart(6, '0')}`,
    fontStyle: 'bold',
    align: 'center',
  }).setOrigin(0.5).setDepth(depth + 1);
  applyReadableTextStyle(text, state);

  const applyArtState = ({ hover = false, nextState = state } = {}) => {
    if (!bg) return false;
    const enabled = rect.getData('enabled') !== false;
    bg.setAlpha(enabled ? nextState.alpha : 0.42);
    if (!enabled) {
      bg.setTint?.(nextState.bgTint ?? 0x72798a);
    } else if (hover) {
      bg.setTint?.(options.danger ? 0xffb0a5 : 0xffedb2);
    } else if (nextState.bgTint) {
      bg.setTint?.(nextState.bgTint);
    } else {
      bg.clearTint?.();
    }
    return true;
  };

  rect.on('pointerover', () => {
    if (rect.getData('enabled') === false) return;
    if (applyArtState({ hover: true })) return;
    rect.setFillStyle(options.active ? COLORS.GOLD : (options.danger ? 0xb4453d : COLORS.BUTTON_HOVER));
  });
  rect.on('pointerout', () => {
    if (rect.getData('enabled') === false) return;
    if (applyArtState({ hover: false })) return;
    rect.setFillStyle(options.active ? COLORS.GOLD : (options.danger ? COLORS.CRIMSON : COLORS.BUTTON_BG));
  });
  rect.on('pointerdown', () => {
    if (rect.getData('enabled') === false) return;
    scene.tweens.add({ targets: bg ? [bg, text] : [rect, text], scaleX: 0.97, scaleY: 0.97, duration: 60, yoyo: true });
  });

  rect.setData('enabled', options.enabled !== false);
  applyArtState();
  return { rect, text, bg };
}

export function setButtonState(button, options = {}) {
  const state = getButtonColors(options);
  button.rect.setData('enabled', options.enabled !== false);
  button.rect.setFillStyle(state.fill);
  button.rect.setStrokeStyle(1, state.stroke, 0.85);
  button.rect.setAlpha(button.bg ? 0.001 : state.alpha);
  if (button.bg) {
    button.bg.setAlpha(state.alpha);
    if (options.enabled === false) {
      button.bg.setTint?.(state.bgTint ?? 0x72798a);
    } else if (state.bgTint) {
      button.bg.setTint?.(state.bgTint);
    } else {
      button.bg.clearTint?.();
    }
  }
  button.text.setColor(`#${state.text.toString(16).padStart(6, '0')}`);
  button.text.setAlpha(state.alpha < 1 ? 0.65 : 1);
  applyReadableTextStyle(button.text, state);
}

function applyReadableTextStyle(text, state) {
  const textIsDark = state.text === 0x1a1208;
  text.setStroke?.(textIsDark ? '#fff0b8' : '#050812', textIsDark ? 1 : 4);
  text.setShadow?.(0, 1, textIsDark ? '#fff6ce' : '#000000', textIsDark ? 1 : 3, true, true);
}
