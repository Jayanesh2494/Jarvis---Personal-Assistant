/**
 * JARVIS PWA - Service Worker
 * Provides offline caching, asset versioning, and background capabilities.
 */

const CACHE_NAME = 'jarvis-pwa-v1.7.1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/dashboard.css',
  './css/modules.css',
  './js/app.js?v=1.7.1',
  './js/voice.js?v=1.7.1',
  './js/intentRouter.js?v=1.7.1',
  './js/memory.js?v=1.7.1',
  './js/reminders.js?v=1.7.1',
  './js/planner.js?v=1.7.1',
  './js/comms.js?v=1.7.1',
  './js/spotify.js?v=1.7.1',
  './js/shortcuts.js?v=1.7.1',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

// 1. Install Event: Cache Core Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[JARVIS SW] Pre-caching core application shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean Stale Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[JARVIS SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-First for HTML navigation; Stale-While-Revalidate for static assets; Bypass /api/
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or backend dynamic APIs
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  // HTML navigation requests: Network-first to always load latest changes immediately
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request) || caches.match('./index.html'))
    );
    return;
  }

  // Static assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html#reminders');
      }
    })
  );
});
