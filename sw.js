
const CACHE = 'mi-semana-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
    ])
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request)
      )
    );
  }
});

// Recibir notificaciones push
self.addEventListener('push', event => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      body: event.data ? event.data.text() : ''
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'MI SEMANA 🔔',
      {
        body: data.body || 'Tienes un recordatorio pendiente.',
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: data.tag || 'mi-semana',
        data: {
          url: './'
        }
      }
    )
  );
});

// Abrir MI SEMANA al tocar una notificación
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(
      new URL('./', self.registration.scope).href
    )
  );
});
