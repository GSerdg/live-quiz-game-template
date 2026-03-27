import { randomUUID } from 'node:crypto';
import { Question, Game, User, GameIdentifier } from '../types/dataStructureType';
import { generateRoomCode } from '../utils/generateRoomCode';

export const questionsStorage = {
  _questions: new Map<string, Question[]>(),

  haveQuestions(name: string) {
    return this._questions.has(name) && this._questions.get(name)!.length > 0;
  },
  getQuestions(name: string) {
    return this._questions.get(name);
  },
  setQuestions(name: string, questionsData: Question[]) {
    this._questions.set(name, questionsData);
  },
};

export const gameStorage = {
  _games: new Map<string, Game>(),
  _gameCodes: new Map<string, string>(),

  getGame(id: string) {
    return this._games.get(id);
  },

  deleteGame(id: string) {
    this._games.delete(id);
  },

  getPlayer(gameId: string, playerId: string) {
    const players = this.getGame(gameId)?.players ?? [];
    const player = players.find(p => p.index === playerId);

    return player;
  },

  findGameByUserId(userId: string) {
    const games = this._games.values();

    return games.find(game => game.players.some(p => p.index === userId));
  },

  getGameStatus({ id, code }: GameIdentifier) {
    const gameId = code ? this._gameCodes.get(code) : id;
    const game = this._games.get(gameId ?? '');

    return game?.status;
  },

  createGame(questions: Question[], hostId: string) {
    const id = randomUUID();

    let code;
    while (!code) {
      const tmpCode = generateRoomCode();

      if (!this._gameCodes.has(tmpCode)) {
        code = tmpCode;
      }
    }

    const gameData: Game = {
      id,
      code,
      hostId,
      questions,
      players: [],
      currentQuestion: -1,
      status: 'waiting',

      currentQuestionStartTime: 0,
      answersCount: 0,
    };

    this._games.set(id, gameData);
    this._gameCodes.set(code, id);

    return { gameId: gameData.id, code: gameData.code };
  },

  joinGame(code: string, user: User) {
    const id = this._gameCodes.get(code) ?? '';
    const game = this._games.get(id);

    if (!id || !game) throw new Error('Join game error: game not found');

    const { name, index } = user;

    if (!game.players.some(p => p.index === index)) {
      game.players.push({ name, index, score: 0, lastAnswerPoints: 0, hasAnswered: false });
    }

    return {
      gameId: game.id,
      playerName: name,
      playerCount: game.players.length,
      players: game.players,
    };
  },
};
