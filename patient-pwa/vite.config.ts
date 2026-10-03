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
        description: 'Osobista dokumentacja zdrowotna przechowywana na urządzeniu',
        lang: 'pl',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f766e',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
        // Android / Chrome: PDF z IKP przez systemowe „Udostępnij” → import (public/sw-share.js).
        share_target: {
          action: '/share-target',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: { files: [{ name: 'file', accept: ['application/pdf', 'text/plain'] }] },
        },
      },
      workbox: {
        // Kliknięcie powiadomienia „Czas na lek” → /dzis (features/reminders); „Udostępnij” → import (A28).
        importScripts: ['/sw-notifications.js', '/sw-share.js'],
        // Te ścieżki obsługuje serwer (aplikacja lekarza, LLM, przekaźnik) – SW PWA nie może ich podmieniać.
        navigateFallbackDenylist: [
          /^\/lekarz/,
          /^\/demo\/lekarz/,
          /^\/llm/,
          /^\/relay/,
          /^\/health/,
        ],
        // Baza leków (~2 MB) poza precache: pobierana przy pierwszym wyszukiwaniu, potem z cache (offline).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname === '/data/drugs.json',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'drugs' },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Aplikacja lekarza (dev server na 5174) także pod /demo/lekarz, jak na serwerze produkcyjnym.
      '/lekarz': 'http://localhost:5174',
      '/demo/lekarz': {
        target: 'http://localhost:5174',
        rewrite: (path) => path.replace(/^\/demo\/lekarz\/?/, '/lekarz/'),
      },
      '/relay': { target: 'ws://localhost:8787', ws: true },
      '/llm': 'http://localhost:8787',
    },
  },
  preview: { port: 4173 },
});
