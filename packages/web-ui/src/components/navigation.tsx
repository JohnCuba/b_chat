import { AppTitle } from './app_title';
import { useAppContext } from '../hooks/use_app_context.hook';

export const Navigation = () => {
	const appContext = useAppContext()

	return (
		<div class="navbar bg-base-100 shadow-sm px-4">
			<span class="text-xl font-bold">
				<AppTitle />
			</span>
			<div class="flex-1" />
			{appContext.navRight}
		</div>
	);
};
