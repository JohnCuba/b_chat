import staticPlugin from "@elysiajs/static";
import Elysia from "elysia";

export const viewModule = async () =>
  new Elysia()
    .use(
      await staticPlugin({
        prefix: '/*',
        assets: 'public'
      })
    );