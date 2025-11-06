import React from "react";
import { ThemeColor } from "../types";
import { THEMES } from "../constants";
import { LightBulbIcon } from "./icons/LightBulbIcon";

interface TutorialConfirmationModalProps {
  isOpen: boolean;
  onStart: () => void;
  onSkip: () => void;
  themeColor: ThemeColor;
  viewName: string;
  performanceMode: boolean;
}

const TutorialConfirmationModal: React.FC<TutorialConfirmationModalProps> = ({
  isOpen,
  onStart,
  onSkip,
  themeColor,
  viewName,
  performanceMode,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[99] bg-black/40 flex items-center justify-center p-4 ${
        !performanceMode && "animate-fadeIn"
      }`}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center ${
          !performanceMode && "animate-fadeInUp"
        }`}
      >
        <div
          className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} mb-4`}
        >
          <LightBulbIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Guía para {viewName}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Parece que es tu primera vez aquí. ¿Quieres un rápido recorrido por
          esta sección?
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={onStart}
            className={`w-full px-6 py-3 rounded-lg ${
              theme.bg
            } text-white font-bold text-lg shadow-lg transition-transform ${
              !performanceMode && "transform hover:scale-105"
            }`}
          >
            Sí, mostrar guía
          </button>
          <button
            onClick={onSkip}
            className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            No, gracias
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialConfirmationModal;
