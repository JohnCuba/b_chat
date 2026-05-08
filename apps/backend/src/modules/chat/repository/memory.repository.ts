import type { ServerWebSocket } from "elysia/ws/bun";
import type { Chat, ChatEntry, ChatRepository } from '../model/chat';

export class MemoryChatRepository implements ChatRepository {
  private chats = new Map<string, ChatEntry>();

  create(chatId: string, authKey: string): boolean {
    if (this.chats.has(chatId)) return false;

    this.chats.set(chatId, {
      authKey,
      connections: new Map(),
      pendingChallenges: new Map(),
    });
    return true;
  }

  get(chatId: string): Chat | undefined {
    const entry = this.chats.get(chatId);
    if (!entry) return undefined;
    return { authKey: entry.authKey };
  }

  exists(chatId: string): boolean {
    return this.chats.has(chatId);
  }

  delete(chatId: string): void {
    this.chats.delete(chatId);
  }

  addConnection(chatId: string, connId: string, ws: ServerWebSocket<unknown>): void {
    this.chats.get(chatId)?.connections.set(connId, ws);
  }

  removeConnection(chatId: string, connId: string): void {
    this.chats.get(chatId)?.connections.delete(connId);
  }

  getConnections(chatId: string): Map<string, ServerWebSocket<unknown>> | undefined {
    return this.chats.get(chatId)?.connections;
  }

  setPendingChallenge(chatId: string, connId: string, nonce: string): void {
    this.chats.get(chatId)?.pendingChallenges.set(connId, nonce);
  }

  getPendingChallenge(chatId: string, connId: string): string | undefined {
    return this.chats.get(chatId)?.pendingChallenges.get(connId);
  }

  deletePendingChallenge(chatId: string, connId: string): void {
    this.chats.get(chatId)?.pendingChallenges.delete(connId);
  }

  isEmpty(chatId: string): boolean {
    const entry = this.chats.get(chatId);
    if (!entry) return true;
    return entry.connections.size === 0 && entry.pendingChallenges.size === 0;
  }

  getAllChatConnections(): Map<string, Map<string, ServerWebSocket<unknown>>> {
    const result = new Map<string, Map<string, ServerWebSocket<unknown>>>();
    for (const [chatId, entry] of this.chats) {
      if (entry.connections.size > 0) {
        result.set(chatId, entry.connections);
      }
    }
    return result;
  }
}
