const CACHE_NAME = 'investtrack-cache-v1';
const ASSETS = [
  '/', 
  '/index.html', 
  '/vite.svg',
  '/icons/InvestTrack192.png',
  '/icons/InvestTrack512.png'
];

// Installation : pré-cache le shell de l’app
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation : purge les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass HMR & manifest & SW lui-même
  if (
    request.headers.get('accept')?.includes('text/event-stream') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/service-worker.js'
  ) {
    return;
  }

  // 1️⃣ Si c'est une navigation (changement d'onglet / route React)...
  if (request.mode === 'navigate') {
    // On renvoie d'abord le shell React en cache, sinon on fetch
    event.respondWith(
      caches.match('/index.html').then(cached => {
        return cached || fetch(request);
      })
    );
    return;
  }

  // 2️⃣ Si ce n'est pas un GET, on laisse passer
  if (request.method !== 'GET') {
    return;
  }

  // 3️⃣ Pour nos assets statiques, on fait un cache-first
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          return cached;
        }
        // On fetch et met en cache
        return fetch(request).then(response => {
          // Clone ici, une seule fois, pour le cache
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  // 4️⃣ Pour tout le reste (API, images dynamiques, etc.), on fait juste un fetch réseau
  //    sans tenter de mettre en cache
  return;
});
