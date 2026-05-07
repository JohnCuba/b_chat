import { signal, createModel, useModel, type Signal } from '@preact/signals';
import type { ServerMessage, ErrorMessage } from '@b_chat/protocol';
import type { Treaty } from '@elysiajs/eden'
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
const connectionsCount = signal<number>(0);

const ChatModel = createModel<{
  messages: Signal<Message[]>;
  connected: Signal<boolean>;
  connectionsCount: Signal<number>;
  connect: (roomId: string) => void;
  send: (name: string, text: string) => void;
  disconnect: () => void;
}>(() => {
  const room = useRoom()
  const encryption = useEncryption();

  let ws: ReturnType<typeof backend.api.chat.subscribe> | null = null;

  const handleErrorMessage = async ({ data }: Treaty.OnMessage<ErrorMessage>) => {
    if (data.message === 'room_not_found') {
      const url = await room.create()
      connect(url.searchParams.get('id') as string)
    } else if (data.message === 'auth_failed') {
      alert('Неверная seed фраза');
      globalThis.location.replace('/start');
    }
  }

  const handleMessage = async (event: Treaty.OnMessage<ServerMessage>) => {
    switch (event.data.type) {
      case 'challenge': {
        const proof = await encryption.getProof(event.data.nonce);
        ws!.send({ type: 'challenge_response', proof });
        break;
      }
      case 'authenticated': {
        connected.value = true;
        break;
      }
      case 'error': {
        return handleErrorMessage(event as Treaty.OnMessage<ErrorMessage>)
      }
      case 'connections': {
        connectionsCount.value = event.data.count;
        break;
      }
      case 'message': {
        const text = await encryption.decryptMessage(event.data.text);
        messages.value = [...messages.value, {
          name: event.data.name,
          text,
          ts: event.data.ts,
          own: false,
        }];
        break;
      }
    }
  }

  const connect = (roomId: string) => {
    if (!encryption.seed.value) {
      globalThis.location.replace('/start');
      return;
    }

    ws = backend.api.chat.subscribe({ query: { id: roomId } });

    ws.on('message', handleMessage as (event: Treaty.OnMessage<unknown>) => void);
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
    connectionsCount,
    connect,
    send,
    disconnect,
  };
});

export const useChat = () => useModel(ChatModel);
