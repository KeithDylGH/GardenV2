
const CACHE_NAME = 'garden-cache-v4'; // Incrementamos la versión del caché
// Lista de recursos esenciales para el cascarón de la app.
// Los archivos JS/CSS generados por Vite serán cacheados por la estrategia network-first.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon-192x192.svg',
  '/assets/icon-512x512.svg',
  // CDN de Tailwind
  'https://cdn.tailwindcss.com',
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Pacifico&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7W0Q5n-wU.woff2',
  'https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ-6H6MmBp0u-zK4.woff2'
];

const APP_STORAGE_KEY = 'garden-service-tracker';
const TIMER_STORAGE = {
  START_TIME: 'timer_startTime',
  BASE_TIME: 'timer_baseTime',
};
const NOTIFICATION_TAG = 'garden-timer';
const REMINDER_NOTIFICATION_TAG = 'garden-daily-reminder';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching essential URLs');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
    // Solo manejamos peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }
  
    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            // 1. Intenta obtener la respuesta desde el caché
            const cachedResponse = await cache.match(event.request);
            
            // Estrategia: Network first para la navegación principal, cache first para lo demás
            const isNavigation = event.request.mode === 'navigate';
            
            if (isNavigation) {
              try {
                const networkResponse = await fetch(event.request);
                // Si la red funciona, la usamos y actualizamos el caché
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              } catch (error) {
                // Si la red falla, usamos el caché si está disponible
                return cachedResponse || caches.match('/index.html');
              }
            } else {
              // Para otros recursos (JS, CSS, imágenes), usamos cache first
              if (cachedResponse) {
                return cachedResponse;
              }
              // Si no está en caché, vamos a la red y lo guardamos para la próxima vez
              return fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
              });
            }
        })
    );
});


self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  notification.close();

  // Handle reminder notifications
  if (notification.tag === REMINDER_NOTIFICATION_TAG) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
    return;
  }

  // Handle timer notifications
  if (notification.tag === NOTIFICATION_TAG) {
    const handleAction = async (action) => {
      const startTime = localStorage.getItem(TIMER_STORAGE.START_TIME);
      const baseTime = parseFloat(localStorage.getItem(TIMER_STORAGE.BASE_TIME) || '0');

      if (!startTime) return; // Timer wasn't running

      const elapsed = (Date.now() - parseFloat(startTime)) / 1000;
      const newBaseTime = baseTime + elapsed;

      if (action === 'pause') {
        localStorage.setItem(TIMER_STORAGE.BASE_TIME, String(newBaseTime));
        localStorage.removeItem(TIMER_STORAGE.START_TIME);
      } else if (action === 'finish') {
        const hoursToAdd = newBaseTime / 3600;
        
        // Reset timer
        localStorage.removeItem(TIMER_STORAGE.BASE_TIME);
        localStorage.removeItem(TIMER_STORAGE.START_TIME);

        if (hoursToAdd <= 0.01) return;

        // Update main app state
        const appStateString = localStorage.getItem(APP_STORAGE_KEY);
        if (appStateString) {
          try {
            const appState = JSON.parse(appStateString);
            
            const formatDateKey = (date) => {
              const year = date.getFullYear();
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              return `${year}-${month}-${day}`;
            };
            
            const getServiceYear = (date) => {
                const year = date.getFullYear();
                const month = date.getMonth();
                const startYear = month >= 8 ? year : year - 1;
                return `${startYear}-${startYear + 1}`;
            };
            
            const today = new Date();
            const serviceYear = getServiceYear(today);
            const dateKey = formatDateKey(today);
            
            appState.currentHours = (appState.currentHours || 0) + hoursToAdd;
            
            if (!appState.archives) appState.archives = {};
            if (!appState.archives[serviceYear]) appState.archives[serviceYear] = {};
            
            const oldEntry = appState.archives[serviceYear][dateKey] || { hours: 0 };
            oldEntry.hours = (oldEntry.hours || 0) + hoursToAdd;
            appState.archives[serviceYear][dateKey] = oldEntry;
            
            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
          } catch(e) {
            console.error("SW: Failed to update app state.", e);
          }
        }
      }
    };
    event.waitUntil(handleAction(event.action));
    return;
  }
});
