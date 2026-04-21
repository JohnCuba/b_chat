import Elysia from "elysia";
import fs from 'fs/promises';
import { join, dirname } from 'path'

export const viewModule = () =>
  new Elysia()
    .get('/*', async ({path}) => {
      const filePath = join('./public/', path)

      if(path === dirname(path) || !await fs.exists(filePath)) {
        return Bun.file('./public/index.html')
      }

      return Bun.file(filePath)
    });