import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App as CapacitorApp } from "@capacitor/app";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ServiceTracker from "./components/ServiceTracker";
import HistoryView from "./components/HistoryView";
import ActivityView from "./components/ActivityView";
import PlanningView from "./components/PlanningView";
import AddHoursModal from "./components/AddHoursModal";
import SettingsModal from "./components/SettingsModal";
import NotificationsModal from "./components/NotificationsModal";
import ProfileModal from "./components/ProfileModal";
import HelpModal from "./components/HelpModal";
import OfflineToast from "./components/OfflineToast";
import Welcome from "./components/Welcome";
import StreakTutorialModal from "./components/StreakTutorialModal";
import StreakModal from "./components/StreakModal";
import InteractiveTutorial from "./components/InteractiveTutorial";
import TutorialConfirmationModal from "./components/TutorialConfirmationModal";
import GoalReachedModal from "./components/GoalReachedModal";
import Sidebar from "./components/Sidebar";
import NewsModal from "./components/NewsModal";
import EndOfYearModal from "./components/EndOfYearModal";
import ConfirmationModal from "./components/ConfirmationModal";
import PlanningModal from "./components/PlanningModal";
import PioneerUpgradeModal from "./components/PioneerUpgradeModal";
import AchievementsView from "./components/AchievementsView";
import AchievementToast from "./components/AchievementToast";
import TimerSelectionModal from "./components/TimerSelectionModal";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import {
  AppView,
  ThemeColor,
  HistoryLog,
  Shape,
  ActivityItem,
  ActivityType,
  ThemeMode,
  GroupArrangement,
  SetupData,
  TutorialsSeen,
  TutorialStep,
  AppState,
  DayEvent,
  DayStatus,
  DayEntry,
  PlanningData,
  PlanningBlock,
  UserRole,
  UnlockedAchievements,
  Achievement,
} from "./types";
import {
  hoursToHHMM,
  getServiceYear,
  formatDateKey,
  isSameDay,
  daysBetween,
  isWeekend,
  parseDateKey,
} from "./utils";
import ShareToast from "./components/ShareToast";
import ShareReportModal from "./components/ShareReportModal";
import StreakEndedToast from "./components/StreakEndedToast";
import UpdateToast from "./components/UpdateToast";
import { ALL_ACHIEVEMENTS } from "./achievements";
import { THEMES } from "./constants";

// HACK: Definir `window.Capacitor` para que TypeScript no se queje.
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      Plugins?: {
        SplashScreen?: {
          hide: () => Promise<void>;
        };
      };
      getPlatform: () => string;
    };
  }
}

const APP_STORAGE_key = "garden-service-tracker";
const WELCOME_SHOWN_KEY = "garden-welcome-shown";
const TUTORIALS_SEEN_KEY = "garden-tutorials-seen";
const TUTORIAL_AGREEMENT_KEY = "garden-tutorial-agreement";
const SETTINGS_KEY = "garden-settings";
const PRIVACY_MODE_KEY = "garden-privacy-mode";
const SHOW_TIMER_KEY = "garden-show-timer";
const REPORT_NOTIFICATION_KEY = "garden-report-notification";
const APP_VERSION_KEY = "garden-app-version";
const APP_VERSION = "2.0.3";
const VISIT_NOTIFICATION_KEY = "garden-visit-notification";
const STUDY_NOTIFICATION_KEY = "garden-study-notification";
const PLAN_NOTIFICATION_KEY = "garden-plan-notification";

const TUTORIALS: Record<AppView, TutorialStep[]> = {
  tracker: [
    {
      target: "#progress-display-container",
      title: "Tu Progreso Mensual",
      content:
        "Este es el corazón de tu informe. Muestra tu avance hacia la meta. ¡Tócalo para editar tu total de horas!",
      position: "bottom",
    },
    {
      target: "#header-title",
      title: "Modo Estadístico",
      content:
        'Toca el título "garden" para cambiar a una vista de estadísticas detalladas, con proyecciones anuales y más datos sobre tu servicio.',
      position: "bottom",
    },
    {
      target: "#ghost-mode-toggle",
      title: "Modo Espejo",
      content:
        "Compite contra ti mismo. El espejo marca las horas que llevabas en la misma fecha del mes anterior. Ten en cuenta que esta función estará disponible después de que completes tu primer mes de registro en la app.",
      position: "bottom",
    },
    {
      target: "#timer-section",
      title: "Temporizador Integrado",
      content:
        "Usa el temporizador para registrar tu servicio en tiempo real. ¡No perderás ni un minuto!",
      position: "top",
    },
    {
      target: "#streak-indicator",
      title: "Tu Racha Diaria",
      content:
        "¡Mantén la motivación! Toca aquí para ver los detalles de tu racha y configurar tu día de descanso.",
      position: "bottom",
    },
    {
      target: "#add-hours-button",
      title: "Añadir Horas y Actividad",
      content:
        "Usa este botón para añadir rápidamente las horas de tus sesiones de predicación o para registrar una revisita o estudio.",
      position: "top",
    },
  ],
  activity: [
    {
      target: "#activity-tabs",
      title: "Organiza tu Ministerio",
      content:
        "Cambia entre estas pestañas para ver tus grupos, revisitas y estudios bíblicos.",
      position: "bottom",
    },
    {
      target: "#import-groups-button",
      title: "Importación Inteligente",
      content:
        "Copia el texto de los arreglos de grupo de la semana y pégalo aquí. La IA lo organizará por ti.",
      position: "bottom",
    },
  ],
  history: [
    {
      target: "#history-year-selector",
      title: "Año de Servicio",
      content:
        "Presiona el nombre del mes para elegir el año de servicio que quieres consultar.",
      position: "bottom",
    },
    {
      target: "#month-navigator",
      title: "Navega por Mes",
      content:
        "Usa las flechas para moverte entre los meses del año de servicio.",
      position: "bottom",
    },
    {
      target: "#calendar-grid",
      title: "Calendario Editable",
      content:
        "Cada día muestra tus horas registradas. ¡Toca cualquier día para añadir o editar tus horas!",
      position: "top",
    },
  ],
  planning: [
    {
      target: "#planning-week-view",
      title: "Planificación Semanal",
      content:
        "Visualiza tu semana de un vistazo. Cada tarjeta representa un día para organizar tu servicio.",
      position: "top",
    },
    {
      target: "#add-plan-block-button",
      title: "Bloques de Servicio",
      content:
        'Toca el botón "+" para añadir un bloque de servicio. Dentro, podrás darle un título, un horario y vincular tus revisitas y estudios para tener un plan claro.',
      position: "bottom",
    },
  ],
  achievements: [],
};

const getViewFromHash = (hash: string): AppView => {
  switch (hash) {
    case "#/activity":
      return "activity";
    case "#/history":
      return "history";
    case "#/planning":
      return "planning";
    case "#/achievements":
      return "achievements";
    case "#/":
    case "":
    default:
      return "tracker";
  }
};

