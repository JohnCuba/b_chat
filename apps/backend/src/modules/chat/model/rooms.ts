import type { ServerWebSocket } from "elysia/ws/bun";

export interface Room {
  authKey: string;
}

export interface RoomEntry extends Room {
  connections: Map<string, ServerWebSocket<unknown>>;
  pendingChallenges: Map<string, string>;
}

export interface RoomRepository {
  create(roomId: string, authKey: string): boolean;
  get(roomId: string): Room | undefined;
  exists(roomId: string): boolean;
  delete(roomId: string): void;

  addConnection(roomId: string, connId: string, ws: ServerWebSocket<unknown>): void;
  removeConnection(roomId: string, connId: string): void;
  getConnections(roomId: string): Map<string, ServerWebSocket<unknown>> | undefined;

  setPendingChallenge(roomId: string, connId: string, nonce: string): void;
  getPendingChallenge(roomId: string, connId: string): string | undefined;
  deletePendingChallenge(roomId: string, connId: string): void;

  isEmpty(roomId: string): boolean;

  getAllRoomConnections(): Map<string, Map<string, ServerWebSocket<unknown>>>;
}
