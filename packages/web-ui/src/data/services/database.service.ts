import { Database } from 'idb-ts';
import { Chat } from '../models/chat.model';

export const database = Database.build('b_chat', [Chat]);
