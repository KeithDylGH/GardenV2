import React, { useState, useEffect } from 'react';
import { THEMES } from '../constants';
import { ThemeColor } from '../types';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

interface EndOfYearModalProps {
  isOpen: boolean;
  onArchive: () => void;
  onLater: () => void;
  themeColor: ThemeColor;
  performanceMode: boolean;
  previousYear: string;
}

const EndOfYearModal: React.FC<EndOfYearModalProps> = ({ isOpen, onArchive, onLater, themeColor, performanceMode, previousYear }) => {
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
      className={`fixed inset-0 z-50 transition-colors duration-300 ${isOpen ? 'bg-black/60' : 'bg-transparent pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="eoy-title"
    >
      <div className={`fixed inset-0 flex items-center justify-center p-4 transition-opacity ${performanceMode ? 'duration-0' : 'duration-300'} ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center transform transition-all ${performanceMode ? 'duration-0' : 'duration-300'}`}
          style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)' }}
        >
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} mb-4`}>
            <ArchiveBoxIcon className="w-9 h-9 text-white" />
          </div>
          <h2 id="eoy-title" className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            ¡Feliz Nuevo Año de Servicio!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            El año de servicio {previousYear} ha concluido. ¿Quieres archivar tus horas y comenzar el nuevo año?
          </p>
          <div className="flex flex-col space-y-3">
             <button 
                onClick={onArchive} 
                className={`w-full px-6 py-3 rounded-lg ${theme.bg} text-white font-bold text-lg shadow-lg transition-transform ${!performanceMode && 'transform hover:scale-105'}`}
            >
                Archivar y Empezar
            </button>
            <button 
              onClick={onLater} 
              className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Recordármelo más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndOfYearModal;