import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ServiceTracker from "./components/ServiceTracker";
import HistoryView from "./components/HistoryView";
import ActivityView from "./components/ActivityView";
import PlanningView from "./components/PlanningView";
import AddHoursModal from "./components/AddHoursModal";
import SettingsModal from "./components/SettingsModal";
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
import EndOfYearModal from "./components/EndOfYearModal";
import ConfirmationModal from "./components/ConfirmationModal";
import PlanningModal from "./components/PlanningModal";
import PioneerUpgradeModal from "./components/PioneerUpgradeModal";
import AchievementsView from "./components/AchievementsView";
import AchievementToast from "./components/AchievementToast";
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
  WeatherCondition,
  DayStatus,
  DayEntry,
  PlanningData,
  PlanningBlock,
  UserRole,
  UnlockedAchievements,
  Achievement,
} from "./types";
import {
  isSameDay,
  daysBetween,
  isWeekend,
  getServiceYear,
  getServiceYearMonths,
  hoursToHHMM,
  getCommemorationDate,
  formatDateKey,
} from "./utils";
import ShareToast from "./components/ShareToast";
import ShareReportModal from "./components/ShareReportModal";
import { ALL_ACHIEVEMENTS } from "./achievements";
import { THEMES } from "./constants";

const SolidStarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.386l-4.05 3.528 1.176 5.27c.286 1.282-1.034 2.288-2.14 1.623l-4.65-2.844-4.65 2.844c-1.106.665-2.426-.34-2.14-1.623l1.176-5.27-4.05-3.528c-.887-.84-.415-2.293.749-2.386l5.404-.433 2.082-5.007z"
      clipRule="evenodd"
    />
  </svg>
);

interface CommemorationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onDecline: () => void;
  themeColor: ThemeColor;
  performanceMode: boolean;
}

