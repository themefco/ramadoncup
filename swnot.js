const CUPWORKS_BASE = '/ramadoncup/';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      body: event.data ? event.data.text() : ''
    };
  }

  const title = data.title || 'CupWorks';

  const options = {
    body: data.body || 'A new CupWorks update is available.',
    icon: data.icon || `${CUPWORKS_BASE}favicon.ico`,
    badge: data.badge || `${CUPWORKS_BASE}favicon.ico`,
    tag: data.tag || 'cupworks',
    renotify: Boolean(data.renotify),
    data: {
      url: data.url || CUPWORKS_BASE
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const targetUrl =
    event.notification?.data?.url || CUPWORKS_BASE;

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) {
            if (
              'navigate' in client &&
              client.url !== targetUrl
            ) {
              return client
                .navigate(targetUrl)
                .then(() => client.focus());
            }

            return client.focus();
          }
        }

        return self.clients.openWindow
          ? self.clients.openWindow(targetUrl)
          : undefined;
      })
  );
});