import { WebSocket } from 'ws';
import { authService } from '../services/authService';
import { gameService } from '../services/gameService';
import {
  AnswerType,
  CommandsStructureType,
  CommandType,
  Question,
  RegDataReqType,
} from '../types/dataStructureType';
import { clientsStorage } from '../db/auth.storage';
import { gameStorage } from '../db/game.storage';
import { broadcastToGame } from '../utils/broadcastToGame';
import { allAnsweredCheck } from '../services/gameLifecycle';

export const handleMessage = (
  message: CommandsStructureType,
  ws: WebSocket
): CommandsStructureType | undefined => {
  switch (message.type) {
    case CommandType.REG:
      return authService.handleReg(message as CommandsStructureType<RegDataReqType>);
    case CommandType.CREATE_GAME:
      return gameService.handleCreateGame(
        message as CommandsStructureType<{ questions: Question[] }>,
        ws
      );
    case CommandType.JOIN_GAME:
      return gameService.handleJoinGame(message as CommandsStructureType<{ code: string }>, ws);
    case CommandType.START_GAME:
      gameService.handleStartGame(message as CommandsStructureType<{ gameId: string }>, ws);
      break;
    case CommandType.ANSWER:
      return gameService.handleAnswer(message as CommandsStructureType<AnswerType>, ws);

    default:
      return {
        type: message.type,
        data: {
          error: true,
          errorText: 'Unknown command',
        },
        id: message.id,
      };
  }
};

export const handleClose = (ws: WebSocket) => {
  const clientId = clientsStorage.getClient(ws)?.userId;
  const game = gameStorage.findGameByUserId(clientId ?? '');

  clientsStorage.deleteClient(ws);

  if (!game) return;

  if (game?.hostId === clientId) {
    clearTimeout(game.timerId);
    game.timerId = undefined;

    broadcastToGame(game.id, { type: 'error', data: { message: 'Host disconnected' }, id: 0 });
    gameStorage.deleteGame(game.id);

    return;
  }

  game.players = game.players.filter(p => p.index !== clientId);

  broadcastToGame(game.id, {
    type: CommandType.UPDATE_PLAYERS,
    data: game.players.map(({ name, index, score }) => ({ name, index, score })),
    id: 0,
  });

  allAnsweredCheck(game);
};
