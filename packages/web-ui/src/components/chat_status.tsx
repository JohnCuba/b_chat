import cn from 'classnames';
import { useChat } from '../hooks/use_chat.hook';

export const ChatStatus = () => {
  const chat = useChat();

  return (
    <div class="flex items-center gap-4">
      <span>{chat.connectionsCount}</span>
      <span
        class={cn('status animate-ping', {
          'status-warning': !chat.connected.value,
          'status-success': chat.connected.value,
        })}
      />
    </div>
  )
}