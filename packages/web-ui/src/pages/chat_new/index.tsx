import { useLocation } from 'preact-iso';
import { useForm, type SubmitHandler } from 'react-hook-form';
import cn from 'classnames';
import { useChatManager } from '../../hooks/use_chat_manager.hook';
import { AppLayout } from '../../components/app_layout';
import './style.css';

type Inputs = {
	name: string;
	seed: string;
};

const NewChatPage = () => {
	const {
		getValues,
		setValue,
		handleSubmit,
		register,
		formState: { errors },
	} = useForm<Inputs>();
	const chatManager = useChatManager();
	const location = useLocation();

	const handleClickGenerate = async () => {
		setValue('seed', await chatManager.generateSeed());
	};

	const handleClickCopy = async () => {
		await navigator.clipboard.writeText(getValues('seed'));
	};

	const handleClickPaste = async () => {
		setValue('seed', await navigator.clipboard.readText());
	};

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const result = await chatManager.create(data.name, data.seed);
		await chatManager.save({
			id: result.chatId,
			name: result.name,
			seed: result.seed,
		});

		const target = new URL(`/chat/${result.chatId}`, globalThis.location.origin);

		location.route(target.toString());
	};

	return (
		<AppLayout>
			<form class="flex flex-1 justify-center flex-col min-w-xs" onSubmit={handleSubmit(onSubmit)}>
				<div class="fieldset">
					<legend class="fieldset-legend">Имя</legend>
					<input type="text" placeholder="Кто-то" class="input w-full" {...register('name')} />
					<p class="label">Можешь оставить это поле пустым</p>
				</div>
				<div class="flex flex-col gap-2">
					<div class="fieldset">
						<legend class="fieldset-legend">Фраза шифрования</legend>
						<textarea
							class={cn('textarea w-full', { 'textarea-error': errors.seed })}
							placeholder="Любой набор слов"
							rows={4}
							minLength={1}
							{...register('seed', { required: true })}
						/>
						<p class="label">Это кодавая фраза, она шифрует все.</p>
					</div>
					<button type="button" class="btn btn-soft btn-warning" onClick={handleClickGenerate}>
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
				<button type="submit" class="btn btn-success mt-4">
					начать
				</button>
			</form>
		</AppLayout>
	);
};

export default NewChatPage;
