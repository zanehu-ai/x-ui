import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [{ find: /^@zanehu-ai\/x-ui$/, replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)) }],
    dedupe: ['react', 'react-dom', '@tanstack/react-query', '@tanstack/query-core'],
  },
  server: { strictPort: true, fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] } },
});
