import React, { useState, useEffect } from "react";
import { ThemeColor } from "../types";
import { THEMES } from "../constants";
import { LightBulbIcon } from "./icons/LightBulbIcon";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayTutorial: () => void;
  themeColor: ThemeColor;
  performanceMode: boolean;
}

const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onReplayTutorial,
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

  const handleReplay = () => {
    onReplayTutorial();
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        hasBeenOpened ? "transition-colors duration-300" : ""
      } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
    >
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-slate-900 rounded-t-2xl shadow-2xl ${
          hasBeenOpened
            ? `transition-transform ${
                performanceMode ? "duration-0" : "duration-300"
              } ease-in-out`
            : ""
        } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3" />

        <div className="p-6 text-center">
          <div
            className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} mb-4`}
          >
            <LightBulbIcon className="w-8 h-8 text-white" />
          </div>
          <h2
            id="help-title"
            className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          >
            ¿Necesitas ayuda?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            ¿Quieres volver a ver el tutorial interactivo para esta sección?
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleReplay}
              className={`w-full px-6 py-3 rounded-lg ${
                theme.bg
              } text-white font-bold text-lg shadow-lg transition-transform ${
                !performanceMode && "transform hover:scale-105"
              }`}
            >
              Sí, mostrar guía
            </button>
            <button
              onClick={onClose}
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

export default HelpModal;
