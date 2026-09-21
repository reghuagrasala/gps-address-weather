const CACHE = 'gps-data-v41';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Never cache external APIs
  if (
    url.hostname.includes('bigdatacloud') ||
    url.hostname.includes('nominatim') ||
    url.hostname.includes('open-meteo') ||
    url.hostname.includes('openstreetmap') ||
    url.hostname.includes('indianapi') ||
    url.hostname.includes('mapbox')
  ) {
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => {
          if (e.request.mode === 'navigate' || e.request.destination === 'document') {
            return caches.match('./index.html');
          }
          return caches.match(e.request);
        });
    })
  );
});
