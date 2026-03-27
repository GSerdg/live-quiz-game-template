import { Game } from '../types/dataStructureType';

export const cleanup = (game: Game) => {
  clearTimeout(game?.timerId);
  game.timerId = undefined;
  game.answersCount = 0;

  game.players.forEach(player => {
    player.hasAnswered = false;
    player.lastAnswerIndex = undefined;
    player.lastAnswerPoints = 0;
  });
};
