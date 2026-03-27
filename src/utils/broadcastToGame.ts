import { clientsStorage } from '../db/auth.storage';
import { gameStorage } from '../db/game.storage';

export function broadcastToGame(gameId: string, message: unknown) {
  const game = gameStorage.getGame(gameId);
  if (!game) return;

  const recipients = [game.hostId, ...game.players.map(p => p.index)];

  const json = JSON.stringify(message);

  recipients.forEach(userId => {
    const ws = clientsStorage.getSocketByUserId(userId.toString());
    if (ws?.readyState === 1) {
      ws.send(json);
    }
  });
}
