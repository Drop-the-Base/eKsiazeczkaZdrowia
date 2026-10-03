import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'eKsiazeczkaZdrowia',
        short_name: 'eKsiazeczka',
        description: 'Prywatna oś czasu zdrowia na telefonie',
        lang: 'pl',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f766e',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        // Te ścieżki obsługuje serwer (aplikacja lekarza, LLM, przekaźnik) – SW PWA nie może ich podmieniać.
        navigateFallbackDenylist: [/^\/lekarz/, /^\/llm/, /^\/relay/, /^\/health/],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/relay': { target: 'ws://localhost:8787', ws: true },
      '/llm': 'http://localhost:8787',
    },
  },
  preview: { port: 4173 },
});
