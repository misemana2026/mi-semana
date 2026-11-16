const CACHE = 'mi-semana-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  ]));
});

self.addEventListener('fetch', event => {
  if (event.request.method === 'GET' && new URL(event.request.url).origin === self.location.origin) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  }
});

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch { data = { body: event.data ? event.data.text() : '' }; }
  const notification = data.notification || data;
  event.waitUntil(self.registration.showNotification(notification.title || 'MI SEMANA 🔔', {
    body: notification.body || 'Tienes un recordatorio pendiente.',
    icon: './icon-192.png', badge: './icon-192.png',
    tag: data.tag || 'mi-semana', data: { url: './' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
    const url = new URL('./', self.registration.scope).href;
    const existing = windows.find(w => w.url.startsWith(url));
    return existing ? existing.focus() : clients.openWindow(url);
  }));
});
