const CACHE = 'gps-data-v43';
const ASSETS = ['./index.html', './manifest.json', './sw.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // Cache each asset explicitly; avoid redirect responses
      await Promise.all(
        ASSETS.map(async (path) => {
          try {
            const res = await fetch(path, { redirect: 'follow', cache: 'no-cache' });
            if (res.ok && res.type === 'basic' && !res.redirected) {
              await cache.put(path, res.clone());
            } else if (res.ok && res.type === 'basic') {
              // Rebuild a clean non-redirected Response
              const body = await res.blob();
              const clean = new Response(body, {
                status: 200,
                statusText: 'OK',
                headers: res.headers
              });
              await cache.put(path, clean);
            }
          } catch (err) {
            console.warn('SW cache fail', path, err);
          }
        })
      );
      // Also cache root as index.html content
      try {
        const idx = await cache.match('./index.html');
        if (idx) await cache.put('./', idx.clone());
      } catch (e) {}
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isExternalApi(url) {
  const h = url.hostname;
  return (
    h.includes('bigdatacloud') ||
    h.includes('nominatim') ||
    h.includes('open-meteo') ||
    h.includes('openstreetmap') ||
    h.includes('indianapi') ||
    h.includes('mapbox') ||
    h.includes('google') ||
    h.includes('googleapis')
  );
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Let browser handle external APIs and non-GET
  if (isExternalApi(url)) return;
  if (url.origin !== self.location.origin) return;
  if (e.request.method !== 'GET') return;

  // Navigation requests: always serve clean index.html (never a redirected Response)
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      (async () => {
        try {
          const cached = await caches.match('./index.html');
          if (cached) {
            // Return a brand-new Response so Safari never sees redirected flag
            const body = await cached.blob();
            return new Response(body, {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache'
              }
            });
          }
          const net = await fetch('./index.html', { redirect: 'follow' });
          if (net.ok) {
            const body = await net.blob();
            const clean = new Response(body, {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
            const c = await caches.open(CACHE);
            await c.put('./index.html', clean.clone());
            return clean;
          }
          return net;
        } catch (err) {
          const cached = await caches.match('./index.html');
          if (cached) {
            const body = await cached.blob();
            return new Response(body, {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // Other same-origin assets
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) {
        // Serve clean copy if it was redirected
        if (cached.redirected) {
          return cached.blob().then((body) =>
            new Response(body, {
              status: 200,
              statusText: 'OK',
              headers: cached.headers
            })
          );
        }
        return cached;
      }
      return fetch(e.request, { redirect: 'follow' }).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(async (c) => {
            if (res.redirected) {
              const body = await clone.blob();
              await c.put(e.request, new Response(body, {
                status: 200,
                statusText: 'OK',
                headers: res.headers
              }));
            } else {
              await c.put(e.request, clone);
            }
          });
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
