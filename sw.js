/* Service worker de AprendeUteca (ActuarIQ):
   - /api/* y leaderboard/tasks: NUNCA se cachean (el estado vive en el servidor).
   - HTML/JS/CSS: red primero (siempre la versión más nueva), caché de respaldo
     solo para poder abrir la app sin conexión (modo lectura).
   - Iconos y docs: caché primero. */
const CACHE = 'aprendeuteca-v43';
const ASSETS = ['./', './index.html', './styles.css', './net.js', './app.js', './manifest.json', './icon-192.png', './icon-512.png', './assets/uteca-logo-white.png', './assets/uteca-icon-270.png', './assets/uteca-favicon-32.png', './assets/Logo_Login.png', './assets/Logo_UTECA.png', './assets/duo/duolingo-sans-400.woff2?v=2', './assets/duo/duolingo-sans-700.woff2?v=2', './assets/duo/feather-700.woff2?v=2', './assets/duo/path-star.svg', './assets/duo/path-review.svg', './assets/duo/nav-aprender.svg', './assets/duo/nav-sonidos.svg', './assets/duo/nav-ligas.svg', './assets/duo/nav-desafios.svg', './assets/duo/nav-tienda.svg', './assets/duo/nav-mas.svg', './assets/duo/goal-1.svg', './assets/duo/streak.svg', './assets/duo/gem.svg', './assets/duo/heart.svg', './assets/duo/league-shield.svg', './assets/duo/guia-icon.svg', './assets/duo/back-arrow.svg', './assets/duo/path-chest.svg', './assets/duo/goal-2.svg', './assets/svg_leftArrowLogin.svg', './assets/svg_rightArrowLogin.svg'];

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
  // Datos vivos: directo a la red, sin tocar caché
  if (url.pathname.startsWith('/api/') || url.pathname.endsWith('leaderboard.json') || url.pathname.endsWith('tasks.json')) return;
  const fresh = e.request.mode === 'navigate'
    || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html');
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
