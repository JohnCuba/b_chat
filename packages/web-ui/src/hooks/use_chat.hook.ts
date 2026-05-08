import { signal, createModel, useModel, type Signal } from '@preact/signals';
import type { ServerMessage, ErrorMessage } from '@b_chat/protocol';
import { deriveAuthKey, solveChallenge, decrypt, encrypt } from '@b_chat/crypto';
import type { Treaty } from '@elysiajs/eden'
import { backend } from '../data/services/backend.service';
import type { Chat } from '../data/models/chat.model';
import { useChatManager } from './use_chat_manager.hook';

export type Message = {
  name: string;
  text: string;
  ts: number;
  own: boolean;
}

const chatInfo = signal<Chat>()
const messages = signal<Message[]>([])
const connected = signal(false)
const connectionsCount = signal<number>(0)

const ChatModel = createModel<{
  messages: Signal<Message[]>;
  connected: Signal<boolean>;
  connectionsCount: Signal<number>;
  connect: (chat: Chat) => void;
  send: (text: string) => void;
  disconnect: () => void;
}>(() => {
  const chatManager = useChatManager()
  let ws: ReturnType<typeof backend.api.chat.subscribe> | null = null;

  const handleErrorMessage = async ({ data }: Treaty.OnMessage<ErrorMessage>) => {
    if (data.message === 'chat_not_found') {
      if (!chatInfo.value) return
      disconnect()
      await chatManager.create(chatInfo.value?.name, chatInfo.value?.seed)
      connect(chatInfo.value)
    } else if (data.message === 'auth_failed') {
      alert('Неверная seed фраза');
      globalThis.location.replace('/');
    }
  }

  const handleMessage = async (event: Treaty.OnMessage<ServerMessage>) => {
    if (!chatInfo.value) return;

    switch (event.data.type) {
      case 'challenge': {
        const authKey = await deriveAuthKey(chatInfo.value.seed)
        const proof = await solveChallenge(authKey, event.data.nonce)

        ws!.send({ type: 'challenge_response', proof })

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
        const text = await decrypt(chatInfo.value.seed, event.data.text);

        messages.value.push({
          name: event.data.name,
          text,
          ts: event.data.ts,
          own: false,
        });

        break;
      }
    }
  }

  const connect = (chat: Chat) => {
    ws = backend.api.chat.subscribe({ query: { id: chat.id } })
    ws.on('message', handleMessage as (event: Treaty.OnMessage<unknown>) => void);
    chatInfo.value = chat
  };

  const send = async (text: string) => {
    if (!ws || !connected.value || !chatInfo.value) return;
    const encrypted = await encrypt(chatInfo.value.seed, text);

    ws.send({
      type: 'message',
      name: chatInfo.value.name,
      text: encrypted,
    });

    messages.value.push({
      name: chatInfo.value.name,
      text,
      ts: Date.now(),
      own: true,
    });
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
