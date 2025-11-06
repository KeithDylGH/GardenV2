import React, { useState, useEffect } from 'react';
import { ThemeColor, Shape, ThemeMode } from '../types';
import { THEME_LIST, THEMES } from '../constants';
import { UserIcon } from './icons/UserIcon';
import { FlowerIcon } from './icons/FlowerIcon';
import { CircleIcon } from './icons/CircleIcon';
import { HeartIcon } from './icons/HeartIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SolidCircleIcon } from './icons/SolidCircleIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, goal: number, date: Date, shape: Shape, color: ThemeColor, mode: ThemeMode) => void;
  currentName: string;
  currentGoal: number;
  currentDate: Date;
  currentShape: Shape;
  currentColor: ThemeColor;
  currentThemeMode: ThemeMode;
  performanceMode: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentName,
  currentGoal,
  currentDate,
  currentShape,
  currentColor,
  currentThemeMode,
  performanceMode,
}) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [date, setDate] = useState('');
  const [shape, setShape] = useState<Shape>('flower');
  const [color, setColor] = useState<ThemeColor>('blue');
  const [mode, setMode] = useState<ThemeMode>('light');
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const theme = THEMES[color] || THEMES.blue;
  
  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setGoal(String(currentGoal));
      setDate(currentDate.toISOString().split('T')[0]);
      setShape(currentShape);
      setColor(currentColor);
      setMode(currentThemeMode);
    }
  }, [isOpen, currentName, currentGoal, currentDate, currentShape, currentColor, currentThemeMode]);
  
  const handleSave = () => {
    const goalValue = parseInt(goal, 10);
    const dateParts = date.split('-').map(Number);
    const dateValue = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

    if (!isNaN(goalValue) && goalValue > 0 && date && !isNaN(dateValue.getTime())) {
      onSave(name, goalValue, dateValue, shape, color, mode);
    }
  };
  
  const handleColorSelect = (selectedColor: ThemeColor) => {
    setColor(selectedColor);
    if (selectedColor === 'bw') {
      setMode('black');
    }
  };

  const shapeOptions: { name: Shape; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { name: 'flower', Icon: FlowerIcon },
    { name: 'circle', Icon: CircleIcon },
    { name: 'heart', Icon: HeartIcon },
  ];

  const isBwTheme = color === 'bw';

  return (
    <div
      className={`fixed inset-0 z-50 ${hasBeenOpened ? 'transition-colors duration-300' : ''} ${isOpen ? 'bg-black/40' : 'bg-transparent pointer-events-none'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className={`fixed bottom-0 left-0 right-0 flex flex-col max-h-[90vh] bg-gray-100 dark:bg-slate-900 rounded-t-2xl shadow-2xl ${hasBeenOpened ? `transition-transform ${performanceMode ? 'duration-0' : 'duration-300'} ease-in-out` : ''} ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3" />
        
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="settings-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 mx-auto">
            Configuración
          </h2>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-6 bg-white dark:bg-slate-800 p-4 rounded-xl">
            {/* Name */}
            <div>
              <label htmlFor="name-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tu Nombre</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </span>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Precursor"
                  className={`w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${theme.ring} outline-none`}
                />
              </div>
            </div>
            
            {/* Goal and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="goal-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meta (hrs)</label>
                <input
                  id="goal-input"
                  type="number"
                  min="1"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Ej: 50"
                  className={`w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${theme.ring} outline-none`}
                />
              </div>
              <div>
                <label htmlFor="date-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mes</label>
                <input
                  id="date-input"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    if (e.target.value) {
                      setDate(e.target.value)
                    }
                  }}
                  className={`w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${theme.ring} outline-none`}
                />
              </div>
            </div>
            
             {/* Theme Mode */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tema</label>
              <div className={`flex gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg ${isBwTheme ? 'opacity-50' : ''}`}>
                  <button
                    onClick={() => setMode('light')}
                    disabled={isBwTheme}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-semibold ${
                      mode === 'light' ? `${theme.bg} text-white shadow` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50'
                    } ${isBwTheme ? 'cursor-not-allowed' : ''}`}
                    aria-pressed={mode === 'light'}
                  >
                    <SunIcon className="w-5 h-5" />
                    <span>Claro</span>
                  </button>
                  <button
                    onClick={() => setMode('dark')}
                    disabled={isBwTheme}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-semibold ${
                      mode === 'dark' ? `${theme.bg} text-white shadow` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50'
                    } ${isBwTheme ? 'cursor-not-allowed' : ''}`}
                    aria-pressed={mode === 'dark'}
                  >
                    <MoonIcon className="w-5 h-5" />
                    <span>Oscuro</span>
                  </button>
                  <button
                    onClick={() => setMode('black')}
                    disabled={isBwTheme}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-semibold ${
                      mode === 'black' ? `${theme.bg} text-white shadow` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50'
                    } ${isBwTheme ? 'cursor-not-allowed' : ''}`}
                    aria-pressed={mode === 'black'}
                  >
                    <SolidCircleIcon className="w-5 h-5" />
                    <span>Negro</span>
                  </button>
              </div>
               {isBwTheme && <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">El tema Blanco y Negro requiere el modo Negro.</p>}
            </div>


            {/* Shape */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Forma</label>
              <div className="flex justify-around space-x-2">
                {shapeOptions.map(({ name: shapeName, Icon }) => (
                  <button
                    key={shapeName}
                    onClick={() => setShape(shapeName)}
                    className={`flex-1 p-3 border-2 rounded-lg flex items-center justify-center ${
                      shape === shapeName ? `${THEMES[color].text} border-current bg-blue-50/50 dark:bg-slate-700/50` : 'border-slate-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    aria-pressed={shape === shapeName}
                  >
                    <Icon className={`w-8 h-8 ${shape === shapeName ? 'text-current' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="sr-only">{shapeName}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
              <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
                {THEME_LIST.map((themeOption) => (
                  <button
                    key={themeOption.name}
                    onClick={() => handleColorSelect(themeOption.name)}
                    className={`w-full h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${themeOption.gradientFrom} ${themeOption.gradientTo} ${!performanceMode && 'transition-transform transform hover:scale-110'}`}
                    aria-label={`Seleccionar color ${themeOption.name}`}
                    aria-pressed={color === themeOption.name}
                  >
                    {color === themeOption.name && (
                      <CheckIcon className={`w-6 h-6 ${themeOption.name === 'bw' ? 'text-slate-900' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
          <button
            onClick={handleSave}
            className={`w-full px-6 py-3 rounded-lg ${theme.bg} ${color === 'bw' ? 'text-slate-900' : 'text-white'} font-bold text-lg shadow-md ${!performanceMode && 'transition-transform transform hover:scale-105'}`}
          >
            Guardar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;