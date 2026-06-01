import { LAYOUT, TEXT_COLORS } from '../config.js';
import { formatBotLabel, getBotProfileForMatch } from '../game/botProfiles.js';
import { AI_MATCH_TIMEOUT_MS, getAIMatchDifficulty } from '../game/matchmaking.js';
import { addStageBackground, addTextButton, UI_COPY } from '../ui/visuals.js';

export class MultiplayerLobbyScene extends Phaser.Scene {
  constructor() { super('MultiplayerLobby'); }

  create() {
    this.socket = null;
    this.account = null;
    this.statusText = null;
    this.accountText = null;
    this.rankText = null;
    this.matchStarted = false;
    this.aiFallbackTimer = null;

    const cx = LAYOUT.GAME_WIDTH / 2;
    addStageBackground(this, UI_COPY.multiplayer.title);

    this.statusText = this.add.text(cx, 182, UI_COPY.multiplayer.connecting, {
      fontSize: '18px', color: TEXT_COLORS.MUTED, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.accountText = this.add.text(cx, 245, '', {
      fontSize: '18px', color: TEXT_COLORS.PRIMARY, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.rankText = this.add.text(cx, 280, '', {
      fontSize: '20px', color: TEXT_COLORS.GOLD, fontStyle: 'bold',
    }).setOrigin(0.5);

    const queue = addTextButton(this, cx, 365, 230, 54, UI_COPY.multiplayer.queue, { fontSize: '20px', active: true });
    queue.rect.on('pointerdown', () => this._joinQueue());

    const back = addTextButton(this, cx, 440, 160, 44, UI_COPY.menu.back, { fontSize: '16px' });
    back.rect.on('pointerdown', () => this._backToMenu());

    this._connect();
  }

  _connect() {
    const savedName = localStorage.getItem('chesssummon.nickname') || '';
    const typed = window.prompt(UI_COPY.multiplayer.nicknamePrompt, savedName);
    const nickname = (typed || savedName || 'Player').trim().slice(0, 20) || 'Player';
    localStorage.setItem('chesssummon.nickname', nickname);
    try {
      this.socket = new WebSocket(`${UI_COPY.multiplayer.server}?name=${encodeURIComponent(nickname)}`);
      this.socket.addEventListener('message', event => this._onSocketMessage(event));
      this.socket.addEventListener('open', () => this.statusText.setText('서버 연결됨'));
      this.socket.addEventListener('close', () => this.statusText.setText(UI_COPY.multiplayer.offline));
      this.socket.addEventListener('error', () => this.statusText.setText(UI_COPY.multiplayer.offline));
    } catch {
      this.statusText.setText(UI_COPY.multiplayer.offline);
    }
  }

  _onSocketMessage(event) {
    const message = JSON.parse(event.data);
    if (message.type === 'account') {
      this.account = message.account;
      this.accountText.setText(`${UI_COPY.multiplayer.account}: ${message.account.name}`);
      this.rankText.setText(`${UI_COPY.multiplayer.rank}: ${message.account.rankPoints}`);
    } else if (message.type === 'queued') {
      this.statusText.setText(UI_COPY.multiplayer.queued);
    } else if (message.type === 'matched') {
      this._clearAIFallbackTimer();
      this.matchStarted = true;
      this.statusText.setText(`${UI_COPY.multiplayer.matched}: ${message.opponent.name}`);
    }
  }

  _joinQueue() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.statusText.setText(UI_COPY.multiplayer.offline);
      return;
    }
    this.socket.send(JSON.stringify({ type: 'joinQueue' }));
    this.statusText.setText(UI_COPY.multiplayer.queued);
    this._startAIFallbackTimer();
  }

  _startAIFallbackTimer() {
    this._clearAIFallbackTimer();
    this.aiFallbackTimer = this.time.delayedCall(AI_MATCH_TIMEOUT_MS, () => this._startAIMatch());
  }

  _clearAIFallbackTimer() {
    if (this.aiFallbackTimer) {
      this.aiFallbackTimer.remove();
      this.aiFallbackTimer = null;
    }
  }

  _startAIMatch() {
    if (this.matchStarted) return;
    this.matchStarted = true;
    this._clearAIFallbackTimer();
    if (this.socket) this.socket.close();
    const difficulty = getAIMatchDifficulty(this.account?.rankPoints);
    const botProfile = getBotProfileForMatch(this.account?.name, this.account?.rankPoints);
    this.statusText.setText(`${UI_COPY.multiplayer.aiMatched}: ${formatBotLabel(botProfile)} / ${UI_COPY.menu.difficulties[difficulty]}`);
    this.time.delayedCall(550, () => {
      this.scene.start('Placement', {
        difficulty,
        skipTutorialPrompt: true,
        matchedAI: true,
        aiProfile: botProfile,
      });
    });
  }

  _backToMenu() {
    this._clearAIFallbackTimer();
    if (this.socket) this.socket.close();
    this.scene.start('Menu');
  }

  shutdown() {
    this._clearAIFallbackTimer();
    if (this.socket) this.socket.close();
  }
}
