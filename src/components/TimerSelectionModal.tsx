import React, { useState, useEffect } from "react";
import { THEMES } from "../constants";
import { ThemeColor } from "../types";
import { ClockIcon } from "./icons/ClockIcon";
import { VestIcon } from "./icons/VestIcon";

interface TimerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStandard: () => void;
  onSelectLdc: () => void;
  themeColor: ThemeColor;
}

const TimerSelectionModal: React.FC<TimerSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectStandard,
  onSelectLdc,
  themeColor,
}) => {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const theme = THEMES[themeColor] || THEMES.blue;

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
      aria-labelledby="selection-title"
    >
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all duration-300"
          style={{ transform: isOpen ? "scale(1)" : "scale(0.95)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            id="selection-title"
            className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-center"
          >
            ¿A dónde van estas horas?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm text-center">
            Selecciona el tipo de horas para registrarlas correctamente.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={onSelectStandard}
              className={`w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-custom transition-all flex items-center space-x-4 group`}
              style={{ borderColor: themeColor === 'custom' ? undefined : '' }}
            >
              <div className={`p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400`}>
                <ClockIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 dark:text-slate-100">Horas de Servicio</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Predicación regular y otras actividades.</p>
              </div>
            </button>

            <button
              onClick={onSelectLdc}
              className={`w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-custom transition-all flex items-center space-x-4 group`}
            >
              <div className={`p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`}>
                <VestIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 dark:text-slate-100">Horas Acreditadas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Construcción y otros proyectos teocráticos.</p>
              </div>
            </button>

            <button
              onClick={onClose}
              className="w-full mt-2 px-6 py-2 rounded-lg text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerSelectionModal;
