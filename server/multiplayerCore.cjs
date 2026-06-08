const { getAccount, recordResult } = require('./rankStore.cjs');

function createMultiplayerCore({ rankFile, send, randomRoomId }) {
  const clients = new Set();
  const rooms = new Map();
  let waiting = null;

  function createClient(socket, rawName) {
    const account = getAccount(rankFile, rawName);
    const client = { socket, account, roomId: null };
    clients.add(client);
    send(socket, { type: 'account', account });
    return client;
  }

  function closeClient(client) {
    clients.delete(client);
    if (waiting === client) waiting = null;
    if (client.roomId && rooms.has(client.roomId)) rooms.delete(client.roomId);
    try { client.socket.destroy?.(); } catch {}
  }

  function handleMessage(client, message) {
    if (message.type === 'joinQueue') {
      joinQueue(client);
    } else if (message.type === 'matchResult') {
      recordMatchResult(client, message);
    }
  }

  function joinQueue(client) {
    if (waiting && waiting !== client) {
      const opponent = waiting;
      waiting = null;
      const roomId = randomRoomId();
      client.roomId = roomId;
      opponent.roomId = roomId;
      rooms.set(roomId, [opponent, client]);
      send(opponent.socket, { type: 'matched', roomId, side: 'PLAYER', opponent: client.account });
      send(client.socket, { type: 'matched', roomId, side: 'AI', opponent: opponent.account });
    } else {
      waiting = client;
      send(client.socket, { type: 'queued' });
    }
  }

  function recordMatchResult(client, message) {
    const room = client.roomId ? rooms.get(client.roomId) : null;
    if (!room || room.length !== 2) return;
    const winnerName = String(message.winnerName || '').trim();
    const winner = room.find(entry => entry.account.name === winnerName);
    const loser = room.find(entry => entry.account.name !== winnerName);
    if (!winner || !loser) return;

    const result = recordResult(rankFile, winner.account.name, loser.account.name);
    winner.account = result.winner;
    loser.account = result.loser;
    send(winner.socket, { type: 'account', account: result.winner });
    send(loser.socket, { type: 'account', account: result.loser });
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
