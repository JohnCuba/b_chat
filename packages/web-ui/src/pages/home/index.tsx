import { useSignal } from '@preact/signals';
import { AppTitle } from '../../components/app_title';
import { useChatManager } from '../../hooks/use_chat_manager.hook';
import { useEffect } from 'preact/hooks';

import './style.css'

const HomePage = () => {
  const startLink = useSignal('/chat/new')
  const chatManager = useChatManager()

  useEffect(() => {
    chatManager.getAll().then((chatList) => {
      if (chatList.length) {
        startLink.value = '/chats'
      }
    })
  }, [])

  return (
    <main>
      <div class="hero bg-base-200 min-h-screen">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold">Привет это <AppTitle /></h1>
            <p class="py-6">
              Мгновенные чаты. Анонимно. Приватно.
            </p>
            <a
              class="btn btn-success"
              href={startLink}
            >
              начать
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HomePage;
