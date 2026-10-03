// Dołączane do service workera PWA (vite.config.ts → workbox.importScripts).
// Web Share Target: plik udostępniony z innej aplikacji (np. PDF z IKP) trafia do Cache Storage,
// a PWA otwiera import (`/import?shared=1`), który go stamtąd zabiera. Nic nie wychodzi z telefonu.
const SHARE_CACHE = 'ez-shared';
const SHARED_FILE = '/__shared-file';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'POST' || url.pathname !== '/share-target') return;
  event.respondWith(
    (async () => {
      try {
        const form = await event.request.formData();
        const file = form.get('file');
        if (file instanceof File) {
          const cache = await caches.open(SHARE_CACHE);
          await cache.put(
            SHARED_FILE,
            new Response(file, {
              headers: {
                'Content-Type': file.type || 'application/octet-stream',
                'X-File-Name': encodeURIComponent(file.name),
              },
            }),
          );
        }
      } catch (err) {
        // bez treści w logach – import pokaże „brak pliku”
      }
      return Response.redirect('/import?shared=1', 303);
    })(),
  );
});
