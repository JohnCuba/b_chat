import { deriveChatId, deriveAuthKey } from '@b_chat/crypto';
import { Chat } from '../models/chat.model';
import { database } from '../services/database.service';
import { backend } from '../services/backend.service';

export class ChatsRepo {
	static create = async (seed: string) => {
		const chatId = await deriveChatId(seed);
		const authKey = await deriveAuthKey(seed);

		const responce = await backend.api.chat.post({ chatId, authKey });

		return {
			responce,
			chatId,
			authKey,
		};
	};

	static save = async (data: {
		id: string,
		name: string,
		title?: string,
		seed: string,
	}) => {
		const chat = new Chat(
			data.id,
			data.name,
			data.title || new Date().toLocaleString(),
			data.seed,
		);

		await (await database).Chat.create(chat);
	};

	static getAll = async (): Promise<Chat[]> => {
		return await (await database).Chat.list();
	};

	static get = async (id: string): Promise<Chat> => {
		return await (await database).Chat.read(id);
	};

	static remove = async (id: string) => {
		await (await database).Chat.delete(id)
	}
}
