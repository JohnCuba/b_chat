import type { ComponentChildren } from 'preact';
import { Navigation } from './navigation';

type Props = {
	children?: ComponentChildren;
	navRight?: ComponentChildren;
};

export const AppLayout = (props: Props) => {
	return (
		<main class="hero bg-base-200 min-h-screen">
			<div class="hero-content text-center p-0 w-full">
				<div class="min-w-xs w-full max-w-lg h-screen flex flex-col">
					<Navigation>{props.navRight}</Navigation>
					{props.children}
				</div>
			</div>
		</main>
	);
};
