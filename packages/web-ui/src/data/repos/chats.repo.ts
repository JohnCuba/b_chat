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

	static save = async (id: string, name: string, seed: string) => {
		const chat = new Chat(id, name, seed);

		await (await database).Chat.create(chat);
	};

	static getAll = async () => {
		return await (await database).Chat.list();
	};

	static get = async (id: string) => {
		return (await database).Chat.read(id);
	};
}
