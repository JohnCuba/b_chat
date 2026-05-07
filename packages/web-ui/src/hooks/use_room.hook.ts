import { createModel, useModel } from "@preact/signals";
import { backend } from "../services/backend";
import { useEncryption } from "./use_encryption.hook";

const RoomModel = createModel(() => {
  const encryption = useEncryption()

  const create = async (): Promise<URL> => {
    const roomId = await encryption.getRoomId();
    const authKey = await encryption.getAuthKey();

    const data = await backend.api.room.post({ roomId, authKey });

    if (data.error?.value && data.error.value.message === 'room_exists') {
      throw new Error('Комната с такой фразой уже существует');
    }

    const target = new URL('/chat', globalThis.location.origin);
    target.searchParams.set('id', roomId);

    return target
  }

  const join = async (): Promise<URL> => {
    const roomId = await encryption.getRoomId();

    const target = new URL('/chat', globalThis.location.origin);
    target.searchParams.set('id', roomId);

    return target;
  }

  return {
    create,
    join,
  }
})

export const useRoom = () => useModel(RoomModel)
