const CACHE_NAME = 'cendres-incandescentes-v3.1.0-latest';
const STATIC_ASSETS = [
  '/',
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/states.css',
  '/css/notifications.css',
  '/js/pwa-manager.js',
  '/js/ui-manager.js',
  '/js/notification-manager.js',
  '/js/app.js',
  '/zplace/ZPlace_Logo_C.I.png',
  '/Logo-Cendres_Incandescentes-Fond_transparent.png',
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

// Gestion des notifications push
self.addEventListener('push', event => {
  console.log('📬 Notification push reçue');
  
  let notificationData = {
    title: '🔥 Cendres Incandescentes',
    body: 'Nouvelle notification !',
    icon: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
    badge: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
    tag: 'default',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: '👀 Voir',
        icon: '/Logo-Cendres_Incandescentes-Fond_transparent.png'
      },
      {
        action: 'close',
        title: '✕ Fermer'
      }
    ],
    data: {
      url: '/'
    }
  };

  // Si des données sont envoyées avec la notification
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
    } catch (e) {
      console.warn('Erreur parsing notification payload:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  console.log('🔔 Clic sur notification:', event.notification.tag);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Ouvrir ou focuser la fenêtre de l'application
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Chercher une fenêtre existante
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Ouvrir une nouvelle fenêtre si aucune n'existe
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', event => {
  console.log('🔕 Notification fermée:', event.notification.tag);
  
  // Optionnel : envoyer des analytics ou logs
  // analytics.track('notification_closed', { tag: event.notification.tag });
});
