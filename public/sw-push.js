// Push notification event handlers for PWA service worker
// This file is imported by the main service worker

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);
  
  let data = {};
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.log('[SW] Failed to parse push data:', e);
    data = {
      title: 'MKQ Consulting',
      body: event.data?.text() || 'You have a new notification'
    };
  }

  const title = data.title || 'MKQ Consulting';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: {
      url: data.url || '/portal',
      timestamp: data.timestamp || Date.now()
    },
    vibrate: [200, 100, 200],
    tag: 'mkq-notification',
    renotify: true,
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/portal';
  const fullUrl = new URL(url, self.location.origin).href;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open at our origin
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.navigate(fullUrl).then(() => client.focus());
        }
      }
      // Open new window if none exists
      return clients.openWindow(fullUrl);
    })
  );
});

// Log when SW activates
self.addEventListener('activate', (event) => {
  console.log('[SW] Push handler activated');
});
