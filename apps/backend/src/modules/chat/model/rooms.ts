export interface Room {
  authKey: string;
}

export interface RoomEntry extends Room {
  connections: Map<string, any>;
  pendingChallenges: Map<string, string>;
}

export interface RoomRepository {
  create(roomId: string, authKey: string): boolean;
  get(roomId: string): Room | undefined;
  exists(roomId: string): boolean;
  delete(roomId: string): void;

  addConnection(roomId: string, connId: string, ws: any): void;
  removeConnection(roomId: string, connId: string): void;
  getConnections(roomId: string): Map<string, any> | undefined;

  setPendingChallenge(roomId: string, connId: string, nonce: string): void;
  getPendingChallenge(roomId: string, connId: string): string | undefined;
  deletePendingChallenge(roomId: string, connId: string): void;

  isEmpty(roomId: string): boolean;
}
