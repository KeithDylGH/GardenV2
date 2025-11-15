const CACHE_NAME = "garden-cache-v4"; // Incrementamos la versión del caché
// Lista completa de recursos necesarios para que la app funcione offline.
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/index.tsx",
  "/App.tsx",
  "/types.ts",
  "/constants.ts",
  "/utils.ts",
  "/achievements.ts",
  "/hooks/useOnlineStatus.ts",
  "/assets/icon-192x192.svg",
  "/assets/icon-512x512.svg",

  // Components
  "/components/Header.tsx",
  "/components/BottomNav.tsx",
  "/components/ServiceTracker.tsx",
  "/components/HistoryView.tsx",
  "/components/ActivityView.tsx",
  "/components/PlanningView.tsx",
  "/components/GreetingCard.tsx",
  "/components/AddHoursModal.tsx",
  "/components/SettingsModal.tsx",
  "/components/HelpModal.tsx",
  "/components/OfflineToast.tsx",
  "/components/Welcome.tsx",
  "/components/StreakTutorialModal.tsx",
  "/components/StreakModal.tsx",
  "/components/InteractiveTutorial.tsx",
  "/components/TutorialConfirmationModal.tsx",
  "/components/GoalReachedModal.tsx",
  "/components/Sidebar.tsx",
  "/components/EndOfYearModal.tsx",
  "/components/ConfirmationModal.tsx",
  "/components/PlanningModal.tsx",
  "/components/PioneerUpgradeModal.tsx",
  "/components/AchievementsView.tsx",
  "/components/AchievementToast.tsx",
  "/components/ShareToast.tsx",
  "/components/ShareReportModal.tsx",
  "/components/FlowerProgress.tsx",
  "/components/Timer.tsx",
  "/components/PaceTracker.tsx",
  "/components/StatsView.tsx",
  "/components/CalendarGrid.tsx",
  "/components/ActivityCard.tsx",
  "/components/ImportArrangementModal.tsx",
  "/components/GroupArrangementCard.tsx",
  "/components/ToggleSwitch.tsx",
  "/components/WeekdayCircle.tsx",
  "/components/ServiceYearProgressIndicator.tsx",
  "/components/BibleStudiesIndicator.tsx",
  "/components/AchievementCard.tsx",

  // Icons
  "/components/icons/FlowerIcon.tsx",
  "/components/icons/PlusIcon.tsx",
  "/components/icons/MinusIcon.tsx",
  "/components/icons/SettingsIcon.tsx",
  "/components/icons/UserIcon.tsx",
  "/components/icons/XIcon.tsx",
  "/components/icons/CalendarIcon.tsx",
  "/components/icons/StarIcon.tsx",
  "/components/icons/HeartIcon.tsx",
  "/components/icons/CheckIcon.tsx",
  "/components/icons/PlayIcon.tsx",
  "/components/icons/PauseIcon.tsx",
  "/components/icons/StopIcon.tsx",
  "/components/icons/RefreshIcon.tsx",
  "/components/icons/CircleIcon.tsx",
  "/components/icons/ChevronDownIcon.tsx",
  "/components/icons/FlameIcon.tsx",
  "/components/icons/LeafIcon.tsx",
  "/components/icons/DocumentTextIcon.tsx",
  "/components/icons/LocationMarkerIcon.tsx",
  "/components/icons/HomeIcon.tsx",
  "/components/icons/ListBulletIcon.tsx",
  "/components/icons/AcademicCapIcon.tsx",
  "/components/icons/ArrowUturnLeftIcon.tsx",
  "/components/icons/PencilIcon.tsx",
  "/components/icons/TrashIcon.tsx",
  "/components/icons/ClipboardPasteIcon.tsx",
  "/components/icons/ClockIcon.tsx",
  "/components/icons/MapPinIcon.tsx",
  "/components/icons/SparklesIcon.tsx",
  "/components/icons/HelpIcon.tsx",
  "/components/icons/FireIcon.tsx",
  "/components/icons/ShieldCheckIcon.tsx",
  "/components/icons/InformationCircleIcon.tsx",
  "/components/icons/Bars3Icon.tsx",
  "/components/icons/BellIcon.tsx",
  "/components/icons/BellSlashIcon.tsx",
  "/components/icons/BoltIcon.tsx",
  "/components/icons/EyeSlashIcon.tsx",
  "/components/icons/EyeIcon.tsx",
  "/components/icons/ArchiveBoxIcon.tsx",
  "/components/icons/ArrowDownTrayIcon.tsx",
  "/components/icons/ArrowUpTrayIcon.tsx",
  "/components/icons/ChevronLeftIcon.tsx",
  "/components/icons/ChevronRightIcon.tsx",
  "/components/icons/CloudIcon.tsx",
  "/components/icons/RainIcon.tsx",
  "/components/icons/SunIcon.tsx",
  "/components/icons/MedicalIcon.tsx",
  "/components/icons/XCircleIcon.tsx",
  "/components/icons/SolidCircleIcon.tsx",
  "/components/icons/MoonIcon.tsx",
  "/components/icons/GhostIcon.tsx",
  "/components/icons/BookOpenIcon.tsx",
  "/components/icons/BuildingOfficeIcon.tsx",
  "/components/icons/ClipboardDocumentCheckIcon.tsx",
  "/components/icons/ShareIcon.tsx",
  "/components/icons/ChatBubbleBottomCenterTextIcon.tsx",
  "/components/icons/CalendarStarIcon.tsx",
  "/components/icons/ArrowTrendingUpIcon.tsx",
  "/components/icons/CalendarDaysIcon.tsx",
  "/components/icons/ClipboardDocumentListIcon.tsx",
  "/components/icons/TrophyIcon.tsx",
  "/components/icons/HomeModernIcon.tsx",
  "/components/icons/UsersIcon.tsx",
  "/components/icons/MegaphoneIcon.tsx",
  "/components/icons/ChartBarIcon.tsx",
  "/components/icons/FaceSmileIcon.tsx",
  "/components/icons/DiamondIcon.tsx",
  "/components/icons/TriangleIcon.tsx",
  "/components/icons/HexagonIcon.tsx",
  "/components/icons/LightBulbIcon.tsx",

  // CDN de Tailwind
  "https://cdn.tailwindcss.com",
  // CDNs de React y GenAI
  "https://aistudiocdn.com/react@^19.2.0",
  "https://aistudiocdn.com/react-dom@^19.2.0/client",
  "https://aistudiocdn.com/react-dom@^19.2.0/",
  "https://aistudiocdn.com/react@^19.2.0/",
  "https://aistudiocdn.com/@google/genai@^1.28.0",
  // Google Fonts
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Stack+Sans+Notch:wght@200..700&display=swap",
  "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7W0Q5n-wU.woff2",
];

