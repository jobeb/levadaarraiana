const CACHE_NAME = 'levada-v1';
const SHELL_URLS = [
  './',
  './index.html',
  './app.html',
  './assets/css/variables.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/css/public.css',
  './assets/css/layout.css',
  './assets/css/app.css',
  './assets/css/responsive.css',
  './assets/img/logo-shadow.png',
  './assets/img/logo-white.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png'
];

// Install — precache shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, cache fallback (skip API and uploads)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET, API calls, and uploads
  if (e.request.method !== 'GET') return;
  if (url.pathname.includes('/api/')) return;
  if (url.pathname.includes('/uploads/')) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cache successful same-origin responses
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
