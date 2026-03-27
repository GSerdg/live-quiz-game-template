interface Player {
  name: string;
  index: number | string; // unique player id
  score: number;

  // for player answer
  lastAnswerIndex?: number;
  lastAnswerPoints: number;
  hasAnswered: boolean;
}
export interface Question {
  text: string;
  options: [string, string, string, string]; // exactly 4 options
  correctIndex: number; // index of the correct option (0-3)
  timeLimitSec: number; // time limit for the question in seconds
}

export interface Game {
  id: string;
  code: string; // 6-character alphanumeric code
  hostId: string;
  questions: Question[];
  players: Player[];
  currentQuestion: number; // index of current question (-1 before start)
  status: 'waiting' | 'in_progress' | 'finished';

  //for timers
  currentQuestionStartTime: number;
  timerId?: NodeJS.Timeout;
  answersCount: number;
}

export enum CommandType {
  // Аутентификация
  REG = 'reg',

  // Управление игрой (Запросы/Действия)
  CREATE_GAME = 'create_game',
  JOIN_GAME = 'join_game',
  START_GAME = 'start_game',
  EXPORT_QUESTIONS = 'export_questions',
  IMPORT_QUESTIONS = 'import_questions',

  // Игровой процесс (Действия игрока)
  ANSWER = 'answer',

  // Ответы сервера (Персональные)
  GAME_CREATED = 'game_created',
  GAME_JOINED = 'game_joined',
  ANSWER_ACCEPTED = 'answer_accepted',
  QUESTIONS_EXPORTED = 'questions_exported',
  QUESTIONS_IMPORTED = 'questions_imported',

  // Рассылки (Broadcast)
  PLAYER_JOINED = 'player_joined',
  UPDATE_PLAYERS = 'update_players',
  QUESTION = 'question',
  QUESTION_RESULT = 'question_result',
  GAME_FINISHED = 'game_finished',
}

export type CommandsStructureType<T = Record<string, unknown>> = {
  type: CommandType;
  data: T;
  id: number;
};

export type RegDataReqType = {
  name: string;
  password: string;
};

export interface User extends RegDataReqType {
  index: string;
}

export type RegDataResType = {
  name: string;
  index: string;
  error: boolean;
  errorText: string;
};

export type CreateGameDataResType = {
  gameId: string;
  code: string;
};

export type ClientStorageType = {
  userId: string;
  userName: string;
};

export type QuestionResType = Omit<Question, 'correctIndex'> & {
  questionNumber: number;
  totalQuestions: number;
};

export type GameIdentifier = { id: string; code?: never } | { code: string; id?: never };

export type PlayerResultType = {
  name: string;
  answered: boolean;
  correct: boolean;
  pointsEarned: number;
  totalScore: number;
};

export type QuestionResultType = {
  questionIndex: number;
  correctIndex: number;
  playerResults: PlayerResultType[];
};

export type ScoreboardType = {
  name: string;
  score: number;
  rank: number;
};

export type AnswerType = {
  gameId: string;
  questionIndex: number;
  answerIndex: number;
};
