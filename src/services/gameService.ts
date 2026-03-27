import { WebSocket } from 'ws';
import { authStorage, clientsStorage } from '../db/auth.storage';
import { gameStorage } from '../db/game.storage';
import {
  AnswerType,
  CommandsStructureType,
  CommandType,
  CreateGameDataResType,
  Question,
} from '../types/dataStructureType';
import { broadcastToGame } from '../utils/broadcastToGame';
import { allAnsweredCheck, startQuestionCycle } from './gameLifecycle';

export const gameService = {
  handleCreateGame(
    message: CommandsStructureType<{ questions: Question[] }>,
    ws: WebSocket
  ): CommandsStructureType<CreateGameDataResType> {
    const { data } = message;
    const hostId = clientsStorage.getClient(ws)?.userId;

    if (!hostId) throw new Error('User id not found');

    const responseData = gameStorage.createGame(data.questions, hostId);

    return { ...message, data: responseData };
  },

  handleJoinGame(
    message: CommandsStructureType<{ code: string }>,
    ws: WebSocket
  ): CommandsStructureType<{ gameId: string }> {
    const { data, id } = message;
    const client = clientsStorage.getClient(ws);
    const user = authStorage.getUser(client?.userName ?? '');

    if (!client || !user) throw new Error('User id not found');
    if (gameStorage.getGameStatus({ code: data.code }) !== 'waiting') {
      throw new Error('User can not join to game');
    }

    const { gameId, playerName, playerCount, players } = gameStorage.joinGame(data.code, user);

    const broadcastJoinedMessage = {
      type: CommandType.PLAYER_JOINED,
      data: { playerName, playerCount },
      id: 0,
    };

    const playersData = players.map(({ name, index, score }) => ({ name, index, score }));
    const broadcastUpdatePlayersMessage = {
      type: CommandType.UPDATE_PLAYERS,
      data: playersData,
      id: 0,
    };

    broadcastToGame(gameId, broadcastJoinedMessage);
    broadcastToGame(gameId, broadcastUpdatePlayersMessage);

    return { type: CommandType.GAME_JOINED, data: { gameId }, id };
  },

  handleStartGame(message: CommandsStructureType<{ gameId: string }>, ws: WebSocket) {
    const { data } = message;
    const clientId = clientsStorage.getClient(ws)?.userId;

    if (!clientId) throw new Error('User id not found');
    if (gameStorage.getGameStatus({ id: data.gameId }) !== 'waiting') {
      throw new Error('User can not start game');
    }

    const game = gameStorage.getGame(data.gameId);

    if (clientId !== game?.hostId) throw new Error('Only host can start game');

    game.status = 'in_progress';
    startQuestionCycle(game);
  },

  handleAnswer(message: CommandsStructureType<AnswerType>, ws: WebSocket) {
    const BASE_POINTS = 1000;
    const { data, id } = message;
    const clientId = clientsStorage.getClient(ws)?.userId;

    const player = gameStorage.getPlayer(data.gameId, clientId ?? '');
    const game = gameStorage.getGame(data.gameId);

    if (!player) throw new Error('User id not found');
    if (!game) throw new Error('Game not found');
    if (gameStorage.getGameStatus({ id: data.gameId }) !== 'in_progress') {
      throw new Error('Not have started game');
    }
    if (data.questionIndex !== game.currentQuestion) throw new Error('question index error');

    const question = game.questions[data.questionIndex];
    const correctAnswerIndex = question.correctIndex;
    const timeRemaining = Math.max(
      0,
      Math.round(question.timeLimitSec - (Date.now() - game.currentQuestionStartTime) / 1000)
    );

    player.hasAnswered = true;
    player.lastAnswerIndex = data.answerIndex;
    game.answersCount += 1;

    if (data.answerIndex === correctAnswerIndex) {
      const score = BASE_POINTS * (timeRemaining / question.timeLimitSec);

      player.lastAnswerPoints = score;
      player.score += score;
    }

    allAnsweredCheck(game);

    return {
      type: CommandType.ANSWER_ACCEPTED,
      id,
      data: {
        questionIndex: game?.currentQuestion,
      },
    };
  },
};
