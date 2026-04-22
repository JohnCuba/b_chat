import { useUser } from '../../hooks/use_user.hook';
import type { InputEventHandler } from 'preact';
import { useRoom } from '../../hooks/use_room.hook';
import { useEncryption } from '../../hooks/use_encryption.hook';
import { AuthTabs } from '../../components/auth_tabs';
import './style.css'

const JoinChatPage = () => {
  const user = useUser()
  const encryption = useEncryption()
  const room = useRoom()

  const handleChangeName: InputEventHandler<HTMLInputElement> = (event) => {
    user.name.value = (event.target as HTMLInputElement).value;
  }

  const handleInputSeed: InputEventHandler<HTMLTextAreaElement> = (event) => {
    encryption.seed.value = (event.target as HTMLTextAreaElement).value;
  }

  const handleClickPaste = async () => {
    encryption.seed.value = await navigator.clipboard.readText();
  }

  const handleClickJoin = async () => {
    if (!user.name.value) return

    const target = await room.join()

    globalThis.location.replace(target)
  }

  return (
    <main>
      <div class="hero bg-base-200 min-h-screen">
        <div class="hero-content text-center">
          <div class="flex flex-col gap-4 min-w-xs">
            <AuthTabs active='join' />
            <input
              value={user.name}
              onInput={handleChangeName}
              name="name"
              type="text"
              placeholder="Your name"
              class="input input-lg"
            />
            <div class="flex flex-col gap-2">
              <textarea
                value={encryption.seed}
                onInput={handleInputSeed}
                class="textarea textarea-lg"
                name="seed-phrase"
                placeholder="Seed phrase"
                rows={4}
                minLength={1}
              />
              <button class="btn btn-info" onClick={handleClickPaste}>
                вставить
              </button>
            </div>
            <button
              class="btn btn-success"
              onClick={handleClickJoin}
            >
              войти
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default JoinChatPage;
