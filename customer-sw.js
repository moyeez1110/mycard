// Minimal service worker — just enough for "Add to Home Screen" / PWA
// install criteria. Network-first so shop content never goes stale.
const CACHE_NAME = 'customer-app-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
