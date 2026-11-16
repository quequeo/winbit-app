// Avisos al celular con la app cerrada (Web Push). El service worker que arma
// vite-plugin-pwa importa este archivo (ver workbox.importScripts en vite.config.js).
// El backend manda { title, body, url, tag } y nunca importes ni datos de la cuenta.

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Winbit';
  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data.tag || undefined,
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => client.url.startsWith(self.location.origin));
      if (open) {
        return open.focus().then((client) => client?.navigate?.(target));
      }
      return self.clients.openWindow(target);
    }),
  );
});
