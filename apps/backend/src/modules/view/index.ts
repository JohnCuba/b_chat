import Elysia from "elysia";
import fs from 'fs/promises';
import { join, dirname, extname } from 'path'

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const SPA_FALLBACK = './public/index.html'

const serveBrotli = (filePath: string, contentType: string) => {
  return new Response(Bun.file(filePath + '.br'), {
    headers: {
      'Content-Encoding': 'br',
      'Content-Type': contentType,
    },
  });
}

export const viewModule = () =>
  new Elysia()
    .get('/*', async ({path, request}) => {
      let filePath = join('./public/', path)

      if (path === dirname(path) || !await fs.exists(filePath)) {
        filePath = SPA_FALLBACK
      }

      const ext = extname(filePath);
      const contentType = CONTENT_TYPES[ext];
      const acceptsBr = request.headers.get('accept-encoding')?.includes('br');

      if (contentType && acceptsBr && await fs.exists(filePath + '.br')) {
        return serveBrotli(filePath, contentType);
      }

      return Bun.file(filePath)
    });