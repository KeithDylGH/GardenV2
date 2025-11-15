import React, { useState, useEffect, useRef } from "react";
import {
  LocalNotifications,
  PermissionStatus,
} from "@capacitor/local-notifications";
import { ThemeColor, ThemeMode } from "../types";
import { THEMES } from "../constants";
import { hoursToHHMM } from "../utils";
import { PlayIcon } from "./icons/PlayIcon";
import { PauseIcon } from "./icons/PauseIcon";
import { CheckIcon } from "./icons/CheckIcon";
import { XIcon } from "./icons/XIcon";
import { BellIcon } from "./icons/BellIcon";
import { BellSlashIcon } from "./icons/BellSlashIcon";

interface TimerProps {
  onFinishAndOpenModal: (hours: number) => void;
  themeColor: ThemeColor;
  performanceMode: boolean;
  isSimpleMode?: boolean;
  themeMode?: ThemeMode;
}

const TIMER_STORAGE = {
  START_TIME: "timer_startTime",
  BASE_TIME: "timer_baseTime",
};

const NOTIFICATION_ID = 1;

const Timer: React.FC<TimerProps> = ({
  onFinishAndOpenModal,
  themeColor,
  performanceMode,
  isSimpleMode = false,
  themeMode = "dark",
}) => {
  const [time, setTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const theme = THEMES[themeColor] || THEMES.blue;
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus | null>(null);

  const isCapacitor =
    typeof window !== "undefined" &&
    (window as any).Capacitor?.isPluginAvailable("LocalNotifications");

  useEffect(() => {
    if (isCapacitor) {
      LocalNotifications.checkPermissions().then(setPermissionStatus);
    }
    const startTime = localStorage.getItem(TIMER_STORAGE.START_TIME);
    const baseTime = parseFloat(
      localStorage.getItem(TIMER_STORAGE.BASE_TIME) || "0"
    );

    if (startTime) {
      const elapsed = (Date.now() - parseFloat(startTime)) / 1000;
      setTime(baseTime + elapsed);
      setIsActive(true);
    } else {
      setTime(baseTime);
      setIsActive(false);
    }
  }, [isCapacitor]);

  useEffect(() => {
    if (isActive) {
      const startTime = parseFloat(
        localStorage.getItem(TIMER_STORAGE.START_TIME) || String(Date.now())
      );
      const baseTime = parseFloat(
        localStorage.getItem(TIMER_STORAGE.BASE_TIME) || "0"
      );

      intervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTime(baseTime + elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const requestCapacitorPermissions = async () => {
    if (isCapacitor) {
      const status = await LocalNotifications.requestPermissions();
      setPermissionStatus(status);
      return status;
    }
    return { display: "denied" } as PermissionStatus;
  };

  const handleToggle = async () => {
    let permStatus: PermissionStatus | null = permissionStatus;
    if (isCapacitor && (!permStatus || permStatus.display === "prompt")) {
      permStatus = await requestCapacitorPermissions();
    }

    setIsActive((prev) => {
      const newIsActive = !prev;
      if (newIsActive) {
        // Starting
        localStorage.setItem(TIMER_STORAGE.START_TIME, String(Date.now()));
        if (permStatus?.display === "granted") {
          LocalNotifications.schedule({
            notifications: [
              {
                id: NOTIFICATION_ID,
                title: "Temporizador en curso",
                body: "Tu sesión de servicio está siendo cronometrada.",
                ongoing: true,
                autoCancel: false,
              },
            ],
          });
        }
      } else {
        // Pausing
        const startTime = localStorage.getItem(TIMER_STORAGE.START_TIME);
        const baseTime = parseFloat(
          localStorage.getItem(TIMER_STORAGE.BASE_TIME) || "0"
        );
        if (startTime) {
          const elapsed = (Date.now() - parseFloat(startTime)) / 1000;
          const newBaseTime = baseTime + elapsed;
          localStorage.setItem(TIMER_STORAGE.BASE_TIME, String(newBaseTime));
          localStorage.removeItem(TIMER_STORAGE.START_TIME);
          setTime(newBaseTime);
        }
        if (isCapacitor) {
          LocalNotifications.cancel({
            notifications: [{ id: NOTIFICATION_ID }],
          });
        }
      }
      return newIsActive;
    });
  };

  const handleFinish = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const hoursToAdd = time / 3600;

    if (hoursToAdd > 0.01) {
      // minimum of ~36 seconds
      onFinishAndOpenModal(hoursToAdd);
    }

    // Reset
    setTime(0);
    localStorage.removeItem(TIMER_STORAGE.START_TIME);
    localStorage.removeItem(TIMER_STORAGE.BASE_TIME);
    if (isCapacitor) {
      LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
    }
  };

  const handleReset = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTime(0);
    localStorage.removeItem(TIMER_STORAGE.START_TIME);
    localStorage.removeItem(TIMER_STORAGE.BASE_TIME);
    if (isCapacitor) {
      LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const checkIconColorClass =
    isSimpleMode && themeMode === "light" ? "text-slate-900" : "";

  const renderNotificationButton = () => {
    if (!isCapacitor) return null;

    const commonButtonClasses =
      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors";
    const commonIconClasses = "w-4 h-4";

    switch (permissionStatus?.display) {
      case "granted":
        return (
          <div
            className={`${commonButtonClasses} bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-300 cursor-default`}
            title="Las notificaciones del temporizador están activadas."
          >
            <BellIcon className={commonIconClasses} />
            Notificaciones activas
          </div>
        );
      case "denied":
        return (
          <div
            className={`${commonButtonClasses} bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 cursor-default`}
            title="Notificaciones bloqueadas. Habilítalas en la configuración de tu navegador."
          >
            <BellSlashIcon className={commonIconClasses} />
            Notificaciones bloqueadas
          </div>
        );
      case "prompt":
      default:
        return (
          <button
            onClick={requestCapacitorPermissions}
            className={`${commonButtonClasses} bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600`}
            title="Haz clic para activar las notificaciones del temporizador"
          >
            <BellIcon className={commonIconClasses} />
            Activar notificaciones
          </button>
        );
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="h-8 mb-2 flex items-center">
        {renderNotificationButton()}
      </div>
      <p
        className="text-4xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-4"
        aria-live="off"
      >
        {formatTime(time)}
      </p>
      <div className="flex items-center justify-center space-x-4 w-full h-16">
        {time > 0 && !isActive ? (
          <button
            onClick={handleReset}
            className={`w-14 h-14 text-red-500 rounded-full flex items-center justify-center duration-200 animate-fadeIn bg-red-500 bg-opacity-0 hover:bg-opacity-10 dark:hover:bg-opacity-20 ${
              !performanceMode && "transform hover:scale-105"
            }`}
            aria-label="Reiniciar temporizador"
          >
            <XIcon className="w-7 h-7" />
          </button>
        ) : (
          <div className="w-14 h-14" />
        )}

        <button
          onClick={handleToggle}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${
            theme.bg
          } ${!performanceMode && "transform hover:scale-105"}`}
          aria-label={isActive ? "Pausar temporizador" : "Iniciar temporizador"}
        >
          {isActive ? (
            <PauseIcon className="w-8 h-8" />
          ) : (
            <PlayIcon className="w-8 h-8" />
          )}
        </button>

        {time > 0 ? (
          <button
            onClick={handleFinish}
            className={`w-14 h-14 ${
              theme.text
            } rounded-full flex items-center justify-center duration-200 animate-fadeIn ${
              theme.bg
            } bg-opacity-0 hover:bg-opacity-10 dark:hover:bg-opacity-20 ${
              !performanceMode && "transform hover:scale-105"
            }`}
            aria-label="Finalizar y agregar horas"
          >
            <CheckIcon className={`w-7 h-7 ${checkIconColorClass}`} />
          </button>
        ) : (
          <div className="w-14 h-14" />
        )}
      </div>
    </div>
  );
};

export default Timer;
