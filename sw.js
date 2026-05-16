/* ═══════════════════════════════════════════════════════
   జన సేవా కేంద్రం — Service Worker v2
   ═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'jseva-cache-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* ── Install: cache static shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clean old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: network first → cache fallback ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Always go network-first for Google Sheets API (live data)
  if (url.includes('script.google.com') ||
      url.includes('docs.google.com') ||
      url.includes('sheets.googleapis.com')) {
    return; // let browser handle it normally
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses for our static assets
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache
        return caches.match(event.request)
          .then(cached => cached || caches.match('./index.html'));
      })
  );
});
