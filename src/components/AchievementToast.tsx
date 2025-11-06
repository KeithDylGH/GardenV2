import React, { useState, useEffect } from "react";
import { Achievement, ThemeColor } from "../types";
import { THEMES } from "../constants";
import { TrophyIcon } from "./icons/TrophyIcon";
import { XIcon } from "./icons/XIcon";

interface AchievementToastProps {
  queue: Achievement[];
  onDismiss: () => void;
  themeColor: ThemeColor;
}

const AchievementToast: React.FC<AchievementToastProps> = ({
  queue,
  onDismiss,
  themeColor,
}) => {
  const [currentAchievement, setCurrentAchievement] =
    useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const theme = THEMES[themeColor] || THEMES.blue;

  useEffect(() => {
    if (queue.length > 0 && !currentAchievement) {
      setCurrentAchievement(queue[0]);
      setIsVisible(true);
    }
  }, [queue, currentAchievement]);

  const handleDismiss = () => {
    setIsVisible(false); // Trigger fade-out animation
    setTimeout(() => {
      onDismiss(); // Remove from parent queue
      setCurrentAchievement(null); // Reset local state
    }, 500); // Wait for animation to finish
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(handleDismiss, 4000); // Auto-dismiss after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      {currentAchievement && (
        <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-3 pl-5 pr-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500">
            <TrophyIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-grow">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Logro Desbloqueado
            </p>
            <p className="font-bold">{currentAchievement.title}!</p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
            aria-label="Cerrar notificación"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AchievementToast;
