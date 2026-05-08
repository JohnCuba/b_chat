import { createModel, useModel } from "@preact/signals";
import { ChatsRepo } from "../data/repos/chats.repo";

const ChatManagerModel = createModel(() => {
  const generateSeed = async () => {
    const bip39 = await import('bip39');
    const webBip39 = await import('web-bip39');

    return await webBip39.generateMnemonic(bip39.wordlists['english'], 128);
  }

  const getAll = async () => {
    return ChatsRepo.getAll()
  }

  const get = async (id: string) => {
    return await ChatsRepo.get(id)
  }

  const create = async (name: string, seed: string) => {
    const result = await ChatsRepo.create(seed);

    if (result.responce.error) {
      throw new Error('TODO')
    }

    return {
      name,
      chatId: result.chatId,
      seed,
    }
  }

  const save = async (id: string, name: string, seed: string) => {
    await ChatsRepo.save(id, name, seed)
  }

  return {
    generateSeed,
    getAll,
    get,
    create,
    save,
  }
})

export const useChatManager = () => useModel(ChatManagerModel)
