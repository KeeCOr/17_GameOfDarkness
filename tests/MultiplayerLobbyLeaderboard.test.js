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
