import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  createPvpSession,
  createPlayerIdentity,
  serializePvpState,
} = require('../server/pvpSession.cjs');

describe('server-authoritative PvP session', () => {
  it('binds players to stable Steam-aware identities and starts with server-owned board state', () => {
    const session = createPvpSession({
      roomId: 'room-a',
      players: [
        createPlayerIdentity({ account: { name: 'Alice', rankPoints: 1000 }, steamId: 'steam-a', side: 'PLAYER' }),
        createPlayerIdentity({ account: { name: 'Bob', rankPoints: 1000 }, steamId: 'steam-b', side: 'AI' }),
      ],
    });

    const state = serializePvpState(session);

    expect(state.roomId).toBe('room-a');
    expect(state.currentTurn).toBe('PLAYER');
    expect(state.players.PLAYER).toMatchObject({ accountName: 'Alice', steamId: 'steam-a' });
    expect(state.players.AI).toMatchObject({ accountName: 'Bob', steamId: 'steam-b' });
    expect(state.board[4][2]).toEqual({ type: 'KING', owner: 'PLAYER' });
    expect(state.board[0][2]).toEqual({ type: 'KING', owner: 'AI' });
  });

  it('rejects commands from the wrong turn or wrong owner before mutating the board', () => {
    const session = createPvpSession({
      roomId: 'room-a',
      players: [
        createPlayerIdentity({ account: { name: 'Alice' }, side: 'PLAYER' }),
        createPlayerIdentity({ account: { name: 'Bob' }, side: 'AI' }),
      ],
    });

    expect(session.applyCommand('AI', { type: 'move', from: { row: 0, col: 2 }, to: { row: 1, col: 2 } })).toEqual({
      ok: false,
      error: 'not_current_turn',
    });
    expect(session.applyCommand('PLAYER', { type: 'move', from: { row: 0, col: 2 }, to: { row: 1, col: 2 } })).toEqual({
      ok: false,
      error: 'not_your_piece',
    });
    expect(serializePvpState(session).board[0][2]).toEqual({ type: 'KING', owner: 'AI' });
  });

  it('synchronizes move, summon, and end-turn commands through server snapshots', () => {
    const session = createPvpSession({
      roomId: 'room-a',
      players: [
        createPlayerIdentity({ account: { name: 'Alice' }, side: 'PLAYER' }),
        createPlayerIdentity({ account: { name: 'Bob' }, side: 'AI' }),
      ],
    });

    expect(session.applyCommand('PLAYER', { type: 'move', from: { row: 4, col: 2 }, to: { row: 3, col: 2 } }).ok).toBe(true);
    expect(session.applyCommand('PLAYER', { type: 'endTurn' }).ok).toBe(true);
    expect(session.applyCommand('AI', { type: 'endTurn' }).ok).toBe(true);
    expect(session.applyCommand('PLAYER', { type: 'summon', pieceType: 'PAWN', to: { row: 4, col: 2 } }).ok).toBe(true);

    const state = serializePvpState(session);
    expect(state.currentTurn).toBe('PLAYER');
    expect(state.board[3][2]).toEqual({ type: 'KING', owner: 'PLAYER' });
    expect(state.board[4][2]).toEqual({ type: 'PAWN', owner: 'PLAYER' });
    expect(state.mana.PLAYER).toBe(1);
  });

  it('generates ranked results on the server for checkmate captures, resigns, and disconnect forfeits', () => {
    const session = createPvpSession({
      roomId: 'room-a',
      players: [
        createPlayerIdentity({ account: { name: 'Alice' }, side: 'PLAYER' }),
        createPlayerIdentity({ account: { name: 'Bob' }, side: 'AI' }),
      ],
    });

    const resign = session.applyCommand('PLAYER', { type: 'resign' });
    expect(resign).toEqual({ ok: true, result: { winnerSide: 'AI', loserSide: 'PLAYER', reason: 'resign' } });

    const disconnectSession = createPvpSession({
      roomId: 'room-b',
      players: [
        createPlayerIdentity({ account: { name: 'Alice' }, side: 'PLAYER' }),
        createPlayerIdentity({ account: { name: 'Bob' }, side: 'AI' }),
      ],
    });
    expect(disconnectSession.forfeit('AI', 'disconnect')).toEqual({
      ok: true,
      result: { winnerSide: 'PLAYER', loserSide: 'AI', reason: 'disconnect' },
    });
  });
});
