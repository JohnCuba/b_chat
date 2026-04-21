import { Elysia } from 'elysia';
import { viewModule } from './modules/view';
import { chatModule } from './modules/chat';
import { logger } from './lib/logger';

logger.debug('starting server')

const app = new Elysia()
  .use(chatModule())
  .use(viewModule())
  .listen(process.env.PORT || 3000);

logger.debug('server started at port %s', app.server?.port)

export type App = typeof app;