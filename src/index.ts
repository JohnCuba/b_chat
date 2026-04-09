import staticPlugin from '@elysiajs/static';
import { Elysia } from 'elysia';

const app = new Elysia()
  	.use(
  		await staticPlugin({
  			prefix: '/*',
   		})
   )
   .listen(3000);
