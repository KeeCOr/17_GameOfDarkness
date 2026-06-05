import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(() => {
  globalThis.Phaser = { Scene: class {} };
});

describe('Multiplayer lobby leaderboard upload', () => {
  it('uploads rank points when an account payload is received', async () => {
    const { MultiplayerLobbyScene } = await import('../src/scenes/MultiplayerLobbyScene.js');
    const scene = Object.create(MultiplayerLobbyScene.prototype);
    const uploads = [];

    scene.accountText = { setText() {} };
    scene.rankText = { setText() {} };
    scene.steamService = {
      uploadRankPoints: score => uploads.push(score),
    };

    scene._onSocketMessage({
      data: JSON.stringify({
        type: 'account',
        account: { name: 'Alice', rankPoints: 1234 },
      }),
    });

    expect(scene.account).toEqual({ name: 'Alice', rankPoints: 1234 });
    expect(uploads).toEqual([1234]);
  });
});
