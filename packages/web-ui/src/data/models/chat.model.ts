import { DataClass, KeyPath } from 'idb-ts';

@DataClass({ version: 1 })
export class Chat {
	@KeyPath()
	id!: string;

	seed!: string;

	name!: string;
	title!: string;

	constructor(id: string, name: string, title: string, seed: string) {
		this.id = id;
		this.name = name;
		this.title = title;
		this.seed = seed;
	}
}
