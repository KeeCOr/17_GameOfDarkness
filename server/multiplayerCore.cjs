const { getAccount, recordResult } = require('./rankStore.cjs');
const { createPlayerIdentity, createPvpSession, serializePvpState } = require('./pvpSession.cjs');

function createMultiplayerCore({ rankFile, send, randomRoomId }) {
  const clients = new Set();
  const rooms = new Map();
  let waiting = null;

  function createClient(socket, rawName, identity = {}) {
    const account = getAccount(rankFile, rawName);
    const client = { socket, account, steamId: identity.steamId || null, roomId: null, side: null };
    clients.add(client);
    send(socket, { type: 'account', account });
    return client;
  }

  function closeClient(client) {
    clients.delete(client);
    if (waiting === client) waiting = null;
    if (client.roomId && rooms.has(client.roomId)) {
      const room = rooms.get(client.roomId);
      if (!room.session.result && client.side) {
        const outcome = room.session.forfeit(client.side, 'disconnect');
        if (outcome.ok) recordPvpResult(room, outcome.result);
      }
      rooms.delete(client.roomId);
    }
    try { client.socket.destroy?.(); } catch {}
  }

  function handleMessage(client, message) {
    if (message.type === 'joinQueue') {
      joinQueue(client);
    } else if (message.type === 'pvpCommand') {
      handlePvpCommand(client, message.command);
    }
  }

  function joinQueue(client) {
    if (waiting && waiting !== client) {
      const opponent = waiting;
      waiting = null;
      const roomId = randomRoomId();
      opponent.roomId = roomId;
      client.roomId = roomId;
      opponent.side = 'PLAYER';
      client.side = 'AI';

      const session = createPvpSession({
        roomId,
        players: [
          createPlayerIdentity({ account: opponent.account, steamId: opponent.steamId, side: opponent.side }),
          createPlayerIdentity({ account: client.account, steamId: client.steamId, side: client.side }),
        ],
      });
      const room = { id: roomId, clients: [opponent, client], session };
      rooms.set(roomId, room);

      send(opponent.socket, { type: 'matched', roomId, side: opponent.side, opponent: client.account });
      send(client.socket, { type: 'matched', roomId, side: client.side, opponent: opponent.account });
      broadcastPvpState(room);
    } else {
      waiting = client;
      send(client.socket, { type: 'queued' });
    }
  }

  function handlePvpCommand(client, command) {
    const room = client.roomId ? rooms.get(client.roomId) : null;
    if (!room || !client.side) return;
    const outcome = room.session.applyCommand(client.side, command);
    if (!outcome.ok) {
      send(client.socket, { type: 'pvpRejected', error: outcome.error, result: outcome.result || null });
      return;
    }
    if (outcome.result) {
      recordPvpResult(room, outcome.result);
    } else {
      broadcastPvpState(room);
    }
  }

  function broadcastPvpState(room) {
    const state = serializePvpState(room.session);
    for (const entry of room.clients) send(entry.socket, { type: 'pvpState', state });
  }

  function recordPvpResult(room, result) {
    const winner = room.clients.find(entry => entry.side === result.winnerSide);
    const loser = room.clients.find(entry => entry.side === result.loserSide);
    if (!winner || !loser) return;
    const updated = recordResult(rankFile, winner.account.name, loser.account.name);
    winner.account = updated.winner;
    loser.account = updated.loser;
    send(winner.socket, { type: 'account', account: updated.winner });
    send(loser.socket, { type: 'account', account: updated.loser });
    for (const entry of room.clients) send(entry.socket, { type: 'pvpResult', result });
  }

  return {
    clients,
    rooms,
    createClient,
    closeClient,
    handleMessage,
  };
}

module.exports = { createMultiplayerCore };
