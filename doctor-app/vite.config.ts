import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Aplikacja lekarza celowo bez service workera i bez trwałego zapisu (TASKS.md, sekcja 5).
// Serwer podaje ją pod /lekarz/ (server/src/app.ts); w dev relay i LLM idą przez proxy.
export default defineConfig({
  base: '/lekarz/',
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/relay': { target: 'ws://localhost:8787', ws: true },
      '/llm': 'http://localhost:8787',
    },
  },
  preview: { port: 4174 },
});
