// Service worker : l'appli s'ouvre même sans réseau, et se met à jour toute seule.
// ⚠ Changer VERSION à chaque livraison (sinon les téléphones gardent l'ancienne version).
const VERSION = 'stock-dacosta-1.0-2026-10-06';
const ASSETS = [
  './', 'index.html', 'style.css', 'config.js', 'core.js', 'pdf.js', 'app.js', 'manifest.webmanifest',
  'lib/jspdf.umd.min.js', 'lib/jspdf.plugin.autotable.min.js',
  'fonts/barlow-latin-400-normal.woff2', 'fonts/barlow-latin-500-normal.woff2', 'fonts/barlow-latin-600-normal.woff2', 'fonts/barlow-latin-700-normal.woff2',
  'fonts/barlow-semi-condensed-latin-600-normal.woff2', 'fonts/barlow-semi-condensed-latin-700-normal.woff2', 'fonts/barlow-semi-condensed-latin-800-normal.woff2',
  'icons/logo-blanc.png', 'icons/toit-blanc.png', 'icons/favicon.png', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // Google Apps Script : toujours par le réseau
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