const APP_STORAGE_KEY = "garden-service-tracker";
const TIMER_STORAGE = {
  START_TIME: "timer_startTime",
  BASE_TIME: "timer_baseTime",
};
const NOTIFICATION_TAG = "garden-timer";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and caching URLs");
      // Usamos addAll que es atómico. Si una falla, fallan todas.
      // Para recursos de terceros, es mejor usar `cache.add` individualmente
      // en un Promise.all para más control, pero esto es más simple.
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Solo manejamos peticiones GET
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Intenta obtener la respuesta desde el caché
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Si no está en caché, ve a la red
      try {
        const networkResponse = await fetch(event.request);
        // Si la respuesta es válida, la clonamos y la guardamos en el caché
        if (networkResponse && networkResponse.status === 200) {
          // Cacheamos solo si es una URL que esperamos
          if (
            URLS_TO_CACHE.some((url) =>
              event.request.url.startsWith(url.split("?")[0])
            )
          ) {
            await cache.put(event.request, networkResponse.clone());
          }
        }
        return networkResponse;
      } catch (error) {
        // Si la red falla, no podemos hacer nada más.
        // Podríamos devolver una página de fallback offline aquí si quisiéramos.
        console.error(
          "Fetch failed; returning offline fallback page or error.",
          error
        );
      }
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
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  notification.close();

  // Open the app on notification click if it's not the timer
  const openApp = () => {
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
  };

  if (notification.tag !== NOTIFICATION_TAG) {
    openApp();
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
    openApp(); // Also open the app when an action is clicked
    return;
  }
});
