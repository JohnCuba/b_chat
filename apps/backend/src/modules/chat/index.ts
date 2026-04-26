import Elysia, { t } from 'elysia';
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import type { ServerMessage, ClientMessage, ChallengeMessage, AuthenticatedMessage, ErrorMessage, IncomingChatMessage, ConnectionsMessage } from '@b_chat/protocol';
import { logger } from '../../lib/logger';
import { MemoryRoomRepository } from './repository';
import { cron } from '@elysia/cron';

const encode = (msg: ServerMessage) => JSON.stringify(msg);

export const chatModule = () => {
  const rooms = new MemoryRoomRepository();

  return new Elysia({ prefix: '/api' })
    .decorate('rooms', rooms)
    .post('/room', ({ body, set, rooms }) => {
      const { roomId, authKey } = body;

      if (!rooms.create(roomId, authKey)) {
        set.status = 409;
        return { ok: false, error: 'room_exists' };
      }

      logger.debug({ roomId }, 'room created');
      return { ok: true };
    }, {
      body: t.Object({
        roomId: t.String({ minLength: 64, maxLength: 64 }),
        authKey: t.String({ minLength: 64, maxLength: 64 }),
      })
    })
    .ws('/chat', {
      query: t.Object({ id: t.String({ minLength: 64, maxLength: 64 }) }),

      open(ws) {
        const roomId = ws.data.query.id;
        const room = ws.data.rooms.get(roomId);

        if (!room) {
          ws.send(encode({ type: 'error', message: 'room_not_found' } satisfies ErrorMessage));
          ws.close();
          return;
        }

        const nonce = randomBytes(32).toString('hex');
        ws.data.rooms.setPendingChallenge(roomId, ws.id, nonce);
        ws.send(encode({ type: 'challenge', nonce } satisfies ChallengeMessage));
      },

      message(ws, body: ClientMessage) {
        const roomId = ws.data.query.id;
        const room = ws.data.rooms.get(roomId);
        if (!room) return;

        const pendingNonce = ws.data.rooms.getPendingChallenge(roomId, ws.id);

        if (pendingNonce) {
          if (body.type !== 'challenge_response') {
            ws.send(encode({ type: 'error', message: 'expected_challenge_response' } satisfies ErrorMessage));
            return;
          }

          const expected = createHmac('sha256', Buffer.from(room.authKey, 'hex'))
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

          ws.data.rooms.deletePendingChallenge(roomId, ws.id);
          ws.data.rooms.addConnection(roomId, ws.id, ws);
          ws.send(encode({ type: 'authenticated' } satisfies AuthenticatedMessage));
          const connections = ws.data.rooms.getConnections(roomId);
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
          const connections = ws.data.rooms.getConnections(roomId);
          if (connections) {
            for (const [id, conn] of connections) {
              if (id !== ws.id) conn.send(outgoing);
            }
          }
        }
      },

      close(ws) {
        const roomId = ws.data.query.id;
        ws.data.rooms.removeConnection(roomId, ws.id);
        ws.data.rooms.deletePendingChallenge(roomId, ws.id);

        if (ws.data.rooms.isEmpty(roomId)) {
          ws.data.rooms.delete(roomId);
          logger.debug({ roomId }, 'room removed (empty)');
        }
      },
    })
    .use(
      cron({
        name: 'connections',
        pattern: '*/10 * * * * *',
        run() {
          const allConnections = rooms.getAllRoomConnections();
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
