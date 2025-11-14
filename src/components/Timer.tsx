import React, { useState, useEffect, useRef } from "react";
import { ThemeColor } from "../types";
import { THEMES } from "../constants";
import { hoursToHHMM } from "../utils";
import { PlayIcon } from "./icons/PlayIcon";
import { PauseIcon } from "./icons/PauseIcon";
import { CheckIcon } from "./icons/CheckIcon";
import { XIcon } from "./icons/XIcon";

// The built-in type might not be available in the current environment.
interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface TimerProps {
  onFinishAndOpenModal: (hours: number) => void;
  themeColor: ThemeColor;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => Promise<void>;
  performanceMode: boolean;
}

const TIMER_STORAGE = {
  START_TIME: "timer_startTime",
  BASE_TIME: "timer_baseTime",
};

const NOTIFICATION_TAG = "garden-timer";

const Timer: React.FC<TimerProps> = ({
  onFinishAndOpenModal,
  themeColor,
  notificationPermission,
  onRequestNotificationPermission,
  performanceMode,
}) => {
  const [time, setTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const theme = THEMES[themeColor] || THEMES.blue;

  useEffect(() => {
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
  }, []);

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

  const showNotification = (
    body: string,
    requireInteraction = false,
    actions: NotificationAction[] = []
  ) => {
    if (notificationPermission !== "granted") return;
    navigator.serviceWorker.ready.then((registration) => {
      // Cast notification options to 'any' to allow the 'actions' property,
      // which might not be present in the environment's NotificationOptions type definition.
      registration.showNotification("Garden Service Tracker", {
        body,
        icon: "/assets/icon-192x192.svg",
        tag: NOTIFICATION_TAG,
        requireInteraction,
        actions,
      } as any);
    });
  };

  const handleToggle = async () => {
    if (notificationPermission === "default") {
      await onRequestNotificationPermission();
    }

    setIsActive((prev) => {
      const newIsActive = !prev;
      if (newIsActive) {
        // Starting
        localStorage.setItem(TIMER_STORAGE.START_TIME, String(Date.now()));
        showNotification("El cronómetro está en curso.", true, [
          { action: "pause", title: "Pausar" },
          { action: "finish", title: "Finalizar" },
        ]);
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
        showNotification("El temporizador está en pausa.");
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
      showNotification(
        `Temporizador finalizado. Añade ${hoursToHHMM(
          hoursToAdd
        )} a tu informe.`
      );
    }

    // Reset
    setTime(0);
    localStorage.removeItem(TIMER_STORAGE.START_TIME);
    localStorage.removeItem(TIMER_STORAGE.BASE_TIME);
    navigator.serviceWorker.ready.then((registration) => {
      registration
        .getNotifications({ tag: NOTIFICATION_TAG })
        .then((notifications) => {
          notifications.forEach((notification) => notification.close());
        });
    });
  };

  const handleReset = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTime(0);
    localStorage.removeItem(TIMER_STORAGE.START_TIME);
    localStorage.removeItem(TIMER_STORAGE.BASE_TIME);
    navigator.serviceWorker.ready.then((registration) => {
      registration
        .getNotifications({ tag: NOTIFICATION_TAG })
        .then((notifications) => {
          notifications.forEach((notification) => notification.close());
        });
    });
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

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-4xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-4">
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
            <CheckIcon className="w-7 h-7" />
          </button>
        ) : (
          <div className="w-14 h-14" />
        )}
      </div>
    </div>
  );
};

export default Timer;
