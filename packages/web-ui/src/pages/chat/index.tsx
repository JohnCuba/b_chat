import { useRef, useEffect } from 'preact/hooks';
import { useRoute } from 'preact-iso';
import { useUser } from '../../hooks/use_user.hook';
import { useChat } from '../../hooks/use_chat.hook';
import cn from 'classnames';
import './style.css'
import { AppLayout } from '../../components/app_layout';
import { ChatStatus } from '../../components/chat_status';

const ChatPage = () => {
  const route = useRoute();
  const user = useUser();
  const chat = useChat();

  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInputRef.current?.value) return;
    chat.send(user.name.value || 'Anonymous', messageInputRef.current.value);
    messageInputRef.current.value = '';
    scrollToBottom();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  useEffect(() => {
    scrollToBottom()
  }, [chat.messages.value])

  useEffect(() => {
    const roomId = route.query.id;
    if (!roomId) {
      globalThis.location.replace('/join');
      return;
    }

    chat.connect(roomId);
    return () => chat.disconnect();
  }, []);

  return (
    <AppLayout
      navRight={<ChatStatus />}
    >
      <div class="flex flex-col flex-1 overflow-y-auto p-4 gap-1">
        <div class="flex flex-1 flex-col justify-end">
          {chat.messages.value.map((msg) => (
            <div class={cn('chat', { 'chat-end': msg.own, 'chat-start': !msg.own })}>
              <div class="chat-header opacity-70 text-xs">
                {msg.name}
              </div>
              <div class={cn('chat-bubble text-left', { 'chat-bubble-success': msg.own })}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div class="join w-full">
        <input
          ref={messageInputRef}
          type="text"
          placeholder="Type your message"
          class="join-item input input-lg w-full"
          onKeyDown={handleKeyDown}
          disabled={!chat.connected.value}
        />
        <button
          class="join-item btn btn-neutral btn-lg"
          onClick={handleSendMessage}
          disabled={!chat.connected.value}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 17 5-5-5-5"/>
            <path d="M4 18v-2a4 4 0 0 1 4-4h12"/>
          </svg>
        </button>
      </div>
    </AppLayout>

  );
};

export default ChatPage;
