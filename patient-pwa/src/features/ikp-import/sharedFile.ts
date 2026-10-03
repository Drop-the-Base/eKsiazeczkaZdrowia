// Odbiór pliku z Web Share Target (zapisuje go `public/sw-share.js`).
const SHARE_CACHE = 'ez-shared';
const SHARED_FILE = '/__shared-file';

/** Plik udostępniony z innej aplikacji – zabierany z cache tylko raz. */
export async function takeSharedFile(): Promise<File | undefined> {
  if (!('caches' in window)) return undefined;
  const cache = await caches.open(SHARE_CACHE);
  const res = await cache.match(SHARED_FILE);
  if (!res) return undefined;
  await cache.delete(SHARED_FILE);
  const name = decodeURIComponent(res.headers.get('X-File-Name') ?? 'dokument');
  const type = res.headers.get('Content-Type') ?? '';
  return new File([await res.blob()], name, { type });
}
