import { useUser } from '../hooks/use_user.hook';
import type { InputEventHandler } from 'preact';
import { useEncryption } from '../hooks/use_encryption.hook';
import { useRoom } from '../hooks/use_room.hook';
import { AuthTabs } from '../components/auth_tabs';

const CreateChatPage = () => {
  const user = useUser()
  const encryption = useEncryption()
  const room = useRoom()

  const handleChangeName: InputEventHandler<HTMLInputElement> = (event) => {
    user.name.value = (event.target as HTMLInputElement).value
  }

  const handleInputSeed: InputEventHandler<HTMLTextAreaElement> = (event) => {
    encryption.seed.value = (event.target as HTMLTextAreaElement).value
  }

  const handleClickGenerate = async () => {
    await encryption.generateSeed()
  }

  const handleClickCreate = async () => {
    if (!user.name.value) return

    const roomUrl = await room.create();

    globalThis.location.replace(roomUrl);
  }

  return (
    <main>
      <div class="hero bg-base-200 min-h-screen">
        <div class="hero-content text-center">
          <div class="flex flex-col gap-4 min-w-xs">
            <AuthTabs active='create' />
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
              />
              <button class="btn btn-warning" onClick={handleClickGenerate}>
                сгенерировать
              </button>
            </div>
            <button
              class="btn btn-success"
              onClick={handleClickCreate}
            >
              создать
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CreateChatPage;