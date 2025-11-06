const CACHE_NAME = "garden-cache-v5"; // Versión del caché actualizada

// Lista mínima de recursos para el cascarón de la aplicación.
const URLS_TO_PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/icon-192x192.svg",
  "/assets/icon-512x512.svg",
];

const APP_STORAGE_KEY = "garden-service-tracker";
const TIMER_STORAGE = {
  START_TIME: "timer_startTime",
  BASE_TIME: "timer_baseTime",
};
const NOTIFICATION_TAG = "garden-timer";
const REMINDER_NOTIFICATION_TAG = "garden-daily-reminder";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Precaching app shell");
      return cache.addAll(URLS_TO_PRECACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log("Service Worker: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Estrategia: Network falling back to cache para la navegación principal
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          // Actualiza el caché con la nueva versión
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          // Si la red falla, busca en el caché
          console.log("Fetch failed; returning offline page from cache.");
          return (
            (await caches.match(event.request)) ||
            (await caches.match("/index.html"))
          );
        }
      })()
    );
    return;
  }

  // Estrategia: Cache first, falling back to network para todos los demás recursos (JS, CSS, fuentes, etc.)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        // Si la respuesta es válida, la guardamos en el caché para la próxima vez
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.error("Fetch failed for:", event.request.url, error);
        // Podríamos devolver una respuesta de error genérica aquí si fuera necesario
      }
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  notification.close();

  // Handle reminder notifications
  if (notification.tag === REMINDER_NOTIFICATION_TAG) {
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === "/" && "focus" in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow("/");
          }
        })
    );
    return;
  }

  // Handle timer notifications
  if (notification.tag === NOTIFICATION_TAG) {
    const handleAction = async (action) => {
      const startTime = localStorage.getItem(TIMER_STORAGE.START_TIME);
      const baseTime = parseFloat(
        localStorage.getItem(TIMER_STORAGE.BASE_TIME) || "0"
      );

      if (!startTime) return; // Timer wasn't running

      const elapsed = (Date.now() - parseFloat(startTime)) / 1000;
      const newBaseTime = baseTime + elapsed;

      if (action === "pause") {
        localStorage.setItem(TIMER_STORAGE.BASE_TIME, String(newBaseTime));
        localStorage.removeItem(TIMER_STORAGE.START_TIME);
      } else if (action === "finish") {
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
              const month = (date.getMonth() + 1).toString().padStart(2, "0");
              const day = date.getDate().toString().padStart(2, "0");
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
            if (!appState.archives[serviceYear])
              appState.archives[serviceYear] = {};

            const oldEntry = appState.archives[serviceYear][dateKey] || {
              hours: 0,
            };
            oldEntry.hours = (oldEntry.hours || 0) + hoursToAdd;
            appState.archives[serviceYear][dateKey] = oldEntry;

            localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
          } catch (e) {
            console.error("SW: Failed to update app state.", e);
          }
        }
      }
    };
    event.waitUntil(handleAction(event.action));
    return;
  }
});
