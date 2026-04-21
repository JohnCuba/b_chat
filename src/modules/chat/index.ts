import Elysia, { t } from 'elysia';
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import { logger } from '../../lib/logger';
import { MemoryRoomRepository } from './repository';

const rooms = new MemoryRoomRepository();

export const chatModule = () =>
  new Elysia({ prefix: '/api' })
    .post('/room', ({ body, set }) => {
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
        const room = rooms.get(roomId);

        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'room_not_found' }));
          ws.close();
          return;
        }

        const nonce = randomBytes(32).toString('hex');
        rooms.setPendingChallenge(roomId, ws.id, nonce);
        ws.send(JSON.stringify({ type: 'challenge', nonce }));
      },

      message(ws, body: any) {
        const roomId = ws.data.query.id;
        const room = rooms.get(roomId);
        if (!room) return;

        const pendingNonce = rooms.getPendingChallenge(roomId, ws.id);

        if (pendingNonce) {
          if (body.type !== 'challenge_response' || !body.proof) {
            ws.send(JSON.stringify({ type: 'error', message: 'expected_challenge_response' }));
            return;
          }

          const expected = createHmac('sha256', Buffer.from(room.authKey, 'hex'))
            .update(pendingNonce)
            .digest('hex');

          const proofBuf = Buffer.from(body.proof, 'hex');
          const expectedBuf = Buffer.from(expected, 'hex');

          if (proofBuf.length !== expectedBuf.length ||
              !timingSafeEqual(proofBuf, expectedBuf)) {
            ws.send(JSON.stringify({ type: 'error', message: 'auth_failed' }));
            ws.close();
            return;
          }

          rooms.deletePendingChallenge(roomId, ws.id);
          rooms.addConnection(roomId, ws.id, ws);
          ws.send(JSON.stringify({ type: 'authenticated' }));
          return;
        }

        if (body.type === 'message' && body.text && body.name) {
          const outgoing = JSON.stringify({
            type: 'message',
            name: body.name,
            text: body.text,
            ts: Date.now(),
          });
          const connections = rooms.getConnections(roomId);
          if (connections) {
            for (const [id, conn] of connections) {
              if (id !== ws.id) conn.send(outgoing);
            }
          }
        }
      },

      close(ws) {
        const roomId = ws.data.query.id;
        rooms.removeConnection(roomId, ws.id);
        rooms.deletePendingChallenge(roomId, ws.id);

        if (rooms.isEmpty(roomId)) {
          rooms.delete(roomId);
          logger.debug({ roomId }, 'room removed (empty)');
        }
      },
    });
