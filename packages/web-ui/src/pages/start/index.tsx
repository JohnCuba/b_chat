import { useUser } from '../../hooks/use_user.hook';
import { useForm, type SubmitHandler } from 'react-hook-form';
import cn from 'classnames'
import { useEncryption } from '../../hooks/use_encryption.hook';
import { useRoom } from '../../hooks/use_room.hook';
import './style.css'

type Inputs = {
  name: string
  seed: string
}

const StartPage = () => {
  const {
    getValues,
    setValue,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<Inputs>()
  const user = useUser()
  const encryption = useEncryption()
  const room = useRoom()

  const handleClickGenerate = async () => {
    setValue('seed', await encryption.generateSeed());
  }

  const handleClickCopy = async () => {
    await navigator.clipboard.writeText(getValues('seed'));
  }

  const handleClickPaste = async () => {
    setValue('seed', await navigator.clipboard.readText());
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    user.name.value = data.name;
    encryption.seed.value = data.seed;

    const roomUrl = await room.create();

    globalThis.location.replace(roomUrl);
  }

  return (
    <main>
      <div class="hero bg-base-200 min-h-screen">
        <div class="hero-content text-center">
          <form
            class="flex flex-col min-w-xs"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div class="fieldset">
              <legend class="fieldset-legend">Имя</legend>
              <input
                type="text"
                placeholder="Кто-то"
                class="input"
                defaultValue={user.name.value}
                {...register('name')}
              />
              <p class="label">Можешь оставить это поле пустым</p>
            </div>
            <div class="flex flex-col gap-2">
              <div class="fieldset">
                <legend class="fieldset-legend">Фраза шифрования</legend>
                <textarea
                  class={cn("textarea", { 'textarea-error': errors.seed })}
                  placeholder="Любой набор слов"
                  rows={4}
                  minLength={1}
                  defaultValue={encryption.seed.value}
                  {...register('seed', { required: true })}
                />
                <p class="label">
                  Это кодавая фраза, она шифрует все.
                </p>
              </div>
              <button
                type="button"
                class="btn btn-soft btn-warning"
                onClick={handleClickGenerate}
              >
                сгенерировать
              </button>
              <div class="join">
                <button
                  type="button"
                  class="join-item flex-1 btn btn-soft btn-info"
                  onClick={handleClickPaste}
                >
                  вставить
                </button>
                <button
                  type="button"
                  class="join-item flex-1 btn btn-soft btn-secondary"
                  onClick={handleClickCopy}
                >
                  копировать
                </button>
              </div>
            </div>
            <button
              type="submit"
              class="btn btn-success mt-4"
            >
              начать
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default StartPage;
