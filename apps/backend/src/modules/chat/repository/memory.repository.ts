import type { Room, RoomRepository } from '../model/rooms';

interface RoomEntry extends Room {
  connections: Map<string, any>;
  pendingChallenges: Map<string, string>;
}

export class MemoryRoomRepository implements RoomRepository {
  private rooms = new Map<string, RoomEntry>();

  create(roomId: string, authKey: string): boolean {
    if (this.rooms.has(roomId)) return false;

    this.rooms.set(roomId, {
      authKey,
      connections: new Map(),
      pendingChallenges: new Map(),
    });
    return true;
  }

  get(roomId: string): Room | undefined {
    const entry = this.rooms.get(roomId);
    if (!entry) return undefined;
    return { authKey: entry.authKey };
  }

  exists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  delete(roomId: string): void {
    this.rooms.delete(roomId);
  }

  addConnection(roomId: string, connId: string, ws: any): void {
    this.rooms.get(roomId)?.connections.set(connId, ws);
  }

  removeConnection(roomId: string, connId: string): void {
    this.rooms.get(roomId)?.connections.delete(connId);
  }

  getConnections(roomId: string): Map<string, any> | undefined {
    return this.rooms.get(roomId)?.connections;
  }

  setPendingChallenge(roomId: string, connId: string, nonce: string): void {
    this.rooms.get(roomId)?.pendingChallenges.set(connId, nonce);
  }

  getPendingChallenge(roomId: string, connId: string): string | undefined {
    return this.rooms.get(roomId)?.pendingChallenges.get(connId);
  }

  deletePendingChallenge(roomId: string, connId: string): void {
    this.rooms.get(roomId)?.pendingChallenges.delete(connId);
  }

  isEmpty(roomId: string): boolean {
    const entry = this.rooms.get(roomId);
    if (!entry) return true;
    return entry.connections.size === 0 && entry.pendingChallenges.size === 0;
  }
}
