const CACHE_NAME = 'ims-v2.5.2';
const STATIC_CACHE = 'ims-static-v2.5.2';
const DYNAMIC_CACHE = 'ims-dynamic-v2.5.2';
const LOGIN_CACHE = 'ims-login-v2.5.2';

const urlsToCache = [
  '/',
  '/login',
  '/dashboard',
  '/clients',
  '/suppliers',
  '/products',
  '/stock',
  '/warehouses',
  '/purchases',
  '/sales',
  '/financial',
  '/financial-reports',
  '/reports',
  '/import-export',
  '/settings',
  '/manifest.json',
  '/browserconfig.xml',
  '/logo.png',
  '/logo192.png',
  '/logo512.png',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

const loginAssets = [
  '/',
  '/login',
  '/logo.png',
  '/logo192.png',
  '/manifest.json',
  '/browserconfig.xml'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Opened static cache');
        return cache.addAll(urlsToCache);
      }),
      caches.open(LOGIN_CACHE).then((cache) => {
        console.log('Opened login cache');
        return cache.addAll(loginAssets);
      })
    ])
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Return offline fallback for API requests
          return new Response(JSON.stringify({ 
            error: 'Offline mode - please check your connection',
            offline: true 
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Handle login page specifically
  if (request.url.includes('/login') || request.url.endsWith('/')) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(LOGIN_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return offline fallback for login
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Return offline fallback for pages
            if (request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== LOGIN_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notification support for all devices
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification from IMS',
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View',
          icon: '/logo192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/logo192.png'
        }
      ],
      // Universal notification options for all platforms
      requireInteraction: false,
      silent: false,
      tag: 'ims-notification',
      renotify: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'IMS Notification', options)
    );
  }
});

// Handle notification clicks for all platforms
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close for all platforms
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Handle client messages for cross-platform communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

function doBackgroundSync() {
  // Handle offline actions when connection is restored
  console.log('Background sync triggered');
  // You can implement specific offline action handling here
  
  // Example: Sync offline data
  return Promise.resolve();
}

// Handle offline/online status for all platforms
self.addEventListener('online', () => {
  console.log('Service Worker: Online');
  
  // Notify all clients that we're back online
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'ONLINE' });
    });
  });
  
  // Trigger background sync for offline actions
  if ('sync' in self.registration) {
    self.registration.sync.register('background-sync')
      .then(() => console.log('Background sync registered'))
      .catch(err => console.log('Background sync registration failed:', err));
  }
});

self.addEventListener('offline', () => {
  console.log('Service Worker: Offline');
  
  // Notify all clients that we're offline
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'OFFLINE' });
    });
  });
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Handle push notifications for better PWA experience
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Push notification received:', data);
    
    const options = {
      body: data.body || 'New notification from IMS',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'ims-push',
      data: data,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/logo192.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/logo192.png'
        }
      ],
      requireInteraction: false,
      silent: false,
      renotify: true
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'IMS Update', options)
    );
  }
});

// Handle errors gracefully for all platforms
self.addEventListener('error', (event) => {
  console.error('Service Worker Error:', event.error);
});

// Handle unhandled promise rejections for all platforms
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker Unhandled Rejection:', event.reason);
});
