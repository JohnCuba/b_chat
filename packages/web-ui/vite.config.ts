import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), preact(), wasm()],
  resolve: {
    mainFields: ['module', 'main'],
  },
  build: {
    outDir: path.resolve(__dirname, '../../apps/backend_v2/public'),
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
