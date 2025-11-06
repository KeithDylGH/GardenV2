import React, { useState, useEffect } from 'react';
import { THEMES } from '../constants';
import { ThemeColor } from '../types';
import { GardenIcon } from './icons/GardenIcon';

interface StreakTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHoursClick: () => void;
  themeColor: ThemeColor;
  performanceMode: boolean;
  currentHours: number;
}

const StreakTutorialModal: React.FC<StreakTutorialModalProps> = ({ isOpen, onClose, onAddHoursClick, themeColor, performanceMode, currentHours }) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  if (!hasBeenOpened) return null;

  const hasLoggedHours = currentHours > 0;

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${isOpen ? 'bg-black/60' : 'bg-transparent pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-tutorial-title"
      onClick={onClose}
    >
      <div className={`fixed inset-0 flex items-center justify-center p-4 transition-opacity ${performanceMode ? 'duration-0' : 'duration-300'} ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center ${!performanceMode && isOpen ? 'animate-boingIn' : ''} ${!isOpen ? 'opacity-0 scale-95' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} mb-4`}>
            <GardenIcon className="w-9 h-9 text-white" />
          </div>
          <h2 id="streak-tutorial-title" className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {hasLoggedHours ? '¡Tu Racha ha Comenzado!' : '¡Comienza tu Racha!'}
          </h2>
          <div className="text-slate-600 dark:text-slate-300 mb-6 text-left space-y-2 text-sm">
            {hasLoggedHours && (
              <p className="font-semibold text-center mb-2">
                ¡Excelente! Ya registraste tus primeras horas y tu racha está en marcha.
              </p>
            )}
            <p>✅ Tu racha aumenta por cada día que registras horas.</p>
            <p>🛡️ Los <strong>fines de semana</strong> y tu <strong>día de descanso</strong> semanal no rompen tu racha.</p>
            <p>❗️ Si olvidas registrar horas un día no protegido, tu racha se reiniciará.</p>
          </div>
          <div className="flex flex-col space-y-3">
            {hasLoggedHours ? (
                 <button
                    onClick={onClose}
                    className={`w-full px-6 py-3 rounded-lg ${theme.bg} text-white font-bold text-lg shadow-lg transition-transform ${!performanceMode && 'transform hover:scale-105'}`}
                >
                    ¡Entendido!
                </button>
            ) : (
                <>
                    <button
                        onClick={onAddHoursClick}
                        className={`w-full px-6 py-3 rounded-lg ${theme.bg} text-white font-bold text-lg shadow-lg transition-transform ${!performanceMode && 'transform hover:scale-105'}`}
                    >
                        Añadir mi primera hora
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Más tarde
                    </button>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakTutorialModal;