// src/scenes/UIScene.js
import {
  COLORS, LAYOUT, Owner, PieceType, SUMMON_COSTS, SUMMON_REPEAT_COST_INCREASE, TEXT_COLORS,
  TURN_TIME_LIMIT,
} from '../config.js';
import {
  addDivider, addPanel, addSectionLabel, addTextButton, getPieceName,
  setButtonState, UI_COPY,
} from '../ui/visuals.js';

const SUMMONABLE = [PieceType.PAWN, PieceType.KNIGHT, PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN];
const PANEL_X = LAYOUT.PANEL_X;
const CONTENT_W = LAYOUT.PANEL_WIDTH;

export class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UI', active: false }); }

  create() {
    this.gameScene = this.scene.get('Game');

    addPanel(this, LAYOUT.HUD_TOP_X, LAYOUT.HUD_TOP_Y, LAYOUT.HUD_TOP_WIDTH, LAYOUT.HUD_TOP_HEIGHT, { strokeAlpha: 0.68, alpha: 0.98 });
    addPanel(this, LAYOUT.HUD_PANEL_X, LAYOUT.HUD_PANEL_Y, LAYOUT.HUD_PANEL_WIDTH, LAYOUT.HUD_PANEL_HEIGHT, { strokeAlpha: 0.68, alpha: 0.98 });

    this.turnText = this.add.text(PANEL_X, LAYOUT.HUD_TOP_Y + 14, UI_COPY.game.playerTurn, {
      fontSize: '18px', color: TEXT_COLORS.SUCCESS, fontStyle: 'bold',
    });
    this.timerText = this.add.text(PANEL_X, LAYOUT.HUD_TOP_Y + 40, formatClock(TURN_TIME_LIMIT), {
      fontSize: '24px', color: TEXT_COLORS.TIMER, fontStyle: 'bold',
    });

    const help = addTextButton(this, PANEL_X + CONTENT_W - 18, LAYOUT.HUD_TOP_Y + 28, 30, 30, UI_COPY.game.help, { fontSize: '16px', active: true });
    help.rect.on('pointerdown', () => this._showHelp());

    addSectionLabel(this, PANEL_X + 178, LAYOUT.HUD_TOP_Y + 13, UI_COPY.game.action);
    this.moveSlot = this._addActionSlot(PANEL_X + 176, LAYOUT.HUD_TOP_Y + 56, UI_COPY.game.moveSlot);

    this.ruleText = this.add.text(PANEL_X + 178, LAYOUT.HUD_TOP_Y + 72, UI_COPY.game.turnRule, {
      fontSize: '12px', color: '#ffffff', fontStyle: 'bold',
    });
    this.ruleSubText = this.add.text(PANEL_X + 302, LAYOUT.HUD_TOP_Y + 74, UI_COPY.game.turnRuleSub, {
      fontSize: '10px', color: TEXT_COLORS.MUTED,
    });

    addSectionLabel(this, PANEL_X, LAYOUT.HUD_SUMMON_LABEL_Y, UI_COPY.game.summon);
    this.summonHint = this.add.text(PANEL_X, LAYOUT.HUD_SUMMON_LABEL_Y + 16, UI_COPY.game.summonHint, {
      fontSize: '10px', color: '#6fffe0', fontStyle: 'bold',
      wordWrap: { width: 160 },
    }).setOrigin(0, 0);
    this.manaBadge = this.add.rectangle(PANEL_X + CONTENT_W - 52, LAYOUT.HUD_MANA_Y, 94, 24, COLORS.BUTTON_DISABLED)
      .setAlpha(0.86);
    this.manaBadge.setStrokeStyle(1, COLORS.PANEL_EDGE, 0.45);
    this._addManaIcon(PANEL_X + CONTENT_W - 88, LAYOUT.HUD_MANA_Y, 0.88);
    this.manaText = this.add.text(PANEL_X + CONTENT_W - 74, LAYOUT.HUD_MANA_Y, '0/10', {
      fontSize: '15px', color: TEXT_COLORS.MANA, fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.summonButtons = {};
    SUMMONABLE.forEach((type, i) => {
      const y = LAYOUT.HUD_SUMMON_START_Y + i * LAYOUT.HUD_SUMMON_ROW_GAP;
      const button = addTextButton(this, PANEL_X + CONTENT_W / 2, y, CONTENT_W, LAYOUT.HUD_SUMMON_ROW_HEIGHT, '', { enabled: false, fontSize: '14px' });
      const icon = this.add.image(PANEL_X + 20, y, `${type.toLowerCase()}_w`).setDisplaySize(24, 24).setAlpha(0.3).setDepth(2);
      const name = this.add.text(PANEL_X + 44, y, getPieceName(type), {
        fontSize: '15px', color: TEXT_COLORS.PRIMARY, fontStyle: 'bold',
      }).setOrigin(0, 0.5).setAlpha(0.5).setDepth(2);
      const manaIcon = this._addManaIcon(PANEL_X + CONTENT_W - 88, y, 0.78, 2);
      manaIcon.setAlpha(0.45);
      const cost = this.add.text(PANEL_X + CONTENT_W - 77, y, String(SUMMON_COSTS[type]), {
        fontSize: '14px', color: TEXT_COLORS.DIM, fontStyle: 'bold',
      }).setOrigin(0, 0.5).setAlpha(0.5).setDepth(2);

      button.rect.on('pointerdown', () => {
        if (!button.rect.getData('enabled')) return;
        this.gameScene.startSummonMode(type);
        this._highlightActiveSummon(button.rect.getData('active') ? null : type);
      });
      this.summonButtons[type] = { ...button, icon, manaIcon, name, cost };
    });

    this.summonSlot = this._addActionSlot(PANEL_X, LAYOUT.HUD_PANEL_Y + 211, UI_COPY.game.summonSlot);

    this.checkText = this.add.text(PANEL_X + CONTENT_W - 90, LAYOUT.HUD_TOP_Y + 72, UI_COPY.game.check, {
      fontSize: '17px', color: TEXT_COLORS.DANGER, fontStyle: 'bold',
    }).setVisible(false);

    this.endButton = addTextButton(this, PANEL_X + 116, LAYOUT.HUD_FOOTER_Y, 220, 34, UI_COPY.game.endTurn, { danger: true, fontSize: '15px' });
    this.endButton.rect.on('pointerdown', () => this.gameScene.endTurnManually());

    this.surrenderButton = addTextButton(this, PANEL_X + 298, LAYOUT.HUD_FOOTER_Y, 104, 34, UI_COPY.game.surrender, { fontSize: '13px' });
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
  }

  _addActionSlot(x, y, label) {
    const bg = this.add.rectangle(x + 82, y, 164, 46, COLORS.BUTTON_BG).setAlpha(0.95);
    bg.setStrokeStyle(2, COLORS.PANEL_EDGE, 0.55);
    const labelText = this.add.text(x + 82, y - 9, label, {
      fontSize: '12px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const stateText = this.add.text(x + 82, y + 10, UI_COPY.game.moveReady, {
      fontSize: '13px', color: '#6fffe0', fontStyle: 'bold',
    }).setOrigin(0.5);
    return { bg, labelText, stateText };
  }

  _addManaIcon(x, y, scale = 1, depth = 2) {
    const g = this.add.graphics().setDepth(depth);
    const w = 7 * scale;
    const h = 9 * scale;
    g.fillStyle(0x37d9ff, 1);
    g.beginPath();
    g.moveTo(x, y - h);
    g.lineTo(x + w, y);
    g.lineTo(x, y + h);
    g.lineTo(x - w, y);
    g.closePath();
    g.fillPath();
    g.lineStyle(Math.max(1, 1.5 * scale), 0xd8fbff, 0.9);
    g.strokePath();
    return g;
  }

  _showHelp() {
    const cx = LAYOUT.GAME_WIDTH / 2, cy = LAYOUT.GAME_HEIGHT / 2;
    const overlay = this.add.rectangle(cx, cy, LAYOUT.GAME_WIDTH, LAYOUT.GAME_HEIGHT, 0x000000, 0.66).setDepth(60).setInteractive();
    const panel = addPanel(this, cx - 200, cy - 150, 400, 300, { depth: 61, stroke: COLORS.GOLD });
    const title = this.add.text(cx, cy - 118, UI_COPY.help.title, {
      fontSize: '24px', color: TEXT_COLORS.GOLD, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(62);

    const lines = UI_COPY.help.lines.map(line => `- ${line}`).join('\n');
    const body = this.add.text(cx - 172, cy - 76, lines, {
      fontSize: '15px', color: '#ffffff', lineSpacing: 9,
      wordWrap: { width: 344 },
    }).setDepth(62);

    const ok = addTextButton(this, cx, cy + 112, 120, 38, UI_COPY.help.close, { active: true, depth: 62 });
    const objs = [overlay, panel, title, body, ok.rect, ok.text];
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

    const objs = [overlay, panel, msg, yes.rect, yes.text, no.rect, no.text];
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

    const objs = [overlay, panel, title, body, think.rect, think.text, lose.rect, lose.text];
    const close = () => objs.forEach(o => o.destroy());
    const resolve = keepThinking => {
      close();
      this.gameScene.resolveIdleWarning(keepThinking);
    };
    think.rect.on('pointerdown', () => resolve(true));
    lose.rect.on('pointerdown', () => resolve(false));
    overlay.on('pointerdown', () => resolve(false));
  }

  _onTurnStart({ turn, mana, timeLeft, summonCounts }) {
    const playerTurn = turn === Owner.PLAYER;
    this.turnText.setText(playerTurn ? UI_COPY.game.playerTurn : UI_COPY.game.aiTurn);
    this.turnText.setColor(playerTurn ? TEXT_COLORS.SUCCESS : TEXT_COLORS.DANGER);
    this.timerText.setText(formatClock(timeLeft));
    this.timerText.setColor(TEXT_COLORS.TIMER);
    this.manaText.setText(`${mana[Owner.PLAYER]}/10`);
    this.checkText.setVisible(false);
    this._updateActionStatus(false, false);
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

  _onPlayerAction({ hasMoved, hasSummoned, mana, summonCounts }) {
    this._refreshSummonButtons(mana, hasSummoned, summonCounts || {});
    this._updateActionStatus(hasMoved, hasSummoned);
    this.manaText.setText(`${mana}/10`);
    this._highlightActiveSummon(null);
  }

  _onSummonCancel() {
    this._highlightActiveSummon(null);
  }

  _onSummonMode({ pieceType }) {
    this._highlightActiveSummon(pieceType);
  }

  _onTimerTick(payload) {
    const timeLeft = typeof payload === 'number' ? payload : payload.timeLeft;
    this.timerText.setText(formatClock(timeLeft));
    this.timerText.setColor(timeLeft <= 10 ? TEXT_COLORS.TIMER_LOW : TEXT_COLORS.TIMER);
  }

  _updateActionStatus(hasMoved, hasSummoned) {
    this._setActionSlot(this.moveSlot, hasMoved);
    this._setActionSlot(this.summonSlot, hasSummoned);
  }

  _setActionSlot(slot, done) {
    slot.bg.setFillStyle(done ? COLORS.EMERALD : COLORS.BUTTON_BG);
    slot.bg.setAlpha(done ? 1 : 0.95);
    slot.stateText.setText(done ? UI_COPY.game.moveDone : UI_COPY.game.moveReady);
    slot.stateText.setColor(done ? '#ffffff' : '#6fffe0');
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
        entry.cost.setColor(isActive ? '#1a1208' : '#dceeff');
        entry.manaIcon.setAlpha(1);
        entry.name.setColor(isActive ? '#1a1208' : TEXT_COLORS.PRIMARY);
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
    }
  }
}

function formatClock(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
