import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Aplikacja lekarza celowo bez service workera i bez trwałego zapisu (TASKS.md, sekcja 5).
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  preview: { port: 4174 },
});
