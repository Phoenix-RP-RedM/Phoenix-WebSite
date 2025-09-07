const CACHE_NAME = 'cendres-incandescentes-v3.1.0-latest';
const STATIC_ASSETS = [
  '/',
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/states.css',
  '/js/pwa-manager.js',
  '/js/ui-manager.js',
  '/js/app.js',
  '/zplace/ZPlace_Logo_C.I.png',
  '/zplace/Logo-Cendres_Incandescentes-Fond_transparent.png',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache ouvert, ajout des ressources...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Ressources mises en cache');
        return self.skipWaiting();
      })
      .catch(err => console.error('❌ Erreur installation SW:', err))
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activation...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activé');
        return self.clients.claim();
      })
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Cache First pour les ressources statiques
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Pas en cache, aller chercher sur le réseau
          return fetch(request)
            .then(networkResponse => {
              // Vérifier que la réponse est valide
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              
              // Cloner la réponse avant de la mettre en cache
              const responseToCache = networkResponse.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                });
              
              return networkResponse;
            });
        })
        .catch(() => {
          // En cas d'erreur, retourner la page d'accueil si disponible
          if (url.pathname === '/' || url.pathname.endsWith('.html')) {
            return caches.match('/');
          }
        })
    );
    return;
  }
  
  // Network First pour les autres requêtes
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Gestion des messages pour les mises à jour
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
