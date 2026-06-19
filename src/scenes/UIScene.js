// src/scenes/UIScene.js
import {
  COLORS, LAYOUT, MAX_MANA, Owner, PieceType, SUMMON_COSTS, SUMMON_REPEAT_COST_INCREASE, TEXT_COLORS,
  TURN_TIME_LIMIT,
} from '../config.js';
import {
  addFramedImage, addPanel, addSectionLabel, addTextButton, getPieceName,
  formatManaGaugeLabel, setButtonState, UI_ASSETS, UI_COPY,
} from '../ui/visuals.js';
import { ACTION_FEEDBACK_COLORS, getActionFeedback } from '../ui/actionFeedback.js';

const SUMMONABLE = [PieceType.PAWN, PieceType.KNIGHT, PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN];
const PANEL_X = LAYOUT.PANEL_X;
const CONTENT_W = LAYOUT.PANEL_WIDTH;

export class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UI', active: false }); }

  create() {
    this.gameScene = this.scene.get('Game');
    this.events.once('shutdown', this.shutdown, this);

    addFramedImage(
      this,
      LAYOUT.HUD_TOP_X + LAYOUT.HUD_TOP_WIDTH / 2,
      LAYOUT.HUD_TOP_Y + LAYOUT.HUD_TOP_HEIGHT / 2,
      LAYOUT.HUD_TOP_WIDTH + 10,
      LAYOUT.HUD_TOP_HEIGHT + 4,
      UI_ASSETS.gameTopHudFrame.key,
      { depth: -0.2, alpha: 0.98 },
    ) || addPanel(this, LAYOUT.HUD_TOP_X, LAYOUT.HUD_TOP_Y, LAYOUT.HUD_TOP_WIDTH, LAYOUT.HUD_TOP_HEIGHT, { strokeAlpha: 0.68, alpha: 0.98 });
    addFramedImage(
      this,
      LAYOUT.HUD_PANEL_X + LAYOUT.HUD_PANEL_WIDTH / 2,
      LAYOUT.HUD_PANEL_Y + LAYOUT.HUD_PANEL_HEIGHT / 2,
      LAYOUT.HUD_PANEL_WIDTH + 10,
      LAYOUT.HUD_PANEL_HEIGHT + 6,
      UI_ASSETS.gameBottomHudFrame.key,
      { depth: -0.2, alpha: 0.98 },
    ) || addPanel(this, LAYOUT.HUD_PANEL_X, LAYOUT.HUD_PANEL_Y, LAYOUT.HUD_PANEL_WIDTH, LAYOUT.HUD_PANEL_HEIGHT, { strokeAlpha: 0.68, alpha: 0.98 });

    this.playerClockBg = addFramedImage(this, PANEL_X + 112, LAYOUT.HUD_TOP_Y + 24, 92, 29, UI_ASSETS.gameClockChipPlayer.key, { depth: 0.2, alpha: 0.9 })
      || this.add.rectangle(PANEL_X + 112, LAYOUT.HUD_TOP_Y + 24, 88, 26, COLORS.PANEL_DEEP).setAlpha(0.82);
    this.aiClockBg = addFramedImage(this, PANEL_X + 210, LAYOUT.HUD_TOP_Y + 24, 92, 29, UI_ASSETS.gameClockChipEnemy.key, { depth: 0.2, alpha: 0.86 })
      || this.add.rectangle(PANEL_X + 210, LAYOUT.HUD_TOP_Y + 24, 88, 26, COLORS.PANEL_DEEP).setAlpha(0.82);
    this.playerClockText = this.add.text(PANEL_X + 112, LAYOUT.HUD_TOP_Y + 24, `나 ${formatClock(TURN_TIME_LIMIT)}`, {
      fontSize: '14px', color: TEXT_COLORS.TIMER, fontStyle: 'bold',
      fixedWidth: 82,
      align: 'center',
    }).setOrigin(0.5);
    this.aiClockText = this.add.text(PANEL_X + 210, LAYOUT.HUD_TOP_Y + 24, `상대 ${formatClock(TURN_TIME_LIMIT)}`, {
      fontSize: '14px', color: TEXT_COLORS.MUTED, fontStyle: 'bold',
      fixedWidth: 82,
      align: 'center',
    }).setOrigin(0.5);
    this.playerClockText.setStroke?.('#050812', 3);
    this.aiClockText.setStroke?.('#050812', 3);

    const help = addTextButton(this, PANEL_X + CONTENT_W - 18, LAYOUT.HUD_TOP_Y + 22, 30, 30, UI_COPY.game.help, { fontSize: '16px', active: true });
    help.rect.on('pointerdown', () => this._showHelp());

    this.hintText = this.add.text(PANEL_X, LAYOUT.HUD_TOP_Y + 52, compactHint(UI_COPY.hints.default), {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      fixedWidth: CONTENT_W,
      maxLines: 1,
    }).setOrigin(0, 0).setDepth(2);

    addSectionLabel(this, PANEL_X, LAYOUT.HUD_SUMMON_LABEL_Y, UI_COPY.game.summon);

    this.summonButtons = {};
    const summonContentX = LAYOUT.HUD_PANEL_X + 5;
    const summonContentW = LAYOUT.HUD_PANEL_WIDTH - 10;
    SUMMONABLE.forEach((type, i) => {
      const cardW = LAYOUT.HUD_SUMMON_CARD_WIDTH;
      const gap = (summonContentW - cardW * SUMMONABLE.length) / (SUMMONABLE.length - 1);
      const x = summonContentX + cardW / 2 + i * (cardW + gap);
      const y = LAYOUT.HUD_SUMMON_START_Y;
      const button = addTextButton(this, x, y, cardW, LAYOUT.HUD_SUMMON_CARD_HEIGHT, '', {
        enabled: false,
        fontSize: '15px',
        assetKey: UI_ASSETS.gameSummonTileFrame.key,
      });
      const cardFrame = button.bg;
      const icon = this.add.image(x, y - 31, `${type.toLowerCase()}_w`).setDisplaySize(53, 53).setAlpha(0.3).setDepth(2);
      const name = this.add.text(x, y + 24, getPieceName(type), {
        fontSize: '13px',
        color: TEXT_COLORS.PRIMARY,
        fontStyle: 'bold',
        align: 'center',
        fixedWidth: cardW - 12,
      }).setOrigin(0.5).setAlpha(0.5).setDepth(2);
      name.setStroke?.('#050812', 3);
      const manaIcon = this._addManaIcon(x - 11, y + 51, 0.78, 2);
      manaIcon.setAlpha(0.45);
      const cost = this.add.text(x + 3, y + 51, String(SUMMON_COSTS[type]), {
        fontSize: '15px', color: TEXT_COLORS.DIM, fontStyle: 'bold',
      }).setOrigin(0, 0.5).setAlpha(0.5).setDepth(2);

      button.rect.on('pointerdown', () => {
        if (!button.rect.getData('enabled')) return;
        this.gameScene.startSummonMode(type);
        this._highlightActiveSummon(button.rect.getData('active') ? null : type);
      });
      this.summonButtons[type] = { ...button, cardFrame, icon, manaIcon, name, cost };
    });

    addFramedImage(this, PANEL_X + CONTENT_W / 2, LAYOUT.HUD_MANA_Y, CONTENT_W, 38, UI_ASSETS.gameManaFrame.key, { depth: 0.3, alpha: 0.96 });
    this.manaCrystals = [];
    const crystalStartX = PANEL_X + 26;
    const crystalGap = 18;
    for (let i = 0; i < MAX_MANA; i++) {
      const crystal = this._addManaIcon(crystalStartX + i * crystalGap, LAYOUT.HUD_MANA_Y, 0.34, 1.8);
      crystal.setAlpha(0.22);
      this.manaCrystals.push(crystal);
    }
    this.manaText = this.add.text(PANEL_X + CONTENT_W / 2, LAYOUT.HUD_MANA_Y, formatManaGaugeLabel(0), {
      fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);
    this.manaText.setStroke?.('#050812', 4);
    this.manaText.setShadow?.(0, 1, '#000000', 3, true, true);

    this.checkText = this.add.text(PANEL_X + CONTENT_W - 60, LAYOUT.HUD_TOP_Y + 68, UI_COPY.game.check, {
      fontSize: '14px', color: TEXT_COLORS.DANGER, fontStyle: 'bold',
      wordWrap: { width: 58 },
      align: 'center',
    }).setOrigin(0.5).setVisible(false);

    this.endButton = addTextButton(this, PANEL_X + 122, LAYOUT.HUD_FOOTER_Y, 238, 60, UI_COPY.game.endTurn, {
      danger: true,
      fontSize: '18px',
      assetKey: UI_ASSETS.gameActionButtonFrame.key,
      textOffsetY: 1,
    });
    this.endButton.rect.on('pointerdown', () => this.gameScene.endTurnManually());

    this.surrenderButton = addTextButton(this, PANEL_X + 303, LAYOUT.HUD_FOOTER_Y, 112, 60, UI_COPY.game.surrender, {
      fontSize: '14px',
      assetKey: UI_ASSETS.gameActionButtonFrame.key,
      textOffsetY: 1,
    });
    this.surrenderButton.rect.setFillStyle(0x171a22);
    this.surrenderButton.text.setColor(TEXT_COLORS.MUTED);
    this.surrenderButton.rect.on('pointerdown', () => this._showSurrenderConfirm());

    this.gameScene.events.on('turn-start', this._onTurnStart, this);
    this.gameScene.events.on('timer-tick', this._onTimerTick, this);
    this.gameScene.events.on('check', this._onCheck, this);
    this.gameScene.events.on('player-action', this._onPlayerAction, this);
    this.gameScene.events.on('summon-cancel', this._onSummonCancel, this);
    this.gameScene.events.on('summon-mode', this._onSummonMode, this);
    this.gameScene.events.on('idle-warning', this._showIdleWarning, this);
    this.gameScene.events.on('hint-change', this._onHintChange, this);
  }

  _addManaIcon(x, y, scale = 1, depth = 2) {
    if (this.textures.exists(UI_ASSETS.gameManaCrystal.key)) {
      return this.add.image(x, y, UI_ASSETS.gameManaCrystal.key)
        .setDisplaySize(24 * scale, 24 * scale)
        .setDepth(depth);
    }
    return this.add.diamond(x, y, 14 * scale, 18 * scale, 0x37d9ff, 1).setDepth(depth);
  }

  _showHelp() {
    const cx = LAYOUT.GAME_WIDTH / 2, cy = LAYOUT.GAME_HEIGHT / 2;
    const overlay = this.add.rectangle(cx, cy, LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT, 0x000000, 0.66).setDepth(60).setInteractive();
    const panel = addPanel(this, cx - 200, cy - 195, 400, 390, { depth: 61, stroke: COLORS.GOLD });
    const title = this.add.text(cx, cy - 160, UI_COPY.help.title, {
      fontSize: '24px', color: TEXT_COLORS.GOLD, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(62);

    const lines = UI_COPY.help.lines.map(line => `- ${line}`).join('\n');
    const body = this.add.text(cx - 172, cy - 118, lines, {
      fontSize: '15px', color: '#ffffff', lineSpacing: 9,
      wordWrap: { width: 344 },
    }).setDepth(62);

    const ok = addTextButton(this, cx, cy + 160, 120, 38, UI_COPY.help.close, { active: true, depth: 62 });
    const objs = [overlay, panel, title, body, ok.bg, ok.rect, ok.text].filter(Boolean);
    const close = () => objs.forEach(o => o.destroy());
    ok.rect.on('pointerdown', close);
    overlay.on('pointerdown', close);
  }

  _showSurrenderConfirm() {
    const cx = LAYOUT.GAME_WIDTH / 2, cy = LAYOUT.GAME_HEIGHT / 2;
    const overlay = this.add.rectangle(cx, cy, LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT, 0x000000, 0.62).setDepth(50).setInteractive();
    const panel = addPanel(this, cx - 160, cy - 78, 320, 156, { depth: 51, stroke: COLORS.CRIMSON });
    const msg = this.add.text(cx, cy - 34, UI_COPY.game.confirmSurrender, {
      fontSize: '18px', color: TEXT_COLORS.PRIMARY, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(52);

    const yes = addTextButton(this, cx - 70, cy + 34, 112, 38, UI_COPY.game.surrender, { danger: true, depth: 52 });
    const no = addTextButton(this, cx + 70, cy + 34, 112, 38, UI_COPY.game.cancel, { depth: 52 });

    const objs = [overlay, panel, msg, yes.bg, yes.rect, yes.text, no.bg, no.rect, no.text].filter(Boolean);
    const close = () => objs.forEach(o => o.destroy());
    yes.rect.on('pointerdown', () => { close(); this.gameScene.surrender(); });
    no.rect.on('pointerdown', close);
    overlay.on('pointerdown', close);
  }

  _showIdleWarning() {
    const cx = LAYOUT.GAME_WIDTH / 2, cy = LAYOUT.GAME_HEIGHT / 2;
    const overlay = this.add.rectangle(cx, cy, LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT, 0x000000, 0.68).setDepth(70).setInteractive();
    const panel = addPanel(this, cx - 176, cy - 94, 352, 188, { depth: 71, stroke: COLORS.CRIMSON });
    const title = this.add.text(cx, cy - 54, UI_COPY.game.idleWarningTitle, {
      fontSize: '21px', color: TEXT_COLORS.TIMER_LOW, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(72);
    const body = this.add.text(cx, cy - 18, UI_COPY.game.idleWarningBody, {
      fontSize: '14px', color: TEXT_COLORS.PRIMARY, align: 'center',
      wordWrap: { width: 292 },
    }).setOrigin(0.5).setDepth(72);
    const think = addTextButton(this, cx - 82, cy + 48, 144, 38, UI_COPY.game.keepThinking, { active: true, fontSize: '13px', depth: 72 });
    const lose = addTextButton(this, cx + 94, cy + 48, 116, 38, UI_COPY.game.loseNow, { danger: true, fontSize: '13px', depth: 72 });

    const objs = [overlay, panel, title, body, think.bg, think.rect, think.text, lose.bg, lose.rect, lose.text].filter(Boolean);
    const close = () => objs.forEach(o => o.destroy());
    const resolve = keepThinking => {
      close();
      this.gameScene.resolveIdleWarning(keepThinking);
    };
    think.rect.on('pointerdown', () => resolve(true));
    lose.rect.on('pointerdown', () => resolve(false));
    overlay.on('pointerdown', () => resolve(false));
  }

  _onTurnStart({ turn, mana, timeLeft, clockTimes, summonCounts }) {
    const playerTurn = turn === Owner.PLAYER;
    this._setClockTexts(clockTimes, turn, timeLeft);
    this._setMana(mana[Owner.PLAYER]);
    this.checkText.setVisible(false);
    this._refreshSummonButtons(playerTurn ? mana[Owner.PLAYER] : -1, false, summonCounts || {});
  }

  _onCheck(inCheck) {
    this.checkText.setVisible(inCheck);
    if (inCheck) {
      this.tweens.add({
        targets: this.checkText,
        scaleX: 1.18, scaleY: 1.18,
        duration: 120, yoyo: true, repeat: 2,
      });
    }
  }

  _onPlayerAction(payload) {
    const { hasSummoned, mana, summonCounts } = payload;
    this._refreshSummonButtons(mana, hasSummoned, summonCounts || {});
    this._setMana(mana);
    this._highlightActiveSummon(null);
    this._showActionFeedback(payload);
  }

  _showActionFeedback(payload) {
    const feedback = getActionFeedback(payload);
    this.hintText.setText(compactHint(feedback.text));
    this.hintText.setColor(ACTION_FEEDBACK_COLORS[feedback.tone] || '#ffffff');
    this.tweens.add({
      targets: this.hintText,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 90,
      yoyo: true,
    });
  }

  _onSummonCancel() {
    this._highlightActiveSummon(null);
  }

  _onSummonMode({ pieceType }) {
    this._highlightActiveSummon(pieceType);
  }

  _onTimerTick(payload) {
    const timeLeft = typeof payload === 'number' ? payload : payload.timeLeft;
    const clockTimes = typeof payload === 'number' ? undefined : payload.clockTimes;
    const turn = typeof payload === 'number' ? Owner.PLAYER : payload.turn;
    this._setClockTexts(clockTimes, turn, timeLeft);
  }

  _onHintChange({ hint, color }) {
    this.hintText.setText(compactHint(hint));
    this.hintText.setColor(color || '#ffffff');
  }

  _setClockTexts(clockTimes = {}, activeTurn = Owner.PLAYER, fallbackTime = TURN_TIME_LIMIT) {
    const playerTime = clockTimes[Owner.PLAYER] ?? (activeTurn === Owner.PLAYER ? fallbackTime : TURN_TIME_LIMIT);
    const aiTime = clockTimes[Owner.AI] ?? (activeTurn === Owner.AI ? fallbackTime : TURN_TIME_LIMIT);
    const playerActive = activeTurn === Owner.PLAYER;
    const aiActive = activeTurn === Owner.AI;

    this.playerClockText.setText(`나 ${formatClock(playerTime)}`);
    this.aiClockText.setText(`상대 ${formatClock(aiTime)}`);
    this.playerClockText.setColor(playerTime <= 10 ? TEXT_COLORS.TIMER_LOW : (playerActive ? TEXT_COLORS.TIMER : TEXT_COLORS.MUTED));
    this.aiClockText.setColor(aiTime <= 10 ? TEXT_COLORS.TIMER_LOW : (aiActive ? TEXT_COLORS.TIMER : TEXT_COLORS.MUTED));
    this.playerClockBg.setAlpha(playerActive ? 1 : 0.68);
    this.aiClockBg.setAlpha(aiActive ? 1 : 0.68);
  }

  _setMana(value) {
    const mana = Math.max(0, Math.min(MAX_MANA, Number(value) || 0));
    this.manaCrystals?.forEach((crystal, index) => {
      const filled = index < mana;
      crystal.setAlpha(filled ? 1 : 0.18);
      if (filled) crystal.clearTint?.();
      else crystal.setTint?.(0x263142);
    });
    this.manaText.setText(formatManaGaugeLabel(mana));
    this.manaText.setColor('#ffffff');
  }

  _refreshSummonButtons(playerMana, hasSummoned, summonCounts) {
    for (const [type, entry] of Object.entries(this.summonButtons)) {
      const count = summonCounts?.[type] || 0;
      const cost = (SUMMON_COSTS[type] || 1) + count * SUMMON_REPEAT_COST_INCREASE;
      const enabled = !hasSummoned && playerMana >= cost;
      setButtonState(entry, { enabled, active: false });
      entry.rect.setData('active', false);
      entry.cost.setText(String(cost));
      entry.cost.setColor(enabled ? '#dceeff' : TEXT_COLORS.DIM);
      entry.cost.setAlpha(enabled ? 1 : 0.6);
      entry.manaIcon.setAlpha(enabled ? 1 : 0.42);
      entry.icon.setAlpha(enabled ? 0.96 : 0.34);
      entry.name.setAlpha(enabled ? 1 : 0.58);
      entry.name.setColor(enabled ? TEXT_COLORS.PRIMARY : TEXT_COLORS.DIM);
    }
  }

  _highlightActiveSummon(activeType) {
    for (const [type, entry] of Object.entries(this.summonButtons)) {
      const isActive = type === activeType;
      entry.rect.setData('active', isActive);
      if (entry.rect.getData('enabled')) {
        setButtonState(entry, { enabled: true, active: isActive });
        entry.cost.setColor(isActive ? TEXT_COLORS.GOLD : '#dceeff');
        entry.manaIcon.setAlpha(1);
        entry.name.setColor(isActive ? TEXT_COLORS.GOLD : TEXT_COLORS.PRIMARY);
        entry.icon.setAlpha(1);
      }
    }
  }

  shutdown() {
    if (this.gameScene) {
      this.gameScene.events.off('turn-start', this._onTurnStart, this);
      this.gameScene.events.off('timer-tick', this._onTimerTick, this);
      this.gameScene.events.off('check', this._onCheck, this);
      this.gameScene.events.off('player-action', this._onPlayerAction, this);
      this.gameScene.events.off('summon-cancel', this._onSummonCancel, this);
      this.gameScene.events.off('summon-mode', this._onSummonMode, this);
      this.gameScene.events.off('idle-warning', this._showIdleWarning, this);
      this.gameScene.events.off('hint-change', this._onHintChange, this);
    }
  }
}

function formatClock(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function compactHint(hint) {
  const text = String(hint || '');
  return text.length > 26 ? `${text.slice(0, 25)}...` : text;
}
