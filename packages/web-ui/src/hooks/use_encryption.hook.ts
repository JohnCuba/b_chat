import { createModel, effect, signal, useModel } from "@preact/signals";
import { solveChallenge, encrypt, decrypt, deriveRoomId, deriveAuthKey, genSeed } from '@b_chat/crypto';

type Seed = string | undefined;

const seed = signal<Seed>(sessionStorage.getItem('seed') || undefined)

const EncryptionModel = createModel(() => {
  const getRoomId = async () => {
    if (!seed.value) {
      throw new Error('seed фраза')
    }

    return await deriveRoomId(seed.value)
  }

  const getAuthKey = async () => {
    if (!seed.value) {
      throw new Error('seed фраза')
    }

    return await deriveAuthKey(seed.value)
  }

  const encryptMessage = async (text: string): Promise<string> => {
    if (!seed.value) {
      throw new Error('seed фраза')
    }

    return await encrypt(seed.value, text)
  }

  const decryptMessage = async (text: string): Promise<string> => {
    if (!seed.value) {
      throw new Error('seed фраза')
    }

    return await decrypt(seed.value, text)
  }

  const getProof = async (nonce: string) => {
    const authKey = await getAuthKey()
    return await solveChallenge(authKey, nonce)
  }

  effect(() => {
    if (seed.value) {
      sessionStorage.setItem('seed', seed.value);
    } else {
      sessionStorage.removeItem('seed')
    }
  })

  return {
    seed,
    getRoomId,
    getAuthKey,
    generateSeed: genSeed,
    getProof,
    encryptMessage,
    decryptMessage,
  }
})

export const useEncryption = () => useModel(EncryptionModel)