const CommemorationModal: React.FC<CommemorationModalProps> = ({
  isOpen,
  onConfirm,
  onDecline,
  themeColor,
  performanceMode,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const [hasBeenOpened, setHasBeenOpened] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  if (!hasBeenOpened) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isOpen ? "bg-black/60" : "bg-transparent pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="commemoration-title"
      onClick={onDecline}
    >
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 transition-opacity ${
          performanceMode ? "duration-0" : "duration-300"
        } ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center transform transition-all ${
            performanceMode ? "duration-0" : "duration-300"
          }`}
          style={{ transform: isOpen ? "scale(1)" : "scale(0.95)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-red-800 to-rose-900 mb-4">
            <SolidStarIcon className="w-9 h-9 text-yellow-300" />
          </div>
          <h2
            id="commemoration-title"
            className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          >
            Mes de la Conmemoración
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Ha comenzado un mes muy especial. ¿Te gustaría cambiar el color del
            tema a vinotinto para la ocasión?
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={onConfirm}
              className="w-full px-6 py-3 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold text-lg shadow-lg transition-transform"
            >
              Sí, cambiar color
            </button>
            <button
              onClick={onDecline}
              className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              No, gracias
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const APP_STORAGE_key = "garden-service-tracker";
const WELCOME_SHOWN_KEY = "garden-welcome-shown";
const TUTORIALS_SEEN_KEY = "garden-tutorials-seen";
const TUTORIAL_AGREEMENT_KEY = "garden-tutorial-agreement";
const SETTINGS_KEY = "garden-settings";
const PRIVACY_MODE_KEY = "garden-privacy-mode";
const SIMPLE_MODE_KEY = "garden-simple-mode";

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
      title: "Historial Anual",
      content:
        "Usa este selector para ver tu progreso en años de servicio anteriores.",
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
    const currentServiceYear = getServiceYear(today);

    // Date migration
    if (parsed.currentDate) {
      const d = new Date(parsed.currentDate);
      parsed.currentDate = !isNaN(d.getTime()) ? d : today;
    } else {
      parsed.currentDate = today;
    }

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
      parsed.currentServiceYear = getServiceYear(parsed.currentDate as Date);
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

  const [currentHours, setCurrentHours] = useState(
    initialState?.currentHours ?? 0
  );
  const [currentLdcHours, setCurrentLdcHours] = useState(
    initialState?.currentLdcHours ?? 0
  );
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
  const [isCommemorationModalOpen, setIsCommemorationModalOpen] =
    useState(false);
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
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(() => {
      if (typeof window !== "undefined" && "Notification" in window) {
        return Notification.permission;
      }
      return "default";
    });

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
  const [isSimpleMode, setIsSimpleMode] = useState(
    () => localStorage.getItem(SIMPLE_MODE_KEY) === "true"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayThemeColor = isSimpleMode ? "bw" : themeColor;
  const displayThemeMode =
    isSimpleMode && themeMode === "black" ? "dark" : themeMode;

  // Check for new service year on app load
  useEffect(() => {
    const today = new Date();
    const serviceYearOfToday = getServiceYear(today);

    // Check for new service year
    if (serviceYearOfToday !== currentServiceYear) {
      setEndOfYearModalOpen(true);
    }

    // Check for Commemoration month
    const commemorationDate = getCommemorationDate(serviceYearOfToday);
    if (
      commemorationDate &&
      today.getMonth() === commemorationDate.getUTCMonth() &&
      today.getFullYear() === commemorationDate.getUTCFullYear()
    ) {
      const alertShownKey = `garden-commemoration-alert-shown-${serviceYearOfToday}`;
      const hasBeenShown = localStorage.getItem(alertShownKey);

      if (!hasBeenShown) {
        setTimeout(() => setIsCommemorationModalOpen(true), 1500);
      }
    }
  }, [currentServiceYear]);

  useEffect(() => {
    const settings = { performanceMode };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [performanceMode]);

  useEffect(() => {
    localStorage.setItem(SIMPLE_MODE_KEY, String(isSimpleMode));
  }, [isSimpleMode]);

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
    if (showWelcome || activeTutorial || tutorialToConfirm || isSimpleMode)
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
    isSimpleMode,
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

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

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
          .catch((error) => console.log("SW registration failed: ", error));
      });
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", displayThemeMode !== "light");
    root.classList.toggle("theme-black", displayThemeMode === "black");
  }, [displayThemeMode]);

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
        if (
          !(
            isWeekend(checkDate) ||
            (protectedDay !== null && checkDate.getDay() === protectedDay)
          )
        ) {
          missedDaysAreProtected = false;
          break;
        }
      }

      if (missedDaysAreProtected) {
        setStreak((s) => s + 1);
      } else {
        setStreak(1);
      }
    }
    setLastLogDate(today);
  };

  const handleAddHours = (hoursToAdd: number, weather?: WeatherCondition) => {
    if (hoursToAdd <= 0) return;

    const today = new Date();
    const serviceYear = getServiceYear(today);
    const dateKey = formatDateKey(today);

    let total = 0;
    setArchives((prev) => {
      const newArchives = { ...prev };
      const yearHistory = { ...(newArchives[serviceYear] || {}) };

      const oldEntry: DayEntry = yearHistory[dateKey] || { hours: 0 };

      yearHistory[dateKey] = {
        ...oldEntry,
        hours: oldEntry.hours + hoursToAdd,
        weather: weather || oldEntry.weather,
      };
      newArchives[serviceYear] = yearHistory;

      // Recalculate total for current month
      total = 0; // reset total
      const currentMonthHistory = newArchives[serviceYear] || {};
      for (const key in currentMonthHistory) {
        if (!key.includes("SUMMARY") && !isNaN(new Date(key).getTime())) {
          const entryDate = new Date(key);
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

  const handleAddLdcHours = (ldcHoursToAdd: number, note?: string) => {
    if (ldcHoursToAdd <= 0 && (!note || !note.trim())) return;

    const today = new Date();
    const serviceYear = getServiceYear(today);
    const dateKey = formatDateKey(today);

    setArchives((prev) => {
      const newArchives = { ...prev };
      const yearHistory = { ...(newArchives[currentServiceYear] || {}) };
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
      newArchives[currentServiceYear] = yearHistory;
      return newArchives;
    });
    setCurrentLdcHours((prev) => prev + ldcHoursToAdd);
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
    weather?: WeatherCondition,
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
        weather: weather || oldEntry.weather,
      };

      if (isCampaign) {
        newEntry.isCampaign = true;
      } else {
        delete newEntry.isCampaign;
      }

      if (newEntry.status === "sick") newEntry.hours = 0;

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

      // Recalculate current month total
      const today = currentDate;
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      ) {
        const currentMonthHistory = newArchives[getServiceYear(today)];
        let total = 0;

        for (const key in currentMonthHistory) {
          if (!key.includes("SUMMARY") && !isNaN(new Date(key).getTime())) {
            const entryDate = new Date(key);
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

    if (newTotalHours > 0) {
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
            !key.includes("CARRYOVER") &&
            !isNaN(new Date(key).getTime())
          ) {
            const entryDate = new Date(key);
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
    handleCloseModal();
  };

  const handleMarkDayStatus = (date: Date, status: DayStatus | null) => {
    const dateKey = formatDateKey(date);
    const serviceYear = getServiceYear(date);

    setArchives((prev) => {
      const newArchives = { ...prev };
      if (!newArchives[serviceYear]) newArchives[serviceYear] = {};
      const yearHistory = { ...newArchives[serviceYear] };
      const oldEntry = yearHistory[dateKey] || { hours: 0 };

      const newEntry: DayEntry = { ...oldEntry };

      if (status) {
        // Setting a status
        newEntry.status = status;
        newEntry.hours = 0;
        newEntry.ldcHours = 0;
      } else {
        // Clearing a status
        delete newEntry.status;
      }

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
          if (!key.includes("SUMMARY") && !isNaN(new Date(key).getTime())) {
            const entryDate = new Date(key);
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

  const handleCloseModal = () => {
    setAddHoursModalOpen(false);
    setActivityToEdit(null);
    setDateToEdit(null);
    setIsEditTotalHoursMode(false);
    setIsEditLdcHoursMode(false);
    setIsPlanningModalOpen(false);
    setDateForPlanning(null);
    setPlanningBlockToEdit(null);
    setInitialHoursForModal(null);
  };

  const handleSaveActivity = (
    data: Omit<ActivityItem, "id" | "date"> & { recurring?: boolean }
  ) => {
    const activityDate = dateToEdit || new Date();
    if (activityToEdit) {
      const updatedActivity = { ...activityToEdit, ...data };
      setActivities((prev) =>
        prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a))
      );
    } else {
      const newActivity: ActivityItem = {
        ...data,
        id: Date.now().toString(),
        date: activityDate.toISOString(),
      };
      setActivities((prev) => [newActivity, ...prev]);
    }
    handleCloseModal();
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
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
    newMode: ThemeMode
  ) => {
    setProgressShape(newShape);
    setThemeColor(newColor);
    setThemeMode(newMode);
    setIsSettingsOpen(false);
  };

  const handleSaveProfile = (
    newName: string,
    newGoal: number,
    newProfilePic: string | null,
    newMeetingDays: number[]
  ) => {
    setUserName(newName);
    setGoal(newGoal);
    setProfilePicture(newProfilePic);
    setMeetingDays(newMeetingDays);

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

  const handleExportData = () => {
    const stateString = localStorage.getItem(APP_STORAGE_key);
    if (stateString) {
      const blob = new Blob([stateString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `garden-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
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

  const handleConfirmCommemorationTheme = () => {
    setThemeColor("wine");
    const serviceYear = getServiceYear(new Date());
    localStorage.setItem(
      `garden-commemoration-alert-shown-${serviceYear}`,
      "true"
    );
    setIsCommemorationModalOpen(false);
  };

  const handleDeclineCommemorationTheme = () => {
    const serviceYear = getServiceYear(new Date());
    localStorage.setItem(
      `garden-commemoration-alert-shown-${serviceYear}`,
      "true"
    );
    setIsCommemorationModalOpen(false);
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

  const handleTimerFinish = (hoursFromTimer: number) => {
    setInitialHoursForModal(hoursFromTimer);
    setAddHoursModalOpen(true);
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
    const prevMonthDate = new Date(currentDate);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);

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
              themeColor={displayThemeColor}
              onHelpClick={() => setHelpModalOpen(true)}
              onShareReport={handleOpenShareModal}
              notificationPermission={notificationPermission}
              onRequestNotificationPermission={requestNotificationPermission}
              performanceMode={performanceMode}
              isPrivacyMode={isPrivacyMode}
              onTogglePrivacyMode={() => setIsPrivacyMode((p) => !p)}
              isGhostMode={isGhostMode}
              onToggleGhostMode={() => setIsGhostMode((p) => !p)}
              previousMonthHistory={previousMonthHistory}
              isStatsMode={isStatsMode}
              archives={archives}
              currentServiceYear={currentServiceYear}
              activities={activities}
              themeMode={themeMode}
              isSimpleMode={isSimpleMode}
            />
          </>
        );
      case "activity":
        return (
          <ActivityView
            activities={activities}
            groupArrangements={groupArrangements}
            onSaveArrangements={handleSaveArrangements}
            themeColor={displayThemeColor}
            onEdit={handleStartEditActivity}
            onDelete={handleDeleteActivity}
            isOnline={isOnline}
            performanceMode={performanceMode}
            currentDate={currentDate}
            isPrivacyMode={isPrivacyMode}
            notes={notes}
            onSaveNotes={handleSaveNotes}
            isSimpleMode={isSimpleMode}
            themeMode={themeMode}
          />
        );
      case "history":
        return (
          <HistoryView
            archives={archives}
            currentServiceYear={currentServiceYear}
            themeColor={displayThemeColor}
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
            themeColor={displayThemeColor}
          />
        );
      case "achievements":
        return (
          <AchievementsView
            allAchievements={ALL_ACHIEVEMENTS}
            unlockedAchievements={unlockedAchievements}
            themeColor={displayThemeColor}
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
      <Header
        title={viewTitle}
        themeColor={displayThemeColor}
        streak={streak}
        onStreakClick={() => setIsStreakModalOpen(true)}
        onMenuClick={() => setSidebarOpen(true)}
        onTitleClick={() => !isSimpleMode && setIsStatsMode((s) => !s)}
        isSimpleMode={isSimpleMode}
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
        themeColor={displayThemeColor}
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
        isSimpleMode={isSimpleMode}
        onSetSimpleMode={setIsSimpleMode}
        themeMode={themeMode}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <main className="pt-24 pb-28">
        <div className="px-4 animate-fadeIn">{renderContent()}</div>
      </main>

      <BottomNav
        activeView={activeView}
        onAddClick={openAddModal}
        themeColor={displayThemeColor}
        performanceMode={performanceMode}
        isSimpleMode={isSimpleMode}
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
        themeColor={displayThemeColor}
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
      />

      <PlanningModal
        isOpen={isPlanningModalOpen}
        onClose={handleCloseModal}
        date={dateForPlanning}
        blockToEdit={planningBlockToEdit}
        onSave={handleSavePlanningBlock}
        onDelete={handleDeletePlanningBlock}
        activities={activities}
        themeColor={displayThemeColor}
        performanceMode={performanceMode}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        currentName={userName}
        currentGoal={goal}
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
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        onReplayTutorial={handleReplayTutorial}
        themeColor={displayThemeColor}
        performanceMode={performanceMode}
      />

      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streak={streak}
        themeColor={displayThemeColor}
        protectedDay={protectedDay}
        onSaveProtectedDay={handleSaveProtectedDay}
        protectedDaySetDate={protectedDaySetDate}
        meetingDays={meetingDays}
        performanceMode={performanceMode}
      />

      <StreakTutorialModal
        isOpen={isStreakTutorialModalOpen}
        onClose={() => setStreakTutorialModalOpen(false)}
        onAddHoursClick={handleStartFirstLog}
        themeColor={displayThemeColor}
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
        themeColor={displayThemeColor}
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
        themeColor={displayThemeColor}
        performanceMode={performanceMode}
      />

      <EndOfYearModal
        isOpen={isEndOfYearModalOpen}
        onArchive={handleArchiveAndStartNewYear}
        onLater={() => setEndOfYearModalOpen(false)}
        themeColor={displayThemeColor}
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
        themeColor={displayThemeColor}
      />

      <CommemorationModal
        isOpen={isCommemorationModalOpen}
        onConfirm={handleConfirmCommemorationTheme}
        onDecline={handleDeclineCommemorationTheme}
        themeColor={displayThemeColor}
        performanceMode={performanceMode}
      />

      <PioneerUpgradeModal
        isOpen={isPioneerUpgradeModalOpen}
        onClose={() => setIsPioneerUpgradeModalOpen(false)}
        onConfirm={handlePioneerUpgrade}
        themeColor={displayThemeColor}
      />

      <TutorialConfirmationModal
        isOpen={!!tutorialToConfirm}
        onStart={() => handleStartTutorial(tutorialToConfirm!)}
        onSkip={handleSkipAllTutorials}
        themeColor={displayThemeColor}
        viewName={tutorialToConfirm ? viewTitleMap[tutorialToConfirm] : ""}
        performanceMode={performanceMode}
      />

      <InteractiveTutorial
        steps={activeTutorial}
        onFinish={() => handleTutorialFinish(activeView)}
        themeColor={displayThemeColor}
        performanceMode={performanceMode}
      />

      <AchievementToast
        queue={achievementToastQueue}
        onDismiss={() => setAchievementToastQueue((q) => q.slice(1))}
        themeColor={displayThemeColor}
      />

      <OfflineToast
        isVisible={isOfflineReady}
        onDismiss={() => setIsOfflineReady(false)}
      />
      <ShareToast
        isVisible={showShareToast}
        onDismiss={() => setShowShareToast(false)}
      />
    </div>
  );
};

export default App;