const getInitialState = (): AppState | null => {
  try {
    const saved = localStorage.getItem(APP_STORAGE_key);
    if (!saved) return null;
    const parsed = JSON.parse(saved);

    const today = new Date();
    // Force current date to today so the app always opens in the context of "now"
    parsed.currentDate = today;

    const currentServiceYear = getServiceYear(today);

    // History migration to multi-year archive structure and DayEntry object structure
    if (parsed.history && !parsed.archives) {
      // very old structure
      parsed.archives = {
        [getServiceYear(parsed.currentDate as Date)]: parsed.history,
      };
      delete parsed.history;
    } else if (!parsed.archives) {
      parsed.archives = {
        [currentServiceYear]: {},
      };
    }

    // New DayEntry migration: number -> { hours: number }
    for (const year in parsed.archives) {
      const yearHistory = parsed.archives[year];
      for (const dateKey in yearHistory) {
        const entry = yearHistory[dateKey];
        if (typeof entry === "number") {
          yearHistory[dateKey] = { hours: entry };
        }
      }
    }

    if (!parsed.currentServiceYear) {
      parsed.currentServiceYear = currentServiceYear;
    }

    // Streak last log date migration
    if (parsed.lastLogDate) {
      const d = new Date(parsed.lastLogDate);
      parsed.lastLogDate = !isNaN(d.getTime()) ? d : null;
    }

    if (!parsed.activities) parsed.activities = [];
    if (!parsed.groupArrangements) parsed.groupArrangements = [];
    if (!parsed.currentLdcHours) parsed.currentLdcHours = 0;
    if (!parsed.planningData) parsed.planningData = {};
    if (!parsed.userRole) parsed.userRole = "reg_pioneer";
    if (!parsed.notes) parsed.notes = "";
    if (!parsed.meetingDays) parsed.meetingDays = [];
    if (!parsed.protectedDaySetDate) parsed.protectedDaySetDate = null;
    if (!parsed.unlockedAchievements) parsed.unlockedAchievements = {};
    if (!parsed.profilePicture) parsed.profilePicture = null;

    // Remove legacy streak restore fields
    delete parsed.streakRestores;
    delete parsed.lastRestoreMonth;

    // Recalculate totals for the *current* month (based on 'today')
    // This fixes the issue where starting a new month (e.g. Nov -> Dec) still shows Nov hours
    let recalculatedHours = 0;
    let recalculatedLdcHours = 0;

    // We check the archives for the current service year
    const currentYearArchives = parsed.archives[currentServiceYear] || {};

    // Sum hours for the specific current month
    for (const key in currentYearArchives) {
      // Skip metadata keys
      if (key.includes("SUMMARY") || key.includes("CARRYOVER")) continue;

      const entryDate = parseDateKey(key);
      if (isNaN(entryDate.getTime())) continue;

      if (
        entryDate.getFullYear() === today.getFullYear() &&
        entryDate.getMonth() === today.getMonth()
      ) {
        const entry = currentYearArchives[key];
        recalculatedHours += entry.hours || 0;
        recalculatedLdcHours += entry.ldcHours || 0;
      }
    }

    // Add carryover for this month if it exists
    const carryoverKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-CARRYOVER`;
    if (currentYearArchives[carryoverKey]) {
      recalculatedHours += currentYearArchives[carryoverKey].hours || 0;
    }

    parsed.currentHours = recalculatedHours;
    parsed.currentLdcHours = recalculatedLdcHours;

    return parsed;
  } catch (e) {
    console.error("Failed to load state from localStorage", e);
    return null;
  }
};

const getSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return { performanceMode: false };
    const parsed = JSON.parse(saved);
    return {
      performanceMode: parsed.performanceMode ?? false,
    };
  } catch (e) {
    console.error("Failed to load settings", e);
    return { performanceMode: false };
  }
};

const getInitialPrivacyMode = (): boolean => {
  try {
    const saved = localStorage.getItem(PRIVACY_MODE_KEY);
    return saved === "true";
  } catch (e) {
    console.error("Failed to load privacy mode setting", e);
    return false;
  }
};

const App: React.FC = () => {
  const initialState = getInitialState();
  const initialSettings = getSettings();
  const isOnline = useOnlineStatus();

  const initialServiceYear = getServiceYear(
    initialState?.currentDate ? new Date(initialState.currentDate) : new Date()
  );

  const validShapes: Shape[] = [
    "flower",
    "circle",
    "heart",
    "diamond",
    "triangle",
    "hexagon",
  ];
  const initialShape = initialState?.progressShape;
  const validatedShape =
    initialShape && validShapes.includes(initialShape)
      ? initialShape
      : "circle";

  const validThemeModes: ThemeMode[] = ["light", "dark", "black"];
  const initialThemeMode = initialState?.themeMode;
  const validatedThemeMode =
    initialThemeMode && validThemeModes.includes(initialThemeMode)
      ? initialThemeMode
      : "dark";

  const [userName, setUserName] = useState(
    initialState?.userName ?? "Precursor"
  );
  const [profilePicture, setProfilePicture] = useState<string | null>(
    initialState?.profilePicture ?? null
  );
  const [goal, setGoal] = useState(initialState?.goal ?? 50);
  const [userRole, setUserRole] = useState<UserRole>(
    initialState?.userRole ?? "reg_pioneer"
  );
  const [currentDate, setCurrentDate] = useState(
    initialState?.currentDate ? new Date(initialState.currentDate) : new Date()
  );
  const [progressShape, setProgressShape] = useState<Shape>(validatedShape);
  const [themeColor, setThemeColor] = useState<ThemeColor>(
    initialState?.themeColor ?? "blue"
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>(validatedThemeMode);
  const [archives, setArchives] = useState<Record<string, HistoryLog>>(
    initialState?.archives ?? { [initialServiceYear]: {} }
  );
  const [currentServiceYear, setCurrentServiceYear] = useState(
    initialState?.currentServiceYear ?? initialServiceYear
  );
  const [activities, setActivities] = useState<ActivityItem[]>(
    initialState?.activities ?? []
  );
  const [groupArrangements, setGroupArrangements] = useState<
    GroupArrangement[]
  >(initialState?.groupArrangements ?? []);
  const [planningData, setPlanningData] = useState<PlanningData>(
    initialState?.planningData ?? {}
  );
  const [notes, setNotes] = useState(initialState?.notes ?? "");
  const [meetingDays, setMeetingDays] = useState<number[]>(
    initialState?.meetingDays ?? []
  );
  const [customColor, setCustomColor] = useState(initialState?.customColor ?? "#3b82f6");
  const [customGradientTo, setCustomGradientTo] = useState(initialState?.customGradientTo ?? "#8b5cf6");

  // Derived state: currentHours and currentLdcHours are calculated from archives.
  const currentHours = useMemo(() => {
    const serviceYear = getServiceYear(currentDate);
    const yearHistory = archives[serviceYear] || {};
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let total = 0;
    for (const key in yearHistory) {
      if (!key.includes("SUMMARY") && !key.includes("CARRYOVER")) {
        const entryDate = parseDateKey(key);
        if (
          entryDate.getFullYear() === currentYear &&
          entryDate.getMonth() === currentMonth
        ) {
          total += yearHistory[key].hours || 0;
        }
      }
    }
    // Add carryover
    const carryoverKey = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-CARRYOVER`;
    if (yearHistory[carryoverKey]) {
      total += yearHistory[carryoverKey].hours || 0;
    }
    return total;
  }, [currentDate, archives]);

  const currentLdcHours = useMemo(() => {
    const serviceYear = getServiceYear(currentDate);
    const yearHistory = archives[serviceYear] || {};
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let total = 0;
    for (const key in yearHistory) {
      if (!key.includes("SUMMARY") && !key.includes("CARRYOVER")) {
        const entryDate = parseDateKey(key);
        if (
          entryDate.getFullYear() === currentYear &&
          entryDate.getMonth() === currentMonth
        ) {
          total += yearHistory[key].ldcHours || 0;
        }
      }
    }
    return total;
  }, [currentDate, archives]);

  // Shims to allow incremental refactoring - will be removed
  const setCurrentHours = (_: any) => { };
  const setCurrentLdcHours = (_: any) => { };

  // Streak State
  const [streak, setStreak] = useState(initialState?.streak ?? 0);
  const [lastLogDate, setLastLogDate] = useState<Date | null>(
    initialState?.lastLogDate ? new Date(initialState.lastLogDate) : null
  );
  const [protectedDay, setProtectedDay] = useState<number | null>(
    initialState?.protectedDay ?? null
  );
  const [protectedDaySetDate, setProtectedDaySetDate] = useState<string | null>(
    initialState?.protectedDaySetDate ?? null
  );

  // Achievement State
  const [unlockedAchievements, setUnlockedAchievements] =
    useState<UnlockedAchievements>(initialState?.unlockedAchievements ?? {});
  const [achievementToastQueue, setAchievementToastQueue] = useState<
    Achievement[]
  >([]);

  // Month Wrapped State
  const [isMonthWrappedOpen, setIsMonthWrappedOpen] = useState(false);
  const [wrappedStats, setWrappedStats] = useState<{
    hours: number;
    placements: number;
    videos: number;
    returnVisits: number;
    bibleStudies: number;
    ldcHours: number;
    events: DayEvent[];
    year: number;
    month: number;
    bestDay?: { date: string, hours: number } | null;
    mostProductiveDayOfWeek?: string | null;
    daysPreached: number;
    consistency: number; // percentage
    dailyAverage: number;
    previousMonth?: { hours: number; daysPreached: number } | null;
  } | null>(null);

  const [activeView, setActiveView] = useState<AppView>(
    getViewFromHash(window.location.hash)
  );
  const [isAddHoursModalOpen, setAddHoursModalOpen] = useState(false);
  const [initialHoursForModal, setInitialHoursForModal] = useState<
    number | null
  >(null);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isEditTotalHoursMode, setIsEditTotalHoursMode] = useState(false);
  const [isEditLdcHoursMode, setIsEditLdcHoursMode] = useState(false);
  const [dateToEdit, setDateToEdit] = useState<Date | null>(null);
  const [isGoalReachedModalOpen, setGoalReachedModalOpen] = useState(false);
  const [isEndOfYearModalOpen, setEndOfYearModalOpen] = useState(false);
  const [isImportConfirmModalOpen, setImportConfirmModalOpen] = useState(false);
  const [importedState, setImportedState] = useState<AppState | null>(null);
  const [isPioneerUpgradeModalOpen, setIsPioneerUpgradeModalOpen] =
    useState(false);

  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [dateForPlanning, setDateForPlanning] = useState<Date | null>(null);
  const [planningBlockToEdit, setPlanningBlockToEdit] =
    useState<PlanningBlock | null>(null);

  const [activityToEdit, setActivityToEdit] = useState<ActivityItem | null>(
    null
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isTimerSelectionModalOpen, setIsTimerSelectionModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [initialTabForModal, setInitialTabForModal] = useState<"hours" | "ldc" | "visit" | "study" | undefined>(undefined);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(
    initialSettings.performanceMode
  );

  const [isPrivacyMode, setIsPrivacyMode] = useState(getInitialPrivacyMode());
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isStatsMode, setIsStatsMode] = useState(false);

  const [showWelcome, setShowWelcome] = useState(
    !localStorage.getItem(WELCOME_SHOWN_KEY)
  );

  const [tutorialsSeen, setTutorialsSeen] = useState<TutorialsSeen>(() => {
    const saved = localStorage.getItem(TUTORIALS_SEEN_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [hasAgreedToTutorials, setHasAgreedToTutorials] = useState(() => {
    const saved = localStorage.getItem(TUTORIAL_AGREEMENT_KEY);
    return saved === "true";
  });
  const [activeTutorial, setActiveTutorial] = useState<TutorialStep[] | null>(
    null
  );
  const [tutorialToConfirm, setTutorialToConfirm] = useState<AppView | null>(
    null
  );
  const [isStreakTutorialModalOpen, setStreakTutorialModalOpen] =
    useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showStreakEndedToast, setShowStreakEndedToast] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    // Oculta la pantalla de bienvenida de Capacitor una vez que el componente principal se monta.
    if (window.Capacitor?.Plugins?.SplashScreen) {
      setTimeout(() => {
        window.Capacitor?.Plugins?.SplashScreen?.hide();
      }, 200);
    }
    // Configura la barra de estado para que sea transparente y superpuesta
    if (window.Capacitor?.isNativePlatform()) {
      // Use dynamic import for StatusBar
      import("@capacitor/status-bar")
        .then(({ StatusBar }) => {
          StatusBar.setOverlaysWebView({ overlay: true });
        })
        .catch((err) => console.error("Error loading StatusBar plugin", err));
    }
  }, []);

  useEffect(() => {
    const setSystemTheme = async () => {
      if (window.Capacitor?.isNativePlatform()) {
        try {
          const { StatusBar, Style } = await import("@capacitor/status-bar");

          const style = themeMode === "light" ? Style.Light : Style.Dark;

          // Status Bar: Transparent and Overlay (extends header)
          // Note: We set the style here, visibility is handled by the other useEffect
          await StatusBar.setStyle({ style });
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setBackgroundColor({ color: "#00000000" });

          // Navigation Bar: Specific Colors based on theme
          try {
            const navBarModule = await import(
              "@capgo/capacitor-navigation-bar"
            );
            const NavigationBar =
              navBarModule.NavigationBar || navBarModule.default;

            if (NavigationBar) {
              let navColor = "#ffffff"; // Default white for Light mode
              let darkButtons = true;

              if (themeMode === "light") {
                navColor = "#ffffff";
                darkButtons = true;
              } else if (themeMode === "dark") {
                navColor = "#0f172a"; // Slate 900 for Dark mode
                darkButtons = false;
              } else if (themeMode === "black") {
                navColor = "#000000"; // True Black for Black mode
                darkButtons = false;
              }

              // Use setNavigationBarColor as requested
              if (
                typeof (NavigationBar as any).setNavigationBarColor ===
                "function"
              ) {
                await (NavigationBar as any).setNavigationBarColor({
                  color: navColor,
                  darkButtons: darkButtons,
                });
              }
            }
          } catch (navErr) {
            console.warn(
              "NavigationBar plugin could not be loaded or configured:",
              navErr
            );
          }
        } catch (e) {
          console.error("Error setting system theme:", e);
        }
      }
    };
    setSystemTheme();
  }, [themeMode]);

  // Check for new service year on app load
  useEffect(() => {
    const today = new Date();
    const serviceYearOfToday = getServiceYear(today);

    // Check for new service year
    if (serviceYearOfToday !== currentServiceYear) {
      setEndOfYearModalOpen(true);
    }
  }, [currentServiceYear]);

  useEffect(() => {
    const settings = { performanceMode };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [performanceMode]);

  // Check for app version updates (Live Update detection)
  useEffect(() => {
    const lastVersion = localStorage.getItem(APP_VERSION_KEY);
    if (lastVersion && lastVersion !== APP_VERSION) {
      setShowUpdateToast(true);
    }
    localStorage.setItem(APP_VERSION_KEY, APP_VERSION);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const newView = getViewFromHash(window.location.hash);
      setActiveView(newView);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const today = new Date();
        if (!isSameDay(today, currentDate)) {
          setCurrentDate(today);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentDate]);



  useEffect(() => {
    if (showWelcome || activeTutorial || tutorialToConfirm)
      return;
    const tutorialAgreement = localStorage.getItem(TUTORIAL_AGREEMENT_KEY);
    if (tutorialAgreement === "false") return;
    const shouldShowTutorial =
      !tutorialsSeen[activeView] && TUTORIALS[activeView]?.length > 0;

    if (shouldShowTutorial) {
      if (hasAgreedToTutorials) {
        const timer = setTimeout(
          () => setActiveTutorial(TUTORIALS[activeView]),
          500
        );
        return () => clearTimeout(timer);
      } else {
        setTutorialToConfirm(activeView);
      }
    }
  }, [
    activeView,
    tutorialsSeen,
    showWelcome,
    activeTutorial,
    tutorialToConfirm,
    hasAgreedToTutorials,
    activeTutorial,
  ]);

  const handleTutorialFinish = (view: AppView) => {
    const newTutorialsSeen = { ...tutorialsSeen, [view]: true };
    setTutorialsSeen(newTutorialsSeen);
    localStorage.setItem(TUTORIALS_SEEN_KEY, JSON.stringify(newTutorialsSeen));
    setActiveTutorial(null);

    if (view === "tracker") {
      const hasSeenStreakTutorial = localStorage.getItem(
        "garden-streak-tutorial-seen"
      );
      if (!hasSeenStreakTutorial) {
        setStreakTutorialModalOpen(true);
        localStorage.setItem("garden-streak-tutorial-seen", "true");
      }
    }
  };

  const handleStartTutorial = (view: AppView) => {
    setHasAgreedToTutorials(true);
    localStorage.setItem(TUTORIAL_AGREEMENT_KEY, "true");
    setTutorialsSeen((prev) => ({ ...prev }));
    setActiveTutorial(TUTORIALS[view]);
    setTutorialToConfirm(null);
  };

  const handleSkipAllTutorials = () => {
    const allSeen: TutorialsSeen = {
      tracker: true,
      activity: true,
      history: true,
      planning: true,
      achievements: true,
    };
    setTutorialsSeen(allSeen);
    localStorage.setItem(TUTORIALS_SEEN_KEY, JSON.stringify(allSeen));
    localStorage.setItem(TUTORIAL_AGREEMENT_KEY, "false");
    setTutorialToConfirm(null);
  };

  const handleReplayTutorial = () => {
    setHelpModalOpen(false);
    setTimeout(() => setActiveTutorial(TUTORIALS[activeView]), 300);
  };

  useEffect(() => {
    document.body.style.overflow = activeView === "tracker" ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeView]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("SW registration successful: ", registration.scope);
            if (registration.installing) {
              registration.installing.onstatechange = () => {
                if (registration.installing?.state === "installed")
                  setIsOfflineReady(true);
              };
            }
          })
          .catch((error) => {
            console.log("SW registration failed: ", error);
          });
      });
    }
  }, []);

  // Check for shared files (Pending Import) from MainActivity
  const checkForPendingImport = useCallback(async () => {
    try {
      const filename = "pending_import.json";
      try {
        // Check if file exists by trying to read it
        const result = await Filesystem.readFile({
          path: filename,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        if (result.data) {
          const content = typeof result.data === "string" ? result.data : JSON.stringify(result.data);
          try {
            const parsedState = JSON.parse(content) as AppState;
            // Basic validation
            if (parsedState.userName && parsedState.archives) {
              setImportedState(parsedState);
              setImportConfirmModalOpen(true);

              // Delete the file after successful read
              await Filesystem.deleteFile({
                path: filename,
                directory: Directory.Cache,
              });
            }
          } catch (parseError) {
            console.error("Error parsing imported file", parseError);
          }
        }
      } catch (readError) {
        // File mostly won't exist, which is normal
      }
    } catch (e) {
      console.error("Error checking for pending import", e);
    }
  }, []);

  useEffect(() => {
    // Check on launch
    checkForPendingImport();

    // Listen for custom event from MainActivity
    const handleImportAvailable = () => {
      checkForPendingImport();
    };
    window.addEventListener("gardenImportAvailable", handleImportAvailable);

    return () => {
      window.removeEventListener("gardenImportAvailable", handleImportAvailable);
    };
  }, [checkForPendingImport]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", themeMode !== "light");
    root.classList.toggle("theme-black", themeMode === "black");

    // Apply custom colors if active
    if (themeColor === "custom") {
      root.style.setProperty("--custom-color", customColor);
      root.style.setProperty("--custom-gradient-to", customGradientTo);

      const hexToRgb = (hex: string) => {
        if (!hex || hex.length < 7) return "59 130 246";
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r} ${g} ${b}`;
      };

      try {
        root.style.setProperty("--custom-color-rgb", hexToRgb(customColor));
        root.style.setProperty("--custom-gradient-to-rgb", hexToRgb(customGradientTo));
      } catch (e) {
        console.error("Error parsing custom colors", e);
      }
    } else {
      root.style.removeProperty("--custom-color");
      root.style.removeProperty("--custom-gradient-to");
      root.style.removeProperty("--custom-color-rgb");
      root.style.removeProperty("--custom-gradient-to-rgb");
    }
  }, [themeMode, themeColor, customColor, customGradientTo]);

  const appStateForSaving: AppState = useMemo(
    () => ({
      currentHours,
      currentLdcHours,
      userName,
      profilePicture,
      goal,
      userRole,
      currentDate: currentDate.toISOString(),
      progressShape,
      themeColor,
      themeMode,
      archives,
      currentServiceYear,
      activities,
      groupArrangements,
      streak,
      lastLogDate: lastLogDate ? lastLogDate.toISOString() : null,
      protectedDay,
      protectedDaySetDate,
      meetingDays,
      planningData,
      notes,
      unlockedAchievements,
      customColor,
      customGradientTo,
    }),
    [
      currentHours,
      currentLdcHours,
      userName,
      profilePicture,
      goal,
      userRole,
      currentDate,
      progressShape,
      themeColor,
      themeMode,
      archives,
      currentServiceYear,
      activities,
      groupArrangements,
      streak,
      lastLogDate,
      protectedDay,
      protectedDaySetDate,
      meetingDays,
      planningData,
      notes,
      unlockedAchievements,
      customColor,
      customGradientTo,
    ]
  );

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_key, JSON.stringify(appStateForSaving));
  }, [appStateForSaving]);

  // Achievement Check
  const checkAchievements = useCallback(() => {
    const newlyUnlocked: Achievement[] = [];

    ALL_ACHIEVEMENTS.forEach((achievement) => {
      const currentUnlock = unlockedAchievements[achievement.id];
      const currentTier = currentUnlock ? currentUnlock.unlockedTier : 0;

      if (currentTier >= achievement.tiers.length) return; // Already maxed out

      const { unlocked, currentProgress } =
        achievement.check(appStateForSaving);

      let nextTierIndex = achievement.tiers.findIndex(
        (tierValue) =>
          tierValue > (currentUnlock ? achievement.tiers[currentTier - 1] : 0)
      );
      if (nextTierIndex === -1) {
        // This can happen if all tiers are met
        if (currentTier < achievement.tiers.length) {
          nextTierIndex = currentTier;
        } else {
          return; // Already unlocked highest tier
        }
      }

      if (unlocked && currentProgress >= achievement.tiers[nextTierIndex]) {
        let highestNewTier = 0;
        for (let i = achievement.tiers.length - 1; i >= 0; i--) {
          if (currentProgress >= achievement.tiers[i] && i + 1 > currentTier) {
            highestNewTier = i + 1;
            break;
          }
        }

        if (highestNewTier > currentTier) {
          newlyUnlocked.push({ ...achievement, unlockedTier: highestNewTier });
          setUnlockedAchievements((prev) => ({
            ...prev,
            [achievement.id]: {
              unlockedTier: highestNewTier,
              unlockedAt: new Date().toISOString(),
            },
          }));
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      setAchievementToastQueue((q) => [...q, ...newlyUnlocked]);
    }
  }, [appStateForSaving, unlockedAchievements]);

  useEffect(() => {
    // Debounce the achievement check slightly to avoid rapid firing on state changes
    const handler = setTimeout(() => {
      checkAchievements();
    }, 500);

    return () => clearTimeout(handler);
  }, [checkAchievements]);

  useEffect(() => {
    localStorage.setItem(PRIVACY_MODE_KEY, String(isPrivacyMode));
  }, [isPrivacyMode]);

  const checkStreakConsistency = useCallback(() => {
    if (!lastLogDate || streak <= 0) return;

    const today = new Date();
    const daysDiff = daysBetween(today, lastLogDate);

    // If it's same day or the next day, it's potentially still valid
    if (daysDiff <= 1) return;

    // We missed at least one day (yesterday or older). Check if they were all protected.
    let missedDaysAreProtected = true;
    for (let i = 1; i < daysDiff; i++) {
      const checkDate = new Date(lastLogDate);
      checkDate.setDate(checkDate.getDate() + i);

      const serviceYear = getServiceYear(checkDate);
      const dateKey = formatDateKey(checkDate);
      const dayEntry = archives[serviceYear]?.[dateKey];
      const hasProtectedEvent =
        dayEntry?.event === "circuit_assembly" ||
        dayEntry?.event === "regional_convention" ||
        dayEntry?.event === "memorial";

      if (
        !(
          isWeekend(checkDate) ||
          (protectedDay !== null && checkDate.getDay() === protectedDay) ||
          hasProtectedEvent
        )
      ) {
        missedDaysAreProtected = false;
        break;
      }
    }

    if (!missedDaysAreProtected) {
      if (streak > 0) {
        setShowStreakEndedToast(true);
      }
      setStreak(0);
    }
  }, [lastLogDate, streak, archives, protectedDay]);

  useEffect(() => {
    checkStreakConsistency();
  }, [currentDate, checkStreakConsistency]);

  const updateStreak = () => {
    const today = new Date();

    if (!lastLogDate) {
      setStreak(1);
      setLastLogDate(today);
      return;
    }

    if (isSameDay(today, lastLogDate)) return;

    const daysDiff = daysBetween(today, lastLogDate);

    if (daysDiff === 1) {
      setStreak((s) => s + 1);
    } else {
      let missedDaysAreProtected = true;
      for (let i = 1; i < daysDiff; i++) {
        const checkDate = new Date(lastLogDate);
        checkDate.setDate(checkDate.getDate() + i);

        // Extended protection logic:
        // Protected if: Weekend OR Protected Weekday OR Special Event (Assembly, Memorial)

        const serviceYear = getServiceYear(checkDate);
        const dateKey = formatDateKey(checkDate);
        const dayEntry = archives[serviceYear]?.[dateKey];
        const hasProtectedEvent = dayEntry?.event === 'circuit_assembly' ||
          dayEntry?.event === 'regional_convention' ||
          dayEntry?.event === 'memorial';

        if (
          !(
            isWeekend(checkDate) ||
            (protectedDay !== null && checkDate.getDay() === protectedDay) ||
            meetingDays.includes(checkDate.getDay()) ||
            hasProtectedEvent
          )
        ) {
          missedDaysAreProtected = false;
          break;
        }
      }

      if (missedDaysAreProtected) {
        setStreak((s) => s + 1);
      } else {
        if (streak > 0) {
          setShowStreakEndedToast(true);
        }
        setStreak(1);
      }
    }
    setLastLogDate(today);
  };

  const handleAddHours = (hoursToAdd: number, event?: DayEvent) => {
    if (hoursToAdd <= 0) return;

    const today = new Date();

    // Ensure currentDate is in sync with today to properly recalculate hours
    // This fixes the issue where hours aren't displayed after crossing month boundaries
    if (!isSameDay(today, currentDate)) {
      setCurrentDate(today);
    }

    const serviceYear = getServiceYear(today);
    const dateKey = formatDateKey(today);

    let total = 0;
    setArchives((prev) => {
      const newArchives = { ...prev };
      const yearHistory = { ...(newArchives[serviceYear] || {}) };

      const oldEntry: DayEntry = yearHistory[dateKey] || { hours: 0 };

      const newEntry: DayEntry = {
        ...oldEntry,
        hours: oldEntry.hours + hoursToAdd,
        event: event || oldEntry.event,
      };

      if (
        event &&
        (event === "circuit_assembly" ||
          event === "regional_convention")
      ) {
        // Maybe logic here if needed? 
        // For now just setting it is enough as per previous logic
      }

      yearHistory[dateKey] = newEntry;
      newArchives[serviceYear] = yearHistory;

      // Recalculate total for current month
      total = 0; // reset total
      const currentMonthHistory = newArchives[serviceYear] || {};
      for (const key in currentMonthHistory) {
        if (!key.includes("SUMMARY") && !key.includes("CARRYOVER")) {
          const entryDate = parseDateKey(key);
          if (
            entryDate.getFullYear() === today.getFullYear() &&
            entryDate.getMonth() === today.getMonth()
          ) {
            total += currentMonthHistory[key].hours || 0;
          }
        }
      }

      // Add carryover if it exists
      const carryoverKey = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-CARRYOVER`;
      if (currentMonthHistory[carryoverKey]) {
        total += currentMonthHistory[carryoverKey].hours || 0;
      }

      const wasGoalReached = currentHours >= goal;
      if (!wasGoalReached && total >= goal) {
        setGoalReachedModalOpen(true);
      }
      setCurrentHours(total);

      return newArchives;
    });

    if (hoursToAdd > 0) updateStreak();
    handleCloseModal();
  };

  // Notifications & Timer State
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [timerHours, setTimerHours] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(() => {
    try {
      const saved = localStorage.getItem(SHOW_TIMER_KEY);
      return saved === null ? true : saved === "true";
    } catch { return true; }
  });
  const [reportNotificationEnabled, setReportNotificationEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(REPORT_NOTIFICATION_KEY);
      return saved === null ? true : saved === "true";
    } catch { return true; }
  });
  const [visitNotificationsEnabled, setVisitNotificationsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(VISIT_NOTIFICATION_KEY);
      return saved === null ? true : saved === "true";
    } catch { return true; }
  });
  const [studyNotificationsEnabled, setStudyNotificationsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STUDY_NOTIFICATION_KEY);
      return saved === null ? true : saved === "true";
    } catch { return true; }
  });
  const [planNotificationsEnabled, setPlanNotificationsEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(PLAN_NOTIFICATION_KEY);
      return saved === null ? true : saved === "true";
    } catch { return true; }
  });

  const backButtonListenerRef = useRef<any>(null);

  // Persist Notification Preferences
  useEffect(() => {
    localStorage.setItem(SHOW_TIMER_KEY, String(showTimer));
  }, [showTimer]);

  useEffect(() => {
    localStorage.setItem(REPORT_NOTIFICATION_KEY, String(reportNotificationEnabled));
  }, [reportNotificationEnabled]);

  useEffect(() => {
    localStorage.setItem(VISIT_NOTIFICATION_KEY, String(visitNotificationsEnabled));
  }, [visitNotificationsEnabled]);

  useEffect(() => {
    localStorage.setItem(STUDY_NOTIFICATION_KEY, String(studyNotificationsEnabled));
  }, [studyNotificationsEnabled]);

  useEffect(() => {
    localStorage.setItem(PLAN_NOTIFICATION_KEY, String(planNotificationsEnabled));
  }, [planNotificationsEnabled]);

  // Handle Android Back Button
  useEffect(() => {
    const setupBackButton = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          backButtonListenerRef.current = await CapacitorApp.addListener(
            "backButton",
            () => {
              // Priority 1: Critical Modals & Alerts
              if (showWelcome) {
                CapacitorApp.exitApp();
              } else if (activeTutorial) {
                setActiveTutorial(null);
              } else if (tutorialToConfirm) {
                setTutorialToConfirm(null);
              } else if (isStreakTutorialModalOpen) {
                setStreakTutorialModalOpen(false);
              } else if (isImportConfirmModalOpen) {
                setImportConfirmModalOpen(false);
              } else if (isGoalReachedModalOpen) {
                setGoalReachedModalOpen(false);
              } else if (isEndOfYearModalOpen) {
                setEndOfYearModalOpen(false);
              } else if (isPioneerUpgradeModalOpen) {
                setIsPioneerUpgradeModalOpen(false);
              }

              // Priority 2: Full Screen / Feature Modals
              else if (isMonthWrappedOpen) {
                setIsMonthWrappedOpen(false);
              } else if (isPlanningModalOpen) {
                setIsPlanningModalOpen(false);
              } else if (isProfileModalOpen) {
                setIsProfileModalOpen(false);
              } else if (isHelpModalOpen) {
                setHelpModalOpen(false);
              } else if (isSettingsOpen) {
                setIsSettingsOpen(false);
              } else if (isAddHoursModalOpen) {
                setAddHoursModalOpen(false);
              } else if (isStreakModalOpen) {
                setIsStreakModalOpen(false);
              } else if (isShareModalOpen) {
                setIsShareModalOpen(false);
              } else if (isNotificationsModalOpen) {
                setIsNotificationsModalOpen(false);
              } else if (isTimerSelectionModalOpen) {
                setIsTimerSelectionModalOpen(false);
              } else if (isNewsModalOpen) {
                setIsNewsModalOpen(false);
              } else if (isSidebarOpen) {
                setSidebarOpen(false);
              }

              // Priority 3: UI States
              else if (isStatsMode) {
                setIsStatsMode(false);
              }

              // Priority 4: Navigation
              else if (activeView !== "tracker") {
                setActiveView("tracker");
                window.location.hash = "#/";
              }

              // Priority 5: Exit
              else {
                CapacitorApp.exitApp();
              }
            }
          );
        } catch (e) {
          console.error("Error setting up back button listener:", e);
        }
      }
    };

    setupBackButton();

    return () => {
      if (backButtonListenerRef.current) {
        backButtonListenerRef.current.remove();
        backButtonListenerRef.current = null;
      }
    };
  }, [
    showWelcome,
    activeTutorial,
    tutorialToConfirm,
    isStreakTutorialModalOpen,
    isImportConfirmModalOpen,
    isGoalReachedModalOpen,
    isEndOfYearModalOpen,
    isPioneerUpgradeModalOpen,
    isMonthWrappedOpen,
    isPlanningModalOpen,
    isProfileModalOpen,
    isHelpModalOpen,
    isSettingsOpen,
    isAddHoursModalOpen,
    isStreakModalOpen,
    isShareModalOpen,
    isSidebarOpen,
    isNotificationsModalOpen,
    isTimerSelectionModalOpen,
    isNewsModalOpen,
    isStatsMode,
    activeView,
  ]);

  const handleAddLdcHours = (ldcHoursToAdd: number, note?: string) => {
    if (ldcHoursToAdd <= 0 && (!note || !note.trim())) return;

    const today = new Date();
    const serviceYear = getServiceYear(today);
    const dateKey = formatDateKey(today);

    setArchives((prev) => {
      const newArchives = { ...prev };
      const yearHistory = { ...(newArchives[serviceYear] || {}) };
      const oldEntry: DayEntry = yearHistory[dateKey] || { hours: 0 };

      let updatedNotes = oldEntry.notes;
      if (note && note.trim()) {
        const trimmedNote = `- ${note.trim()}`;
        updatedNotes = oldEntry.notes
          ? `${oldEntry.notes}\n${trimmedNote}`
          : trimmedNote;
      }

      yearHistory[dateKey] = {
        ...oldEntry,
        ldcHours: (oldEntry.ldcHours || 0) + ldcHoursToAdd,
        notes: updatedNotes,
      };
      newArchives[serviceYear] = yearHistory;
      return newArchives;
    });
    setCurrentLdcHours((prev) => prev + ldcHoursToAdd);
    if (ldcHoursToAdd > 0) updateStreak();
    handleCloseModal();
  };

  const handleSetHours = (totalHours: number) => {
    const difference = totalHours - currentHours;
    const dateKey = formatDateKey(currentDate);

    if (difference !== 0) {
      setArchives((prev) => {
        const newArchives = { ...prev };
        const yearHistory = { ...(newArchives[currentServiceYear] || {}) };
        const oldEntry = yearHistory[dateKey] || { hours: 0 };
        yearHistory[dateKey] = {
          ...oldEntry,
          hours: oldEntry.hours + difference,
        };
        newArchives[currentServiceYear] = yearHistory;
        return newArchives;
      });
    }

    if (!(currentHours >= goal) && totalHours >= goal)
      setGoalReachedModalOpen(true);

    setCurrentHours(totalHours);
    if (totalHours > 0) updateStreak();
    handleCloseModal();
  };

  const handleSetLdcHours = (totalLdcHours: number) => {
    const difference = totalLdcHours - currentLdcHours;
    const dateKey = formatDateKey(currentDate);

    if (difference !== 0) {
      setArchives((prev) => {
        const newArchives = { ...prev };
        const yearHistory = { ...(newArchives[currentServiceYear] || {}) };
        const oldEntry: DayEntry = yearHistory[dateKey] || { hours: 0 };
        yearHistory[dateKey] = {
          ...oldEntry,
          ldcHours: (oldEntry.ldcHours || 0) + difference,
        };
        newArchives[currentServiceYear] = yearHistory;
        return newArchives;
      });
    }
    setCurrentLdcHours(totalLdcHours);
    if (totalLdcHours > 0) updateStreak();
    handleCloseModal();
  };

  const handleDeleteLdcHours = () => {
    setArchives((prev) => {
      const newArchives = { ...prev };
      const yearHistory = { ...(newArchives[currentServiceYear] || {}) };
      const today = currentDate;
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      for (const key in yearHistory) {
        const entryDate = new Date(key);
        if (
          entryDate.getFullYear() === currentYear &&
          entryDate.getMonth() === currentMonth
        ) {
          if (yearHistory[key].ldcHours) {
            delete yearHistory[key].ldcHours;
          }
        }
      }
      newArchives[currentServiceYear] = yearHistory;
      return newArchives;
    });
    setCurrentLdcHours(0);
    handleCloseModal();
  };

  const handleSetHoursForDate = (
    newTotalHours: number,
    date: Date,
    event?: DayEvent | null,
    isCampaign?: boolean
  ) => {
    const dateKey = formatDateKey(date);
    const serviceYear = getServiceYear(date);

    setArchives((prev) => {
      const newArchives = { ...prev };
      if (!newArchives[serviceYear]) newArchives[serviceYear] = {};
      const yearHistory = { ...newArchives[serviceYear] };
      const oldEntry = yearHistory[dateKey] || { hours: 0 };

      const newEntry: DayEntry = {
        ...oldEntry,
        hours: newTotalHours,
        event: event || undefined, // Set the event
      };

      if (event) {
        delete newEntry.weather; // Clear legacy weather if event is set
      }

      if (isCampaign) {
        newEntry.isCampaign = true;
      } else {
        delete newEntry.isCampaign;
      }

      // Handle "sick" event logic - zero out hours if sick?
      // User didn't strictly say sick days have 0 hours, but implied it by being a status replace.
      // Existing logic for status='sick' zeroed hours.
      if (newEntry.event === "sick") {
        newEntry.hours = 0;
        newEntry.ldcHours = 0;
      }

      if (
        newEntry.hours > 0 ||
        newEntry.event ||
        newEntry.weather || // Keep checking for legacy data
        newEntry.status || // Keep checking for legacy data
        newEntry.isCampaign ||
        (newEntry.ldcHours && newEntry.ldcHours > 0) ||
        (newEntry.notes && newEntry.notes.trim())
      ) {
        yearHistory[dateKey] = newEntry;
      } else {
        delete yearHistory[dateKey];
      }
      newArchives[serviceYear] = yearHistory;

      // Recalculate current month total
      const today = currentDate;
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      ) {
        const currentMonthHistory = newArchives[getServiceYear(today)];
        let total = 0;

        for (const key in currentMonthHistory) {
          if (!key.includes("SUMMARY") && !key.includes("CARRYOVER")) {
            const entryDate = parseDateKey(key);
            if (
              entryDate.getFullYear() === today.getFullYear() &&
              entryDate.getMonth() === today.getMonth()
            ) {
              total += currentMonthHistory[key].hours || 0;
            }
          }
        }

        const carryoverKey = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-CARRYOVER`;
        if (currentMonthHistory[carryoverKey]) {
          total += currentMonthHistory[carryoverKey].hours || 0;
        }

        setCurrentHours(total);
      }

      return newArchives;
    });

    if (newTotalHours > 0 || event === 'memorial' || event === 'circuit_assembly' || event === 'regional_convention') {
      const today = new Date();
      // Only update last log date if the entry is for today or in the past
      if (date.getTime() <= today.getTime()) {
        // Should we strictly update lastLogDate? 
        // If I mark memorial today, I want to keep my streak active.
        // Current logic updates lastLogDate if date > lastLogDate.
        if (!lastLogDate || date > lastLogDate) {
          setLastLogDate(date);
          // Only increment streak if it was 0, otherwise let updateStreak handle the diff logic?
          // Actually, updateStreak is called on mount/init usually? 
          // No, updateStreak is meant to run when opening the app. 
          // Here we are manually editing data.
          // If streak is 0, we start it.
          if (streak === 0) setStreak(1);
        }
      }
    }
    handleCloseModal();
  };

  const handleSetLdcHoursForDate = (
    ldcHours: number,
    date: Date,
    notes?: string
  ) => {
    const dateKey = formatDateKey(date);
    const serviceYear = getServiceYear(date);

    setArchives((prev) => {
      const newArchives = { ...prev };
      if (!newArchives[serviceYear]) newArchives[serviceYear] = {};
      const yearHistory = { ...newArchives[serviceYear] };
      const oldEntry = yearHistory[dateKey] || { hours: 0 };

      const newEntry: DayEntry = {
        ...oldEntry,
        ldcHours: ldcHours,
        notes: notes,
      };

      if (
        newEntry.hours > 0 ||
        newEntry.weather ||
        newEntry.status ||
        newEntry.isCampaign ||
        (newEntry.ldcHours && newEntry.ldcHours > 0) ||
        (newEntry.notes && newEntry.notes.trim())
      ) {
        yearHistory[dateKey] = newEntry;
      } else {
        delete yearHistory[dateKey];
      }
      newArchives[serviceYear] = yearHistory;

      // Recalculate current month LDC total
      const today = currentDate;
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      ) {
        const currentMonthHistory = newArchives[getServiceYear(today)];
        let total = 0;
        for (const key in currentMonthHistory) {
          if (
            !key.includes("SUMMARY") &&
            !key.includes("CARRYOVER")
          ) {
            const entryDate = parseDateKey(key);
            if (
              entryDate.getFullYear() === today.getFullYear() &&
              entryDate.getMonth() === today.getMonth()
            ) {
              total += currentMonthHistory[key].ldcHours || 0;
            }
          }
        }
        setCurrentLdcHours(total);
      }

      return newArchives;
    });

    if (ldcHours > 0) {
      const today = new Date();
      if (date.getTime() <= today.getTime()) {
        if (!lastLogDate || date > lastLogDate) {
          setLastLogDate(date);
          if (streak === 0) setStreak(1);
        }
      }
    }

    handleCloseModal();
  };

  const handleMarkDayStatus = (date: Date, status: DayEvent | "sick" | null) => {
    const dateKey = formatDateKey(date);
    const serviceYear = getServiceYear(date);

    setArchives((prev) => {
      const newArchives = { ...prev };
      if (!newArchives[serviceYear]) newArchives[serviceYear] = {};
      const yearHistory = { ...newArchives[serviceYear] };
      const oldEntry = yearHistory[dateKey] || { hours: 0 };

      const newEntry: DayEntry = { ...oldEntry };

      if (status) {
        // "sick" is now an event
        if (status === "sick") {
          newEntry.event = "sick";
          newEntry.hours = 0;
          newEntry.ldcHours = 0;
        } else {
          // For other statuses if passed here, though mostly this fn was for sick
          newEntry.event = status as DayEvent;
        }
      } else {
        // Clearing status/event
        delete newEntry.event;
        delete newEntry.status; // Clear legacy
      }

      if (
        newEntry.hours > 0 ||
        newEntry.event ||
        newEntry.weather ||
        newEntry.status ||
        newEntry.isCampaign ||
        (newEntry.ldcHours && newEntry.ldcHours > 0) ||
        (newEntry.notes && newEntry.notes.trim())
      ) {
        yearHistory[dateKey] = newEntry;
      } else {
        delete yearHistory[dateKey];
      }

      newArchives[serviceYear] = yearHistory;

      // Update current month totals if status change affected hours
      const today = currentDate;
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      ) {
        const currentMonthHistory = newArchives[getServiceYear(today)];
        let totalService = 0;
        let totalLdc = 0;

        for (const key in currentMonthHistory) {
          if (!key.includes("SUMMARY") && !key.includes("CARRYOVER")) {
            const entryDate = parseDateKey(key);
            if (
              entryDate.getFullYear() === today.getFullYear() &&
              entryDate.getMonth() === today.getMonth()
            ) {
              totalService += currentMonthHistory[key].hours || 0;
              totalLdc += currentMonthHistory[key].ldcHours || 0;
            }
          }
        }

        const carryoverKey = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-CARRYOVER`;
        if (currentMonthHistory[carryoverKey]) {
          totalService += currentMonthHistory[carryoverKey].hours || 0;
        }

        setCurrentHours(totalService);
        setCurrentLdcHours(totalLdc);
      }

      return newArchives;
    });
    handleCloseModal();
  };

  useEffect(() => {
    localStorage.setItem(SHOW_TIMER_KEY, String(showTimer));
  }, [showTimer]);

  useEffect(() => {
    localStorage.setItem(REPORT_NOTIFICATION_KEY, String(reportNotificationEnabled));
  }, [reportNotificationEnabled]);

  useEffect(() => {
    localStorage.setItem(PLAN_NOTIFICATION_KEY, String(planNotificationsEnabled));
  }, [planNotificationsEnabled]);

  // Handle Report Notification Scheduling
  const scheduleReportNotification = async (enabled: boolean) => {
    if (!Capacitor.isNativePlatform()) return;

    if (enabled) {
      // Request Permissions
      const permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display === 'granted') {
        // Schedule for 1st of next month at 9:00 AM
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "garden",
              body: "¡Recuerda enviar tu informe de servicio!",
              id: 1001,
              schedule: {
                on: { day: 1, hour: 9, minute: 0 },
                allowWhileIdle: true
              }
            }
          ]
        });
      }
    } else {
      // Cancel if disabled
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
    }
  };

  const handleToggleReportNotification = async (enabled: boolean) => {
    setReportNotificationEnabled(enabled);
    await scheduleReportNotification(enabled);
  };

  const handleCloseModal = () => {
    setAddHoursModalOpen(false);
    setActivityToEdit(null);
    setDateToEdit(null);
    setIsEditTotalHoursMode(false);
    setIsEditLdcHoursMode(false);
    setInitialTabForModal(undefined);
    setIsPlanningModalOpen(false);
    setDateForPlanning(null);
    setPlanningBlockToEdit(null);
    setInitialHoursForModal(null);
  };

  const scheduleActivityNotifications = async (currentActivities: ActivityItem[]) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // 1. Cancel all previous activity notifications (range 2000-5000)
      const pending = await LocalNotifications.getPending();
      const activityNotificationIds = pending.notifications
        .filter(n => n.id >= 2000 && n.id <= 5000)
        .map(n => ({ id: n.id }));

      if (activityNotificationIds.length > 0) {
        await LocalNotifications.cancel({ notifications: activityNotificationIds });
      }

      // 2. Schedule new ones for recurring activities
      const notificationsToSchedule = [];
      let idCounter = 2000;

      for (const act of currentActivities) {
        if (act.recurring && act.recurringDays && act.recurringDays.length > 0) {
          for (const day of act.recurringDays) {
            if (idCounter > 5000) break; // Safety limit

            const isStudy = act.type === "study";

            if (isStudy && !studyNotificationsEnabled) continue;
            if (!isStudy && !visitNotificationsEnabled) continue;

            const body = isStudy
              ? `Recuerda darle estudio a ${act.name}`
              : `Recuerda revisitar a ${act.name}`;

            notificationsToSchedule.push({
              title: isStudy ? "Estudio Bíblico" : "Revisita",
              body,
              id: idCounter++,
              schedule: {
                on: {
                  weekday: day + 1, // Capacitor uses 1-7 (Sun-Sat), we have 0-6
                  hour: 7,
                  minute: 0
                },
                allowWhileIdle: true
              }
            });
          }
        }
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      }
    } catch (e) {
      console.error("Error scheduling activity notifications:", e);
    }
  };

  const schedulePlanNotifications = async (currentPlanningData: PlanningData) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // 1. Cancel previous plan notifications (range 6000-9000)
      const pending = await LocalNotifications.getPending();
      const planNotificationIds = pending.notifications
        .filter((n) => n.id >= 6000 && n.id <= 9000)
        .map((n) => ({ id: n.id }));

      if (planNotificationIds.length > 0) {
        await LocalNotifications.cancel({ notifications: planNotificationIds });
      }

      if (!planNotificationsEnabled) return;

      // 2. Schedule new ones
      const notificationsToSchedule = [];
      let idCounter = 6000;
      const today = new Date();

      for (const dateKey in currentPlanningData) {
        const dateBlocks = currentPlanningData[dateKey];
        if (!dateBlocks || dateBlocks.length === 0) continue;

        const dateObj = parseDateKey(dateKey);
        // Skip past dates (simple check, refining with time below)
        if (dateObj < new Date(today.setHours(0, 0, 0, 0))) continue;

        for (const block of dateBlocks) {
          if (block.reminderTime) {
            if (idCounter > 9000) break;

            const [hours, minutes] = block.reminderTime.split(":").map(Number);
            const scheduleDate = new Date(dateObj);
            scheduleDate.setHours(hours, minutes, 0, 0);

            // Only schedule if it's in the future
            if (scheduleDate > new Date()) {
              notificationsToSchedule.push({
                title: "Recordatorio de Plan",
                body: block.title,
                id: idCounter++,
                schedule: {
                  at: scheduleDate,
                  allowWhileIdle: true,
                },
              });
            }
          }
        }
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: notificationsToSchedule,
        });
      }
    } catch (e) {
      console.error("Error scheduling plan notifications:", e);
    }
  };

  useEffect(() => {
    schedulePlanNotifications(planningData);
  }, [planningData, planNotificationsEnabled]);

  const handleSaveActivity = (
    data: Omit<ActivityItem, "id" | "date"> & { recurring?: boolean }
  ) => {
    const activityDate = dateToEdit || new Date();
    let updatedActivities: ActivityItem[] = [];

    if (activityToEdit) {
      const updatedActivity = { ...activityToEdit, ...data };
      updatedActivities = activities.map((a) => (a.id === updatedActivity.id ? updatedActivity : a));
      setActivities(updatedActivities);
    } else {
      const newActivity: ActivityItem = {
        ...data,
        id: Date.now().toString(),
        date: activityDate.toISOString(),
      };
      updatedActivities = [newActivity, ...activities];
      setActivities(updatedActivities);
    }

    handleCloseModal();
  };

  useEffect(() => {
    scheduleActivityNotifications(activities);
  }, [activities, visitNotificationsEnabled, studyNotificationsEnabled]);

  const handleDeleteActivity = (activityId: string) => {
    const updatedActivities = activities.filter((a) => a.id !== activityId);
    setActivities(updatedActivities);
  };

  const handleStartEditActivity = (activity: ActivityItem) => {
    setActivityToEdit(activity);
    setAddHoursModalOpen(true);
  };

  const handleDayClickForHistory = (date: Date) => {
    setDateToEdit(date);
    setIsEditTotalHoursMode(false);
    setAddHoursModalOpen(true);
  };

  const handleOpenPlanningModal = (date: Date, block: PlanningBlock | null) => {
    setDateForPlanning(date);
    setPlanningBlockToEdit(block);
    setIsPlanningModalOpen(true);
  };

  const handleSavePlanningBlock = (
    date: Date,
    blockData: Omit<PlanningBlock, "id">
  ) => {
    const dateKey = formatDateKey(date);
    setPlanningData((prev) => {
      const newPlanningData = { ...prev };
      const dayBlocks = newPlanningData[dateKey]
        ? [...newPlanningData[dateKey]]
        : [];
      if (planningBlockToEdit) {
        // Editing existing block
        const blockIndex = dayBlocks.findIndex(
          (b) => b.id === planningBlockToEdit.id
        );
        if (blockIndex > -1) {
          dayBlocks[blockIndex] = { ...planningBlockToEdit, ...blockData };
        }
      } else {
        // Adding new block
        dayBlocks.push({ ...blockData, id: Date.now().toString() });
      }
      newPlanningData[dateKey] = dayBlocks;
      return newPlanningData;
    });
    handleCloseModal();
  };

  const handleDeletePlanningBlock = (date: Date, blockId: string) => {
    const dateKey = formatDateKey(date);
    setPlanningData((prev) => {
      const newPlanningData = { ...prev };
      const dayBlocks = newPlanningData[dateKey]
        ? [...newPlanningData[dateKey]]
        : [];
      const updatedBlocks = dayBlocks.filter((b) => b.id !== blockId);
      if (updatedBlocks.length > 0) {
        newPlanningData[dateKey] = updatedBlocks;
      } else {
        delete newPlanningData[dateKey];
      }
      return newPlanningData;
    });
    handleCloseModal();
  };

  const openAddModal = () => {
    setActivityToEdit(null);
    setIsEditTotalHoursMode(false);
    setDateToEdit(null);
    setAddHoursModalOpen(true);
  };

  const openEditModal = () => {
    setActivityToEdit(null);
    setIsEditTotalHoursMode(true);
    setDateToEdit(null);
    setAddHoursModalOpen(true);
  };

  const openEditLdcModal = () => {
    setActivityToEdit(null);
    setIsEditLdcHoursMode(true);
    setDateToEdit(null);
    setAddHoursModalOpen(true);
  };

  const handleSaveSettings = (
    newShape: Shape,
    newColor: ThemeColor,
    newMode: ThemeMode,
    newCustomColor?: string,
    newCustomGradientTo?: string
  ) => {
    setProgressShape(newShape);
    setThemeColor(newColor);
    setThemeMode(newMode);
    if (newCustomColor) setCustomColor(newCustomColor);
    if (newCustomGradientTo) setCustomGradientTo(newCustomGradientTo);
    setIsSettingsOpen(false);
  };
  const handleSaveProfile = (
    newName: string,
    newGoal: number,
    newProfilePic: string | null,
    newMeetingDays: number[],
    newRole: UserRole
  ) => {
    setUserName(newName);
    setGoal(newGoal);
    setProfilePicture(newProfilePic);
    setMeetingDays(newMeetingDays);
    setUserRole(newRole);

    // If the currently protected day is now a meeting day, unset it.
    if (protectedDay !== null && newMeetingDays.includes(protectedDay)) {
      setProtectedDay(null);
      setProtectedDaySetDate(null);
    }

    setIsProfileModalOpen(false);
  };

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
  };

  const handleWelcomeFinish = (data: SetupData) => {
    if (data.name.trim()) setUserName(data.name.trim());

    setUserRole(data.role);
    setGoal(data.goal);

    const now = new Date();
    const serviceYear = getServiceYear(now);
    const yearArchives: Record<string, HistoryLog> = {};

    // Process hours from previous months of the service year
    Object.entries(data.previousHours).forEach(([dateKey, hours]) => {
      if (hours > 0) {
        const entryDate = new Date(`${dateKey}T12:00:00`);
        const entryServiceYear = getServiceYear(entryDate);
        if (!yearArchives[entryServiceYear]) {
          yearArchives[entryServiceYear] = {};
        }

        const monthKey = `${entryDate.getFullYear()}-${String(
          entryDate.getMonth() + 1
        ).padStart(2, "0")}-SUMMARY`;
        yearArchives[entryServiceYear][monthKey] = { hours, isSummary: true };
      }
    });

    // Process hours for the current month
    if (data.currentMonthHours > 0) {
      const carryoverKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-CARRYOVER`;
      if (!yearArchives[serviceYear]) {
        yearArchives[serviceYear] = {};
      }
      yearArchives[serviceYear][carryoverKey] = {
        hours: data.currentMonthHours,
      };
    }

    setArchives((prev) => ({ ...prev, ...yearArchives }));
    setCurrentServiceYear(serviceYear);
    setCurrentHours(data.currentMonthHours);
    if (data.currentMonthHours > 0) updateStreak();

    setMeetingDays(data.meetingDays);
    setProtectedDay(data.protectedDay);
    setProtectedDaySetDate(data.protectedDaySetDate);

    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    setShowWelcome(false);
    window.location.hash = "#/";
  };

  const handleSaveArrangements = (arrangements: GroupArrangement[]) => {
    setGroupArrangements(arrangements);
  };

  const handleSaveNotes = (newNotes: string) => {
    setNotes(newNotes);
  };

  const handleArchiveAndStartNewYear = () => {
    const today = new Date();
    const newServiceYear = getServiceYear(today);

    setCurrentServiceYear(newServiceYear);
    setCurrentHours(0);
    setCurrentLdcHours(0);
    setArchives((prev) => ({ ...prev, [newServiceYear]: {} }));

    setEndOfYearModalOpen(false);
  };

  const handleOpenWeb = () => {
    window.open("https://garden-yqpu.onrender.com/", "_blank");
  };

  const handleExportData = async () => {
    const stateString = localStorage.getItem(APP_STORAGE_key);
    if (!stateString) return;

    if (Capacitor.isNativePlatform()) {
      try {
        const fileName = `garden-backup-${new Date().toISOString().split("T")[0]}.json`;

        // Use Cache directory for Android 11+ compatibility (scoped storage)
        await Filesystem.writeFile({
          path: fileName,
          data: stateString,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        const uriResult = await Filesystem.getUri({
          directory: Directory.Cache,
          path: fileName,
        });

        await Share.share({
          title: "Copia de Seguridad Garden",
          text: "Aquí está tu copia de seguridad de Garden.",
          url: uriResult.uri,
          dialogTitle: "Guardar Copia de Seguridad",
        });

      } catch (error) {
        console.error("Error exporting native file:", error);
        alert("Error al exportar los datos en el dispositivo.");
      }
    } else {
      // Web fallback
      const blob = new Blob([stateString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `garden-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsedState = JSON.parse(text) as AppState;
          // Basic validation
          if (
            parsedState.userName &&
            typeof parsedState.currentHours === "number" &&
            parsedState.archives
          ) {
            setImportedState(parsedState);
            setImportConfirmModalOpen(true);
          } else {
            alert("El archivo de respaldo no es válido.");
          }
        } catch (error) {
          alert("Error al leer el archivo de respaldo.");
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleConfirmImport = () => {
    if (importedState) {
      const newCurrentDate = new Date(importedState.currentDate);
      setUserName(importedState.userName);
      setGoal(importedState.goal);
      setUserRole(importedState.userRole || "reg_pioneer");
      setCurrentDate(newCurrentDate);
      setProgressShape(importedState.progressShape);
      setThemeColor(importedState.themeColor);
      setThemeMode(importedState.themeMode);
      setArchives(importedState.archives);
      setCurrentServiceYear(importedState.currentServiceYear);
      setCurrentHours(importedState.currentHours);
      setCurrentLdcHours(importedState.currentLdcHours || 0);
      setActivities(importedState.activities);
      setGroupArrangements(importedState.groupArrangements);
      setStreak(importedState.streak);
      setLastLogDate(
        importedState.lastLogDate ? new Date(importedState.lastLogDate) : null
      );
      setProtectedDay(importedState.protectedDay);
      setProtectedDaySetDate(importedState.protectedDaySetDate || null);
      setMeetingDays(importedState.meetingDays || []);
      setPlanningData(importedState.planningData || {});
      setNotes(importedState.notes || "");
      setUnlockedAchievements(importedState.unlockedAchievements || {});
      setProfilePicture(importedState.profilePicture || null);
    }
    setImportConfirmModalOpen(false);
    setImportedState(null);
  };

  const handleStartFirstLog = () => {
    setStreakTutorialModalOpen(false);
    openAddModal();
  };

  const handleSaveProtectedDay = (day: number | null) => {
    if (day !== null && day !== protectedDay) {
      setProtectedDaySetDate(new Date().toISOString());
    }
    if (day === null && protectedDay !== null) {
      setProtectedDaySetDate(null);
    }
    setProtectedDay(day);
  };

  const handlePioneerUpgrade = (
    newRole: "aux_pioneer" | "reg_pioneer" | "spec_pioneer"
  ) => {
    setUserRole(newRole);
    switch (newRole) {
      case "aux_pioneer":
        setGoal(30);
        break;
      case "spec_pioneer":
        setGoal(100);
        break;
      case "reg_pioneer":
      default:
        setGoal(50);
        break;
    }
    setIsPioneerUpgradeModalOpen(false);
  };

  const handleTestWrapped = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const serviceYear = getServiceYear(currentDate);
    const yearHistory = archives[serviceYear] || {};

    let hours = 0;
    let ldcHours = 0;
    const events: DayEvent[] = [];
    let daysPreached = 0;

    // Stats for best day and day of week
    let maxHoursInADay = 0;
    let bestDayDate: string | null = null;
    const dayOfWeekHours = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

    // Calculate hours and events from archives
    Object.keys(yearHistory).forEach(key => {
      if (key.includes("SUMMARY") || key.includes("CARRYOVER")) return;
      const entryDate = new Date(key);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        const entry = yearHistory[key];
        const entryHours = entry.hours || 0;

        if (entryHours > 0) {
          hours += entryHours;
          daysPreached++;
          if (entryHours > maxHoursInADay) {
            maxHoursInADay = entryHours;
            bestDayDate = key;
          }
          const dayIndex = entryDate.getDay();
          dayOfWeekHours[dayIndex] += entryHours;
        }

        if (entry.ldcHours) ldcHours += entry.ldcHours;
        if (entry.event) events.push(entry.event);
        if (entry.status === 'sick' && !entry.event) events.push('sick');
      }
    });

    // Find most productive day of week
    let maxDayIndex = -1;
    let maxDayHours = 0;
    dayOfWeekHours.forEach((h, idx) => {
      if (h > maxDayHours) {
        maxDayHours = h;
        maxDayIndex = idx;
      }
    });

    const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const mostProductiveDayOfWeek = maxDayIndex >= 0 ? daysOfWeek[maxDayIndex] : null;

    // Calculate consistency and daily average
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const consistency = daysInMonth > 0 ? Math.round((daysPreached / daysInMonth) * 100) : 0;
    const dailyAverage = daysPreached > 0 ? hours / daysPreached : 0;

    // Calculate previous month stats
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevServiceYear = getServiceYear(new Date(prevYear, prevMonth));
    const prevYearHistory = archives[prevServiceYear] || {};

    let prevHours = 0;
    let prevDaysPreached = 0;
    Object.keys(prevYearHistory).forEach(key => {
      if (key.includes("SUMMARY") || key.includes("CARRYOVER")) return;
      const entryDate = new Date(key);
      if (entryDate.getFullYear() === prevYear && entryDate.getMonth() === prevMonth) {
        const entry = prevYearHistory[key];
        const entryHours = entry.hours || 0;
        if (entryHours > 0) {
          prevHours += entryHours;
          prevDaysPreached++;
        }
      }
    });

    let returnVisits = 0;
    let bibleStudies = 0;
    activities.forEach(act => {
      const actDate = new Date(act.date);
      if (actDate.getFullYear() === year && actDate.getMonth() === month) {
        if (act.type === 'visit') returnVisits++;
        if (act.type === 'study') bibleStudies++;
      }
    });

    setWrappedStats({
      year,
      month,
      hours,
      ldcHours,
      events,
      placements: 0,
      videos: 0,
      returnVisits,
      bibleStudies,
      bestDay: bestDayDate ? { date: bestDayDate, hours: maxHoursInADay } : null,
      mostProductiveDayOfWeek,
      daysPreached,
      consistency,
      dailyAverage,
      previousMonth: prevHours > 0 || prevDaysPreached > 0 ? { hours: prevHours, daysPreached: prevDaysPreached } : null
    });
    setIsMonthWrappedOpen(true);
    setIsSettingsOpen(false);
  };

  const handleTimerFinish = (hoursFromTimer: number) => {
    setTimerHours(hoursFromTimer);
    setIsTimerSelectionModalOpen(true);
  };

  const handleSelectStandardHours = () => {
    if (timerHours !== null) {
      setInitialHoursForModal(timerHours);
      setIsEditTotalHoursMode(false);
      setIsEditLdcHoursMode(false);
      setInitialTabForModal("hours");
      setAddHoursModalOpen(true);
      setIsTimerSelectionModalOpen(false);
      setTimerHours(null);
    }
  };

  const handleSelectLdcHours = () => {
    if (timerHours !== null) {
      setInitialHoursForModal(timerHours);
      setIsEditTotalHoursMode(false);
      setIsEditLdcHoursMode(false);
      setInitialTabForModal("ldc");
      setAddHoursModalOpen(true);
      setIsTimerSelectionModalOpen(false);
      setTimerHours(null);
    }
  };

  const viewTitleMap: Record<AppView, string> = {
    tracker: "garden",
    activity: "Actividad",
    history: "Historial",
    planning: "Planificación",
    achievements: "Logros",
  };
  const viewTitle = viewTitleMap[activeView];

  const previousMonthHistory = useMemo(() => {
    // START FIX: Use the 1st of the previous month to avoid rollover (e.g., Mar 31 -> Feb 28/29)
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    // END FIX

    const prevMonthServiceYear = getServiceYear(prevMonthDate);
    const prevYearHistory = archives[prevMonthServiceYear] || {};

    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    const filteredHistory: HistoryLog = {};
    for (const dateKey in prevYearHistory) {
      const entryDate = new Date(dateKey + "T12:00:00Z"); // Use noon to avoid TZ issues
      if (
        entryDate.getUTCMonth() === prevMonth &&
        entryDate.getUTCFullYear() === prevYear
      ) {
        filteredHistory[dateKey] = prevYearHistory[dateKey];
      }
      // Also include summary keys
      if (dateKey.endsWith("-SUMMARY")) {
        const [year, month] = dateKey.split("-").map(Number);
        if (year === prevYear && month - 1 === prevMonth) {
          filteredHistory[dateKey] = prevYearHistory[dateKey];
        }
      }
    }
    return filteredHistory;
  }, [currentDate, archives]);

  const renderContent = () => {
    switch (activeView) {
      case "tracker":
        return (
          <>
            <ServiceTracker
              currentHours={currentHours}
              currentLdcHours={currentLdcHours}
              goal={goal}
              userRole={userRole}
              currentDate={currentDate}
              onEditClick={openEditModal}
              onEditLdcClick={openEditLdcModal}
              onTimerFinish={handleTimerFinish}
              progressShape={progressShape}
              themeColor={themeColor}
              onHelpClick={() => setHelpModalOpen(true)}
              onShareReport={handleOpenShareModal}
              performanceMode={performanceMode}
              isPrivacyMode={isPrivacyMode}
              onTogglePrivacyMode={() => setIsPrivacyMode((p) => !p)}
              isGhostMode={isGhostMode}
              onToggleGhostMode={() => setIsGhostMode((p) => !p)}
              previousMonthHistory={previousMonthHistory}
              isStatsMode={isStatsMode}
              currentServiceYear={currentServiceYear}
              activities={activities}
              themeMode={themeMode}
              showTimer={showTimer}
              archives={archives}
            />
          </>
        );
      case "activity":
        return (
          <ActivityView
            activities={activities}
            groupArrangements={groupArrangements}
            onSaveArrangements={handleSaveArrangements}
            themeColor={themeColor}
            onEdit={handleStartEditActivity}
            onDelete={handleDeleteActivity}
            isOnline={isOnline}
            performanceMode={performanceMode}
            currentDate={currentDate}
            isPrivacyMode={isPrivacyMode}
            notes={notes}
            onSaveNotes={handleSaveNotes}

            themeMode={themeMode}
          />
        );
      case "history":
        return (
          <HistoryView
            archives={archives}
            currentServiceYear={currentServiceYear}
            themeColor={themeColor}
            isPrivacyMode={isPrivacyMode}
            onDayClick={handleDayClickForHistory}
            activities={activities}
            planningData={planningData}
            meetingDays={meetingDays}
          />
        );
      case "planning":
        return (
          <PlanningView
            planningData={planningData}
            activities={activities}
            onOpenModal={handleOpenPlanningModal}
            themeColor={themeColor}
          />
        );
      case "achievements":
        return (
          <AchievementsView
            allAchievements={ALL_ACHIEVEMENTS}
            unlockedAchievements={unlockedAchievements}
            themeColor={themeColor}
            appState={appStateForSaving}
          />
        );
      default:
        return null;
    }
  };

  if (showWelcome) {
    return (
      <Welcome
        onFinish={handleWelcomeFinish}
        themeColor={themeColor}
        performanceMode={performanceMode}
        themeMode={themeMode}
        progressShape={progressShape}
        setThemeColor={setThemeColor}
        setThemeMode={setThemeMode}
        setProgressShape={setProgressShape}
      />
    );
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200">
      <style>{`
        :root {
          --custom-color: #3b82f6;
          --custom-gradient-to: #8b5cf6;
          --custom-color-rgb: 59 130 246;
          --custom-gradient-to-rgb: 139 92 246;
        }
        .theme-black, .theme-black body, .theme-black #root {
          background-color: #000000 !important;
        }
        .theme-black .bg-slate-900, 
        .theme-black .bg-slate-800,
        .theme-black .bg-gray-100,
        .theme-black .bg-gray-50 {
          background-color: #000000 !important;
        }
        .theme-black .dark\\:bg-slate-900,
        .theme-black .dark\\:bg-slate-800 {
          background-color: #000000 !important;
        }
        .theme-black .border-slate-200,
        .theme-black .dark\\:border-slate-700 {
          border-color: #1a1a1a !important;
        }

        .text-custom {
          color: var(--custom-color) !important;
        }
        .bg-custom {
          background-color: var(--custom-color) !important;
        }
        .bg-custom-subtle {
          background-color: rgba(var(--custom-color-rgb), 0.2) !important;
          background-color: rgb(var(--custom-color-rgb) / 0.2) !important;
        }
        .ring-custom {
          --tw-ring-color: rgba(var(--custom-color-rgb), 0.5) !important;
          --tw-ring-color: rgb(var(--custom-color-rgb) / 0.5) !important;
        }
      `}</style>
      <Header
        title={viewTitle}
        themeColor={themeColor}
        streak={streak}
        onStreakClick={() => setIsStreakModalOpen(true)}
        onMenuClick={() => setSidebarOpen(true)}
        onTitleClick={() => setIsStatsMode((s) => !s)}

        themeMode={themeMode}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        profilePicture={profilePicture}
        onProfileClick={() => {
          setSidebarOpen(false);
          setIsProfileModalOpen(true);
        }}
        performanceMode={performanceMode}
        onSetPerformanceMode={setPerformanceMode}
        onExport={handleExportData}
        onImport={handleImportClick}
        themeColor={themeColor}
        onSettingsClick={() => {
          setSidebarOpen(false);
          setIsSettingsOpen(true);
        }}
        userRole={userRole}
        onPioneerUpgradeClick={() => {
          setSidebarOpen(false);
          setIsPioneerUpgradeModalOpen(true);
        }}
        onAchievementsClick={() => {
          window.location.hash = "#/achievements";
          setSidebarOpen(false);
        }}


        onNotificationsClick={() => {
          setSidebarOpen(false);
          setIsNotificationsModalOpen(true);
        }}
        onOpenWeb={handleOpenWeb}
        onNewsClick={() => {
          setSidebarOpen(false);
          setIsNewsModalOpen(true);
        }}
        themeMode={themeMode}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <main className="pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <div className="px-4 animate-fadeIn max-h-full">{renderContent()}</div>
      </main>

      <BottomNav
        activeView={activeView}
        onAddClick={openAddModal}
        themeColor={themeColor}
        performanceMode={performanceMode}

        themeMode={themeMode}
      />

      <AddHoursModal
        isOpen={isAddHoursModalOpen}
        onClose={handleCloseModal}
        onAddHours={handleAddHours}
        onAddLdcHours={handleAddLdcHours}
        onSetHours={handleSetHours}
        onSetLdcHours={handleSetLdcHours}
        onDeleteLdcHours={handleDeleteLdcHours}
        onSaveActivity={handleSaveActivity}
        activityToEdit={activityToEdit}
        currentHours={currentHours}
        currentLdcHours={currentLdcHours}
        isEditMode={isEditTotalHoursMode}
        isEditLdcMode={isEditLdcHoursMode}
        themeColor={themeColor}
        performanceMode={performanceMode}
        dateForEntry={dateToEdit}
        onSetHoursForDate={handleSetHoursForDate}
        onSetLdcHoursForDate={handleSetLdcHoursForDate}
        onMarkDayStatus={handleMarkDayStatus}
        archives={archives}
        activities={activities}
        planningData={planningData}
        userRole={userRole}
        initialHours={initialHoursForModal}
        initialTab={initialTabForModal}
      />

      <PlanningModal
        isOpen={isPlanningModalOpen}
        onClose={handleCloseModal}
        date={dateForPlanning}
        blockToEdit={planningBlockToEdit}
        onSave={handleSavePlanningBlock}
        onDelete={handleDeletePlanningBlock}
        activities={activities}
        themeColor={themeColor}
        performanceMode={performanceMode}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        currentName={userName}
        currentGoal={goal}
        currentRole={userRole}
        currentProfilePicture={profilePicture}
        currentMeetingDays={meetingDays}
        themeColor={themeColor}
        performanceMode={performanceMode}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        onModeChange={setThemeMode}
        currentShape={progressShape}
        currentColor={themeColor}
        currentThemeMode={themeMode}
        performanceMode={performanceMode}
        customColor={customColor}
        customGradientTo={customGradientTo}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        onReplayTutorial={handleReplayTutorial}
        themeColor={themeColor}
        performanceMode={performanceMode}
      />

      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streak={streak}
        themeColor={themeColor}
        protectedDay={protectedDay}
        onSaveProtectedDay={handleSaveProtectedDay}
        protectedDaySetDate={protectedDaySetDate}
        meetingDays={meetingDays}
        performanceMode={performanceMode}
      />

      <NewsModal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        themeColor={themeColor}
        performanceMode={performanceMode}
      />

      <StreakTutorialModal
        isOpen={isStreakTutorialModalOpen}
        onClose={() => setStreakTutorialModalOpen(false)}
        onAddHoursClick={handleStartFirstLog}
        themeColor={themeColor}
        performanceMode={performanceMode}
        currentHours={currentHours}
      />

      <ShareReportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        userName={userName}
        currentDate={currentDate}
        currentHours={currentHours}
        currentLdcHours={currentLdcHours}
        activities={activities}
        themeColor={themeColor}
        userRole={userRole}
        archives={archives}
        onCopy={() => {
          setIsShareModalOpen(false);
          setShowShareToast(true);
        }}
      />

      <GoalReachedModal
        isOpen={isGoalReachedModalOpen}
        onClose={() => setGoalReachedModalOpen(false)}
        userName={userName}
        goal={goal}
        themeColor={themeColor}
        performanceMode={performanceMode}
      />

      <EndOfYearModal
        isOpen={isEndOfYearModalOpen}
        onArchive={handleArchiveAndStartNewYear}
        onLater={() => setEndOfYearModalOpen(false)}
        themeColor={themeColor}
        performanceMode={performanceMode}
        previousYear={currentServiceYear}
      />

      <ConfirmationModal
        isOpen={isImportConfirmModalOpen}
        onClose={() => {
          setImportConfirmModalOpen(false);
          setImportedState(null);
        }}
        onConfirm={handleConfirmImport}
        title="Confirmar Importación"
        message="Esto reemplazará todos tus datos actuales con los del archivo. ¿Estás seguro de que quieres continuar?"
        confirmText="Sí, importar datos"
        themeColor={themeColor}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        reportNotificationEnabled={reportNotificationEnabled}
        onToggleReportNotification={handleToggleReportNotification}
        visitNotificationsEnabled={visitNotificationsEnabled}
        onToggleVisitNotifications={(enabled) => {
          setVisitNotificationsEnabled(enabled);
          localStorage.setItem(VISIT_NOTIFICATION_KEY, String(enabled));
        }}
        studyNotificationsEnabled={studyNotificationsEnabled}
        onToggleStudyNotifications={(enabled) => {
          setStudyNotificationsEnabled(enabled);
          localStorage.setItem(STUDY_NOTIFICATION_KEY, String(enabled));
        }}
        showTimer={showTimer}
        onToggleShowTimer={setShowTimer}
        themeColor={themeColor}
        themeMode={themeMode}
        planNotificationsEnabled={planNotificationsEnabled}
        onTogglePlanNotifications={setPlanNotificationsEnabled}
      />

      <PioneerUpgradeModal
        isOpen={isPioneerUpgradeModalOpen}
        onClose={() => setIsPioneerUpgradeModalOpen(false)}
        onConfirm={handlePioneerUpgrade}
        themeColor={themeColor}
      />

      <TutorialConfirmationModal
        isOpen={!!tutorialToConfirm}
        onStart={() => handleStartTutorial(tutorialToConfirm!)}
        onSkip={handleSkipAllTutorials}
        themeColor={themeColor}
        viewName={tutorialToConfirm ? viewTitleMap[tutorialToConfirm] : ""}
        performanceMode={performanceMode}
      />

      <InteractiveTutorial
        steps={activeTutorial}
        onFinish={() => handleTutorialFinish(activeView)}
        themeColor={themeColor}
        performanceMode={performanceMode}
      />

      <AchievementToast
        queue={achievementToastQueue}
        onDismiss={() => setAchievementToastQueue((q) => q.slice(1))}
        themeColor={themeColor}
      />

      <OfflineToast
        isVisible={isOfflineReady}
        onDismiss={() => setIsOfflineReady(false)}
      />

      <TimerSelectionModal
        isOpen={isTimerSelectionModalOpen}
        onClose={() => setIsTimerSelectionModalOpen(false)}
        onSelectStandard={handleSelectStandardHours}
        onSelectLdc={handleSelectLdcHours}
        themeColor={themeColor}
      />
      <ShareToast
        isVisible={showShareToast}
        onDismiss={() => setShowShareToast(false)}
      />
      <StreakEndedToast
        isVisible={showStreakEndedToast}
        onDismiss={() => setShowStreakEndedToast(false)}
      />
      <UpdateToast
        isVisible={showUpdateToast}
        onDismiss={() => setShowUpdateToast(false)}
        onTap={() => setIsNewsModalOpen(true)}
      />
    </div>
  );
};

export default App;
