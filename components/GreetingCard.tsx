
import React from 'react';
import { ThemeColor } from '../types';
import { THEMES } from '../constants';

interface GreetingCardProps {
  userName: string;
  themeColor: ThemeColor;
  performanceMode: boolean;
  isSimpleMode: boolean;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Buenos días';
  } else if (hour < 19) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
};

const GreetingCard: React.FC<GreetingCardProps> = ({ userName, themeColor, performanceMode = false, isSimpleMode }) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const animationClass = performanceMode ? '' : 'animate-fadeInUp';

  if (isSimpleMode) {
    return (
      <div className={`mt-8 text-center ${animationClass}`}>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Modo Simplificado Activado
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
          Funciones como estadísticas, modo espejo y logros están ocultas para una experiencia más sencilla.
        </p>
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className={`mt-8 text-center ${animationClass}`}>
      <h2 className={`text-2xl font-semibold text-slate-700 dark:text-slate-300`}>
        {greeting}, <span className={`font-bold ${theme.text}`}>{userName}</span>.
      </h2>
    </div>
  );
};

export default GreetingCard;