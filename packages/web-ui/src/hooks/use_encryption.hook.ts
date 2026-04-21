import { createModel, effect, signal, useModel } from "@preact/signals";
import { deriveRoomId, deriveAuthKey, solveChallenge, encrypt, decrypt } from '@b_chat/crypto';

type Seed = string | undefined;

const seed = signal<Seed>(sessionStorage.getItem('seed') || undefined)

const EncryptionModel = createModel(() => {
  const generateSeed = async () => {
    // TODO: Dynamic import dosen't work in build but, leave it for future
    const bip39 = await import('bip39');
    const webBip39 = await import('web-bip39');

    seed.value = await webBip39.generateMnemonic(bip39.wordlists['english'], 128);
  }

  const getRoomId = async () => {
    if (!seed.value) {
      throw new Error('seed фраза')
    }
    console.log('getRoomId', seed.value)

    return await deriveRoomId(seed.value)
  }

  const getAuthKey = async () => {
    if (!seed.value) {
      throw new Error('seed фраза')
    }
    console.log('getAuthKey', seed.value)

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
    generateSeed,
    getProof,
    encryptMessage,
    decryptMessage,
  }
})

export const useEncryption = () => useModel(EncryptionModel)