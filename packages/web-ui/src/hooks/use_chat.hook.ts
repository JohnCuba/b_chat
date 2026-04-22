import { signal, createModel, useModel, type Signal } from '@preact/signals';
import { useEncryption } from './use_encryption.hook';
import { backend } from '../services/backend';
import { useRoom } from './use_room.hook';

export interface Message {
  name: string;
  text: string;
  ts: number;
  own: boolean;
}

const messages = signal<Message[]>([]);
const connected = signal(false);

const ChatModel = createModel<{
  messages: Signal<Message[]>;
  connected: Signal<boolean>;
  connect: (roomId: string) => void;
  send: (name: string, text: string) => void;
  disconnect: () => void;
}>(() => {
  const room = useRoom()
  const encryption = useEncryption();

  let ws: ReturnType<typeof backend.api.chat.subscribe> | null = null;

  const connect = (roomId: string) => {
    if (!encryption.seed.value) {
      globalThis.location.replace('/join');
      return;
    }

    ws = backend.api.chat.subscribe({ query: { id: roomId } });

    ws.on('message', async (event) => {
      const data = event.data as any;

      if (data.type === 'challenge') {
        const proof = await encryption.getProof(data.nonce);
        ws!.send({ type: 'challenge_response', proof });
      }

      if (data.type === 'authenticated') {
        connected.value = true;
      }

      if (data.type === 'message') {
        const text = await encryption.decryptMessage(data.text);
        messages.value = [...messages.value, {
          name: data.name,
          text,
          ts: data.ts,
          own: false,
        }];
      }

      if (data.type === 'error') {
        if (data.message === 'room_not_found') {
          if (roomId !== await encryption.getRoomId()) {
            alert('Неверная seed фраза');
            globalThis.location.replace('/join');
          }

          const url = await room.create()
          connect(url.searchParams.get('id'))
        } else if (data.message === 'auth_failed') {
          alert('Неверная seed фраза');
          globalThis.location.replace('/join');
        }
      }
    });
  };

  const send = async (name: string, text: string) => {
    if (!ws || !connected.value) return;
    const encrypted = await encryption.encryptMessage(text);
    ws.send({ type: 'message', name, text: encrypted });
    messages.value = [...messages.value, { name, text, ts: Date.now(), own: true }];
  };

  const disconnect = () => {
    ws?.close();
    ws = null;
    connected.value = false;
    messages.value = [];
  };

  return {
    messages,
    connected,
    connect,
    send,
    disconnect,
  };
});

export const useChat = () => useModel(ChatModel);
