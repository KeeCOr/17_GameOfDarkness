import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(() => {
  globalThis.Phaser = { Scene: class {} };
});

describe('Multiplayer lobby leaderboard upload', () => {
  it('uploads rank points and requests leaderboard entries when an account payload is received', async () => {
    const { MultiplayerLobbyScene } = await import('../src/scenes/MultiplayerLobbyScene.js');
    const scene = Object.create(MultiplayerLobbyScene.prototype);
    const uploads = [];
    const downloads = [];
    const leaderboardTexts = [];

    scene.accountText = { setText() {} };
    scene.rankText = { setText() {} };
    scene.leaderboardText = { setText: text => leaderboardTexts.push(text) };
    scene.steamService = {
      uploadRankPoints: score => uploads.push(score),
      downloadRankLeaderboard: limit => {
        downloads.push(limit);
        return { ok: true, entries: [{ rank: 1, name: 'Alice', score: 1234 }] };
      },
    };

    scene._onSocketMessage({
      data: JSON.stringify({
        type: 'account',
        account: { name: 'Alice', rankPoints: 1234 },
      }),
    });

    expect(scene.account).toEqual({ name: 'Alice', rankPoints: 1234 });
    expect(uploads).toEqual([1234]);
    expect(downloads).toEqual([5]);
    await Promise.resolve();
    expect(leaderboardTexts.at(-1)).toContain('1. Alice 1234');
  }, 10000);

  it('starts the shared PvP game when the server sends an authoritative state snapshot', async () => {
    const { MultiplayerLobbyScene } = await import('../src/scenes/MultiplayerLobbyScene.js');
    const scene = Object.create(MultiplayerLobbyScene.prototype);
    const starts = [];

    scene.statusText = { setText() {} };
    scene.scene = { start: (key, data) => starts.push({ key, data }) };
    scene._clearAIFallbackTimer = () => {};

    scene._onSocketMessage({
      data: JSON.stringify({
        type: 'matched',
        roomId: 'room-a',
        side: 'PLAYER',
        opponent: { name: 'Bob' },
      }),
    });
    scene._onSocketMessage({
      data: JSON.stringify({
        type: 'pvpState',
        state: { roomId: 'room-a', currentTurn: 'PLAYER', board: [] },
      }),
    });

    expect(starts).toEqual([{
      key: 'Game',
      data: {
        multiplayerMode: 'pvp',
        pvpSide: 'PLAYER',
        pvpRoomId: 'room-a',
        pvpSession: { roomId: 'room-a', currentTurn: 'PLAYER', board: [] },
        skipTutorialPrompt: true,
      },
    }]);
  });

  it('formats leaderboard fallback and top entries', async () => {
    const { formatLeaderboardSummary } = await import('../src/scenes/MultiplayerLobbyScene.js');

    expect(formatLeaderboardSummary()).toBe('Steam 랭킹: 연결 대기');
    expect(formatLeaderboardSummary({
      ok: true,
      entries: [
        { rank: 1, name: 'Alice', score: 1234 },
        { rank: 2, displayName: 'Bob', score: 1200 },
        { rank: 3, score: 1000 },
        { rank: 4, name: 'Hidden', score: 900 },
      ],
    })).toBe('Steam 랭킹\n1. Alice 1234\n2. Bob 1200\n3. Player 3 1000');
  });
});

describe('Multiplayer lobby Steam identity binding', () => {
  it('adds the Steam ID to the matchmaking WebSocket query when available', async () => {
    const { MultiplayerLobbyScene } = await import('../src/scenes/MultiplayerLobbyScene.js');
    const scene = Object.create(MultiplayerLobbyScene.prototype);
    const urls = [];

    globalThis.localStorage = {
      getItem: () => 'Alice',
      setItem() {},
    };
    globalThis.window = { prompt: () => 'Alice' };
    globalThis.WebSocket = class {
      constructor(url) { urls.push(url); }
      addEventListener() {}
    };

    scene.statusText = { setText() {} };
    scene.steamService = {
      getSteamId: () => Promise.resolve({ ok: true, steamId: '76561198000000000' }),
    };

    await scene._connect();

    expect(urls[0]).toContain('name=Alice');
    expect(urls[0]).toContain('steamId=76561198000000000');
  });
});
