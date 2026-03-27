import { randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';
import { RegDataReqType, User, ClientStorageType } from '../types/dataStructureType';

export const authStorage = {
  _users: new Map<string, User>(),
  _usersIds: new Map<string, string>(),

  haveUser(name: string) {
    return this._users.has(name);
  },
  getUser(name: string) {
    return this._users.get(name);
  },
  setUser(userData: RegDataReqType) {
    const index = randomUUID();
    this._users.set(userData.name, { ...userData, index });
    this._usersIds.set(index, userData.name);

    return this.getUser(userData.name);
  },
};

export const clientsStorage = {
  _clients: new Map<WebSocket, ClientStorageType>(),
  _sockets: new Map<string, WebSocket>(),

  getClient(ws: WebSocket) {
    return this._clients.get(ws);
  },
  deleteClient(ws: WebSocket) {
    const client = this.getClient(ws);
    this._clients.delete(ws);
    this._sockets.delete(client?.userId ?? '');
  },
  setClient(ws: WebSocket, data: ClientStorageType) {
    this._clients.set(ws, data);
    this._sockets.set(data.userId, ws);
  },
  getSocketByUserId(userId: string) {
    return this._sockets.get(userId);
  },
};
