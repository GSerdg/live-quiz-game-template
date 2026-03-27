import { Game } from '../types/dataStructureType';
import { broadcastToGame } from '../utils/broadcastToGame';
import { cleanup } from '../utils/cleanup';
import {
  getBroadcastFinishedMessage,
  getBroadcastQuestionMessage,
  getBroadcastResultsMessage,
} from '../utils/getBroadcastMessage';

export const startQuestionCycle = (game: Game) => {
  game.currentQuestion += 1;

  // крайний случай для рекурсии: завершение игры
  if (game.currentQuestion >= game.questions.length) {
    finishGame(game);

    return;
  }

  const broadcastQuestionMessage = getBroadcastQuestionMessage(game);
  broadcastToGame(game.id, broadcastQuestionMessage);

  // Рассылка результата и переход к новому вопросу по истечении времени
  game.currentQuestionStartTime = Date.now();
  game.timerId = setTimeout(() => {
    sendAnswer(game);

    // таймаут перед новым вопросом для просмотра результатов
    setTimeout(() => startQuestionCycle(game), 5000);
  }, game.questions[game.currentQuestion].timeLimitSec * 1000);
};

export const finishGame = (game: Game) => {
  game.status = 'finished';

  const broadcastFinishedMessage = getBroadcastFinishedMessage(game);
  broadcastToGame(game.id, broadcastFinishedMessage);
};

export const sendAnswer = (game: Game) => {
  const broadcastResultsMessage = getBroadcastResultsMessage(game);
  broadcastToGame(game.id, broadcastResultsMessage);

  cleanup(game);
};

export const allAnsweredCheck = (game: Game) => {
  console.log('first', game.answersCount, game.players.length);
  if (game.answersCount >= game.players.length) {
    sendAnswer(game);

    setTimeout(() => startQuestionCycle(game), 5000);
  }
};
