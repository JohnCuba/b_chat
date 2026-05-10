import { useEffect } from 'preact/hooks';
import { AppLayout } from '../../components/app_layout';
import { useChatManager } from '../../hooks/use_chat_manager.hook';

import './style.css';

export const ChatsPage = () => {
	const chatManager = useChatManager();

	const handleClickRemove = (id: string) => () => {
		chatManager.remove(id)
	}

	useEffect(() => {
		chatManager.fetch()
	}, []);

	return (
		<AppLayout>
			<ul class="list bg-base-100 rounded-box shadow-md">
				{chatManager.list.value?.map((chat) => (
					<li class="list-row flex items-center justify-between">
						<a class="absolute w-full h-full top-0 left-0" href={`/chat/${chat.id}`}></a>
						<div>
							<span>{chat.name}</span>
						</div>
						<button
							class="relative btn btn-square btn-error btn-ghost"
							onClick={handleClickRemove(chat.id)}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="currentColor" d="M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8s8-3.582 8-8s-3.581-8-8-8m3.707 10.293a.999.999 0 1 1-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 0 1-1.414 0a1 1 0 0 1 0-1.414L10.586 12L8.293 9.707a.999.999 0 1 1 1.414-1.414L12 10.586l2.293-2.293a.999.999 0 1 1 1.414 1.414L13.414 12z" />
							</svg>
						</button>
					</li>
				))}
			</ul>
			<a href="/chat/new" class="fab" role="button">
				<div class="btn btn-circle btn-lg">
					<svg
						aria-label="New"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						class="size-6"
					>
						<path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
					</svg>
				</div>
			</a>
		</AppLayout>
	);
};

export default ChatsPage;
