import { useSignal } from '@preact/signals';
import { AppLayout } from '../../components/app_layout';
import { useChatManager } from '../../hooks/use_chat_manager.hook';

import './style.css'
import type { Chat } from '../../data/models/chat.model';
import { useEffect } from 'preact/hooks';

export const ChatsPage = () => {
  const chatList = useSignal<Chat[]>()
  const chatManager = useChatManager()

  useEffect(() => {
    chatManager.getAll().then((data) => {
      chatList.value = data
    })
  }, [])

  return (
    <AppLayout>
      <ul class="list bg-base-100 rounded-box shadow-md">
        {chatList.value?.map((chat) => (
          <li class="list-row relative">
            <a class="absolute w-full h-full inset-0" href={`/chat/${chat.id}`}></a>
            <span>{chat.name}</span>
          </li>
        ))}
      </ul>
      <a href="/chat/new" class="fab" role="button">
        <div class="btn btn-circle btn-lg">
          <svg
            aria-label="New"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="size-6"
          >
            <path
              d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"
            />
          </svg>
        </div>
      </a>
    </AppLayout>
  )
}

export default ChatsPage
