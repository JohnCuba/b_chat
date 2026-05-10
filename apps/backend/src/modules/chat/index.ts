import Elysia, { t } from 'elysia';
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import { cron } from '@elysia/cron';
import type {
  ServerMessage,
  ChallengeMessage,
  AuthenticatedMessage,
  ErrorMessage,
  IncomingChatMessage,
  ConnectionsMessage,
} from '@b_chat/protocol';
import { logger } from '../../lib/logger';
import { MemoryChatRepository } from './repository';

const encode = (msg: ServerMessage) => JSON.stringify(msg);

export const chatModule = () => {
  const chats = new MemoryChatRepository();

  return new Elysia({ prefix: '/api' })
    .decorate('chats', chats)
    .post('/chat', ({ body, set, chats }) => {
      const { chatId, authKey } = body;

      if (!chats.create(chatId, authKey)) {
        set.status = 409;
        return { ok: false, error: 'chat_exists' };
      }

      logger.debug({ chatId }, 'chat created');
      return { ok: true };
    }, {
      body: t.Object({
        chatId: t.String({ minLength: 64, maxLength: 64 }),
        authKey: t.String({ minLength: 64, maxLength: 64 }),
      })
    })
    .ws('/chat', {
      open(ws) {
        const chatId = ws.data.query.id;
        const chat = ws.data.chats.get(chatId);

        if (!chat) {
          ws.send(encode({ type: 'error', message: 'chat_not_found' } satisfies ErrorMessage));
          ws.close();
          return;
        }

        const nonce = randomBytes(32).toString('hex');
        ws.data.chats.setPendingChallenge(chatId, ws.id, nonce);
        ws.send(encode({ type: 'challenge', nonce } satisfies ChallengeMessage));
      },

      message(ws, body) {
        const chatId = ws.data.query.id;
        const chat = ws.data.chats.get(chatId);
        if (!chat) return;

        const pendingNonce = ws.data.chats.getPendingChallenge(chatId, ws.id);

        if (pendingNonce) {
          if (body.type !== 'challenge_response') {
            ws.send(encode({ type: 'error', message: 'expected_challenge_response' } satisfies ErrorMessage));
            return;
          }

          const expected = createHmac('sha256', Buffer.from(chat.authKey, 'hex'))
            .update(pendingNonce)
            .digest('hex');

          const proofBuf = Buffer.from(body.proof, 'hex');
          const expectedBuf = Buffer.from(expected, 'hex');

          if (proofBuf.length !== expectedBuf.length ||
              !timingSafeEqual(proofBuf, expectedBuf)) {
            ws.send(encode({ type: 'error', message: 'auth_failed' } satisfies ErrorMessage));
            ws.close();
            return;
          }

          ws.data.chats.deletePendingChallenge(chatId, ws.id);
          ws.data.chats.addConnection(chatId, ws.id, ws);
          ws.send(encode({ type: 'authenticated' } satisfies AuthenticatedMessage));
          const connections = ws.data.chats.getConnections(chatId);
          if (!connections) return;

          for (const [, conn] of connections) {
            conn.send(encode({ type: 'connections', count: connections.size } satisfies ConnectionsMessage));
          }

          return;
        }

        if (body.type === 'message') {
          const outgoing = encode({
            type: 'message',
            name: body.name,
            text: body.text,
            ts: Date.now(),
          } satisfies IncomingChatMessage);
          const connections = ws.data.chats.getConnections(chatId);
          if (connections) {
            for (const [id, conn] of connections) {
              if (id !== ws.id) conn.send(outgoing);
            }
          }
        }
      },

      close(ws) {
        const chatId = ws.data.query.id;
        ws.data.chats.removeConnection(chatId, ws.id);
        ws.data.chats.deletePendingChallenge(chatId, ws.id);

        if (ws.data.chats.isEmpty(chatId)) {
          ws.data.chats.delete(chatId);
          logger.debug({ chatId }, 'chat removed (empty)');
        }
      },

      query: t.Object({ id: t.String({ minLength: 64, maxLength: 64 }) }),

      body: t.Union([
        t.Object({
          type: t.Literal('challenge_response'),
          proof: t.String()
        }),
        t.Object({
          type: t.Literal('message'),
          name: t.String(),
          text: t.String(),
        }),
      ]),
    })
    .use(
      cron({
        name: 'connections',
        pattern: '*/10 * * * * *',
        run() {
          const allConnections = chats.getAllChatConnections();
          for (const [, connections] of allConnections) {
            const msg = encode({ type: 'connections', count: connections.size } satisfies ConnectionsMessage);
            for (const [, conn] of connections) {
              conn.send(msg);
            }
          }
        }
      })
    );
}
