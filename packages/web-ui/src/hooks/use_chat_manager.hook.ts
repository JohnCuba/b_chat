import { createModel, signal, useModel } from '@preact/signals';
import { ChatsRepo } from '../data/repos/chats.repo';
import type { Chat } from '../data/models/chat.model';

const list = signal<Chat[]>();

const ChatManagerModel = createModel(() => {
	const generateSeed = async () => {
		const bip39 = await import('bip39');
		const webBip39 = await import('web-bip39');

		return await webBip39.generateMnemonic(bip39.wordlists['english'], 128);
	};

	const fetch = async () => {
		list.value = await ChatsRepo.getAll();
		return list.value
	};

	const get = async (id: string) => {
		return await ChatsRepo.get(id);
	};

	const create = async (name: string, seed: string) => {
		const result = await ChatsRepo.create(seed);

		if (result.responce.error) {
			throw new Error('TODO');
		}

		await fetch()

		return {
			name,
			chatId: result.chatId,
			seed,
		};
	};

	const save = async (data: {
		id: string,
		name: string,
		title?: string,
		seed: string,
	}) => {
		await ChatsRepo.save(data);
	};

	const remove = async (id: string) => {
		await ChatsRepo.remove(id)
		await fetch()
	}

	return {
		list,
		generateSeed,
		fetch,
		get,
		create,
		save,
		remove,
	};
});

export const useChatManager = () => useModel(ChatManagerModel);
