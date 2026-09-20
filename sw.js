const CACHE='gps-geocoder-v7';
const ASSETS=['./','./index.html','./manifest.json','./sw.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.origin!==location.origin && !url.hostname.includes('esm.sh') && !url.hostname.includes('nominatim') && !url.hostname.includes('open-meteo')) {
    return;
  }
  if(e.request.method!=='GET') return;
  if(url.hostname.includes('nominatim') || url.hostname.includes('open-meteo') || url.hostname.includes('esm.sh')) {
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const cl=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,cl));return r;}).catch(()=>caches.match('./index.html'))));
});
