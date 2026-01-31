/**
 * Minimal service worker for Web Push notifications.
 * Handles push events and notification clicks.
 */
self.addEventListener('push', (event) => {
  let data = { title: 'Notification', body: 'New notification', url: '/' };
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/assets/img/core-img/favicon.ico',
    badge: '/assets/img/core-img/favicon.ico',
    data: { url: data.url || '/work-orders', workOrderId: data.work_order_id },
    tag: data.work_order_id ? `work-order-${data.work_order_id}` : 'notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options).then(() => {
      // Notify all open app windows so they can add to in-app notification list
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && client.url.indexOf(self.registration.scope) === 0) {
          client.postMessage({
            type: 'PUSH_NOTIFICATION',
            payload: {
              title: data.title,
              body: data.body,
              url: data.url || '/work-orders',
              work_order_id: data.work_order_id,
            },
          });
        }
      }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = event.notification.data?.url || '/work-orders';
  const fullUrl = new URL(path, self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Prefer focusing an existing window that's on a protected page (user likely logged in)
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin !== self.location.origin || !('navigate' in client)) continue;
          const clientPath = clientUrl.pathname;
          // Skip clients on login - they may not have auth
          if (clientPath === '/login' || clientPath === '/') continue;
          client.navigate(fullUrl);
          return client.focus();
        } catch {
          /* skip */
        }
      }
      // Fallback: open new window (fresh load with localStorage token if any)
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});
