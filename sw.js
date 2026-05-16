/* ═══════════════════════════════════════════════════════
   జన సేవా కేంద్రం — Service Worker
   Caches app shell for offline use
   ═══════════════════════════════════════════════════════ */

const CACHE   = 'jseva-v1';
const ASSETS  = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap',
];

/* Install — cache shell */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

/* Activate — remove old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch — network first, fallback to cache */
self.addEventListener('fetch', e => {
  // Skip non-GET and Google Sheets API calls (always need fresh data)
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.includes('script.google.com') || url.includes('docs.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses for app shell assets
        if (res && res.status === 200 && ASSETS.some(a => url.includes(a.replace('./',''))) ) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
