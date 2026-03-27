import {
  CommandsStructureType,
  CommandType,
  Game,
  PlayerResultType,
  QuestionResType,
  QuestionResultType,
  ScoreboardType,
} from '../types/dataStructureType';

export const getBroadcastQuestionMessage = (game: Game) => {
  const { text, options, timeLimitSec } = game.questions[game.currentQuestion];

  const message: CommandsStructureType<QuestionResType> = {
    type: CommandType.QUESTION,
    id: 0,
    data: {
      text,
      options,
      timeLimitSec,
      questionNumber: game.currentQuestion + 1,
      totalQuestions: game.questions.length,
    },
  };

  return message;
};

export const getBroadcastResultsMessage = (game: Game) => {
  const correctAnswerIndex = game.questions[game.currentQuestion].correctIndex;

  const playerResults: PlayerResultType[] = game.players.map(player => ({
    name: player.name,
    answered: player.hasAnswered,
    correct: player.lastAnswerIndex === correctAnswerIndex,
    pointsEarned: player.lastAnswerPoints,
    totalScore: player.score,
  }));

  const message: CommandsStructureType<QuestionResultType> = {
    type: CommandType.QUESTION_RESULT,
    id: 0,
    data: {
      questionIndex: game.currentQuestion,
      correctIndex: correctAnswerIndex,
      playerResults,
    },
  };

  return message;
};

export const getBroadcastFinishedMessage = (game: Game) => {
  const scoreboard: ScoreboardType[] = [...game.players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => {
      return {
        name: player.name,
        score: player.score,
        rank: index + 1,
      };
    });

  const message: CommandsStructureType<{ scoreboard: ScoreboardType[] }> = {
    type: CommandType.GAME_FINISHED,
    id: 0,
    data: {
      scoreboard,
    },
  };

  return message;
};
