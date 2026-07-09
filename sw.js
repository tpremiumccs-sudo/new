/* Service worker de ActuarIQ: la app funciona offline una vez visitada.
   - HTML, leaderboard.json y tasks.json: red primero (datos frescos), caché de respaldo.
   - Resto de archivos del mismo origen: caché primero. */
const CACHE = 'actuariq-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './leaderboard.json', './tasks.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  const fresh = e.request.mode === 'navigate' || url.pathname.endsWith('leaderboard.json') || url.pathname.endsWith('tasks.json');
  if (fresh) {
    e.respondWith(
      fetch(e.request)
        .then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return res; })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return res;
    }))
  );
});
