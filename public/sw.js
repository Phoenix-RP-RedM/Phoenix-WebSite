const CACHE_NAME = 'cendres-incandescentes-v3.0.0';
const STATIC_ASSETS = [
  '/',
  '/zplace/ZPlace_Logo_C.I.png',
  '/manifest.json'
];

// Installation
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('❌ SW Installation:', err))
  );
});

// Activation
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activation...');
  
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.map(name => name !== CACHE_NAME ? caches.delete(name) : null)
      ))
      .then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Cache First pour les ressources statiques
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request)
          .then(networkResponse => {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(request, networkResponse.clone()));
            return networkResponse;
          })
        )
        .catch(() => caches.match('/'))
    );
    return;
  }
  
  // Network First pour les autres
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});
