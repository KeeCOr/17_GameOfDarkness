import { LAYOUT, TEXT_COLORS } from '../config.js';
import { formatBotLabel, getBotProfileForMatch } from '../game/botProfiles.js';
import { AI_MATCH_TIMEOUT_MS, getAIMatchDifficulty } from '../game/matchmaking.js';
import { createSteamService } from '../services/SteamService.js';
import { addStageBackground, addTextButton, UI_ASSETS, UI_COPY } from '../ui/visuals.js';

export class MultiplayerLobbyScene extends Phaser.Scene {
  constructor() { super('MultiplayerLobby'); }

  create() {
    this.socket = null;
    this.account = null;
    this.statusText = null;
    this.accountText = null;
    this.rankText = null;
    this.leaderboardText = null;
    this.matchStarted = false;
    this.pvpStarted = false;
    this.pvpRoomId = null;
    this.pvpSide = null;
    this.aiFallbackTimer = null;
    this.steamService = createSteamService();
    this.events.once('shutdown', this.shutdown, this);

    const cx = LAYOUT.GAME_WIDTH / 2;
    addStageBackground(this, UI_COPY.multiplayer.title, { preferTitleArt: true });

    this.statusText = this.add.text(cx, 182, UI_COPY.multiplayer.connecting, {
      fontSize: '18px', color: TEXT_COLORS.MUTED, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.accountText = this.add.text(cx, 245, '', {
      fontSize: '18px', color: TEXT_COLORS.PRIMARY, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.rankText = this.add.text(cx, 280, '', {
      fontSize: '20px', color: TEXT_COLORS.GOLD, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.leaderboardText = this.add.text(cx, 326, formatLeaderboardSummary(), {
      fontSize: '13px',
      color: TEXT_COLORS.MUTED,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 350 },
      lineSpacing: 4,
    }).setOrigin(0.5);

    const queue = addTextButton(this, cx, 430, 286, 76, UI_COPY.multiplayer.queue, {
      fontSize: '21px',
      active: true,
      assetKey: UI_ASSETS.titleButtonFrame.key,
      textOffsetY: 2,
    });
    queue.rect.on('pointerdown', () => this._joinQueue());

    const back = addTextButton(this, cx, 530, 198, 58, UI_COPY.menu.back, {
      fontSize: '16px',
      assetKey: UI_ASSETS.titleButtonFrame.key,
      textOffsetY: 2,
    });
    back.rect.on('pointerdown', () => this._backToMenu());

    this._connect();
  }

  async _connect() {
    const savedName = localStorage.getItem('chesssummon.nickname') || '';
    const typed = window.prompt(UI_COPY.multiplayer.nicknamePrompt, savedName);
    const nickname = (typed || savedName || 'Player').trim().slice(0, 20) || 'Player';
    localStorage.setItem('chesssummon.nickname', nickname);
    try {
      const query = new URLSearchParams({ name: nickname });
      const identity = await Promise.resolve(this.steamService.getSteamId?.()).catch(() => null);
      if (identity?.ok && identity.steamId) query.set('steamId', identity.steamId);
      this.socket = new WebSocket(`${UI_COPY.multiplayer.server}?${query.toString()}`);
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
      this.steamService.uploadRankPoints(message.account.rankPoints);
      this._refreshLeaderboard();
    } else if (message.type === 'queued') {
      this.statusText.setText(UI_COPY.multiplayer.queued);
    } else if (message.type === 'matched') {
      this._clearAIFallbackTimer();
      this.matchStarted = true;
      this.pvpRoomId = message.roomId || null;
      this.pvpSide = message.side || null;
      this.statusText.setText(`${UI_COPY.multiplayer.matched}: ${message.opponent.name}`);
    } else if (message.type === 'pvpState') {
      this._startPvpGame(message.state);
    } else if (message.type === 'pvpResult') {
      this.statusText.setText(message.result?.reason || UI_COPY.multiplayer.matched);
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

  _startPvpGame(state) {
    if (this.pvpStarted || !state) return;
    this.pvpStarted = true;
    this._clearAIFallbackTimer();
    this.scene.start('Game', {
      multiplayerMode: 'pvp',
      pvpSide: this.pvpSide,
      pvpRoomId: this.pvpRoomId || state.roomId,
      pvpSession: state,
      pvpSocket: this.socket,
      skipTutorialPrompt: true,
    });
  }

  _refreshLeaderboard() {
    const result = this.steamService.downloadRankLeaderboard?.(5);
    Promise.resolve(result)
      .then(board => this.leaderboardText?.setText(formatLeaderboardSummary(board)))
      .catch(() => this.leaderboardText?.setText(formatLeaderboardSummary({ ok: false, entries: [] })));
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
    if (this.socket && !this.pvpStarted) this.socket.close();
  }
}

export function formatLeaderboardSummary(result = null) {
  if (!result?.ok || !Array.isArray(result.entries) || result.entries.length === 0) {
    return 'Steam 랭킹: 연결 대기';
  }
  const rows = result.entries.slice(0, 3).map((entry, index) => {
    const rank = entry.rank ?? index + 1;
    const name = entry.name || entry.displayName || `Player ${rank}`;
    const score = Number.isFinite(Number(entry.score)) ? Number(entry.score) : 0;
    return `${rank}. ${name} ${score}`;
  });
  return `Steam 랭킹\n${rows.join('\n')}`;
}


