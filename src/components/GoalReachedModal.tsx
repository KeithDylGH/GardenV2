import React, { useState, useEffect } from "react";
import { THEMES } from "../constants";
import { ThemeColor } from "../types";
import { TrophyIcon } from "./icons/TrophyIcon";

interface GoalReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  goal: number;
  themeColor: ThemeColor;
  performanceMode: boolean;
}

const GoalReachedModal: React.FC<GoalReachedModalProps> = ({
  isOpen,
  onClose,
  userName,
  goal,
  themeColor,
  performanceMode,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  if (!hasBeenOpened) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-title"
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
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500 mb-4">
            <TrophyIcon className="w-9 h-9 text-white" />
          </div>
          <h2
            id="goal-title"
            className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          >
            ¡Meta Alcanzada!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            ¡Felicidades, <span className="font-bold">{userName}</span>! Has
            completado tu meta de {goal} horas para este mes. ¡Jehová ve y
            valora tu gran esfuerzo!
          </p>
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 rounded-lg ${
              theme.bg
            } text-white font-bold text-lg shadow-lg transition-transform ${
              !performanceMode && "transform hover:scale-105"
            }`}
          >
            ¡Seguir Adelante!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalReachedModal;
