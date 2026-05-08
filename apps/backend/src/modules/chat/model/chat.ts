import type { ServerWebSocket } from "elysia/ws/bun";

export interface Chat {
  authKey: string;
}

export interface ChatEntry extends Chat {
  connections: Map<string, ServerWebSocket<unknown>>;
  pendingChallenges: Map<string, string>;
}

export interface ChatRepository {
  create(chatId: string, authKey: string): boolean;
  get(chatId: string): Chat | undefined;
  exists(chatId: string): boolean;
  delete(chatId: string): void;

  addConnection(chatId: string, connId: string, ws: ServerWebSocket<unknown>): void;
  removeConnection(chatId: string, connId: string): void;
  getConnections(chatId: string): Map<string, ServerWebSocket<unknown>> | undefined;

  setPendingChallenge(chatId: string, connId: string, nonce: string): void;
  getPendingChallenge(chatId: string, connId: string): string | undefined;
  deletePendingChallenge(chatId: string, connId: string): void;

  isEmpty(chatId: string): boolean;

  getAllChatConnections(): Map<string, Map<string, ServerWebSocket<unknown>>>;
}
