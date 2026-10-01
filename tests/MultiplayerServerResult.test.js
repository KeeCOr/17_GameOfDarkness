import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { createMultiplayerCore } = require('../server/multiplayerCore.cjs');

function tempRankFile() {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'chesssummon-server-')), 'ranks.json');
}

describe('multiplayer server result flow', () => {
  it('matches two queued clients into a room and broadcasts an authoritative PvP snapshot', () => {
    const sent = [];
    const core = createMultiplayerCore({
      rankFile: tempRankFile(),
      send: (socket, message) => sent.push({ socket, message }),
      randomRoomId: () => 'room-a',
    });
    const alice = core.createClient({ id: 'alice-socket' }, 'Alice', { steamId: 'steam-a' });
    const bob = core.createClient({ id: 'bob-socket' }, 'Bob', { steamId: 'steam-b' });

    core.handleMessage(alice, { type: 'joinQueue' });
    core.handleMessage(bob, { type: 'joinQueue' });

    expect(sent.map(entry => entry.message.type)).toEqual([
      'account', 'account', 'queued', 'matched', 'matched', 'pvpState', 'pvpState',
    ]);
    expect(alice.roomId).toBe('room-a');
    expect(bob.roomId).toBe('room-a');
    expect(core.rooms.get('room-a').session.currentTurn).toBe('PLAYER');
    expect(sent.filter(entry => entry.message.type === 'pvpState').at(-1).message.state.players.AI).toMatchObject({
      accountName: 'Bob',
      steamId: 'steam-b',
    });
  });

  it('ignores client-provided matchResult winners and records only server-generated PvP results', () => {
    const sent = [];
    const core = createMultiplayerCore({
      rankFile: tempRankFile(),
      send: (socket, message) => sent.push({ socket, message }),
      randomRoomId: () => 'room-a',
    });
    const alice = core.createClient({ id: 'alice-socket' }, 'Alice');
    const bob = core.createClient({ id: 'bob-socket' }, 'Bob');

    core.handleMessage(alice, { type: 'joinQueue' });
    core.handleMessage(bob, { type: 'joinQueue' });
    core.handleMessage(alice, { type: 'matchResult', winnerName: 'Alice' });

    expect(sent.filter(entry => entry.message.type === 'account')).toHaveLength(2);

    core.handleMessage(alice, { type: 'pvpCommand', command: { type: 'resign' } });

    const accountMessages = sent.filter(entry => entry.message.type === 'account').slice(-2);
    expect(accountMessages.map(entry => entry.message.account)).toEqual([
      { name: 'Bob', rankPoints: 1015, wins: 1, losses: 0 },
      { name: 'Alice', rankPoints: 985, wins: 0, losses: 1 },
    ]);
    expect(sent.filter(entry => entry.message.type === 'pvpResult').at(-1).message.result).toEqual({
      winnerSide: 'AI',
      loserSide: 'PLAYER',
      reason: 'resign',
    });
  });
});
