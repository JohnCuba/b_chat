import { defineConfig, type Plugin } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { brotliCompressSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

function brotli(): Plugin {
  return {
    name: 'vite-plugin-brotli',
    apply: 'build',
    writeBundle(_, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (/\.(js|css|html|svg|json)$/.test(fileName)) {
          const filePath = path.resolve(__dirname, '../../apps/backend/public', fileName)
          const compressed = brotliCompressSync(
            require('fs').readFileSync(filePath),
          )
          writeFileSync(filePath + '.br', compressed)
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), preact(), brotli()],
  resolve: {
    mainFields: ['module', 'main'],
  },
  build: {
    outDir: path.resolve(__dirname, '../../apps/backend/public'),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})
