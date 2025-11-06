import React, { useState, useMemo, useEffect, useRef } from 'react';
import { THEMES, THEME_LIST } from '../constants';
import { ThemeColor, SetupData, Shape, ThemeMode, UserRole, ThemeConfig } from '../types';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { HeartIcon } from './icons/HeartIcon';
import { HomeIcon } from './icons/HomeIcon';
import { GardenIcon } from './icons/GardenIcon';
import { UserIcon } from './icons/UserIcon';
import ShapeProgress from './FlowerProgress';
import { FlowerIcon } from './icons/FlowerIcon';
import { CircleIcon } from './icons/CircleIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SolidCircleIcon } from './icons/SolidCircleIcon';
import { CheckIcon } from './icons/CheckIcon';
import { GhostIcon } from './icons/GhostIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { flexibleInputToHours } from '../utils';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { PauseIcon } from './icons/PauseIcon';
import { TrophyIcon } from './icons/TrophyIcon';

interface WelcomeProps {
  onFinish: (data: SetupData) => void;
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  progressShape: Shape;
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setProgressShape: (shape: Shape) => void;
  performanceMode: boolean;
}

type Theme = ThemeConfig;

const StreakCounterAnimation: React.FC<{ isActive: boolean, theme: Theme }> = ({ isActive, theme }) => {
  const [count, setCount] = useState(1);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      setCount(1); // Reset on active
      intervalRef.current = window.setInterval(() => {
        setCount(prevCount => {
          if (prevCount >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 100;
          }
          return prevCount + 1;
        });
      }, 25);
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

  return (
    <div className={`text-7xl font-bold ${theme.text} tracking-tighter w-28 text-left animate-fadeIn`}>
      {count}
    </div>
  );
};

const GhostModeVisualExample: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [userWidth, setUserWidth] = useState(0);
  const [ghostLeft, setGhostLeft] = useState(0);

  const userTarget = 65; // User is ahead
  const ghostTarget = 55; // Ghost is behind
  const idealTarget = 60; // Ideal pace

  useEffect(() => {
    let timer: number;
    if (isActive) {
      // Animate in after a short delay to sync with slide transition
      timer = window.setTimeout(() => {
        setUserWidth(userTarget);
        setGhostLeft(ghostTarget);
      }, 300); 
    } else {
      // Reset when not active
      setUserWidth(0);
      setGhostLeft(0);
    }
    return () => clearTimeout(timer);
  }, [isActive]);

  return (
    <div className="w-full max-w-[280px] mx-auto px-2 h-28 flex flex-col justify-center">
      <div className="w-full text-center mb-4">
        <p className="font-semibold text-white">Tu Progreso vs. Mes Pasado</p>
      </div>
      {/* Progress Bar Container */}
      <div className="relative w-full h-8 flex items-center">
        {/* Bar background */}
        <div className="w-full bg-slate-700 rounded-full h-2">
          {/* User's progress bar */}
          <div
            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${userWidth}%` }}
          />
        </div>
        {/* Ideal pace marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-400 rounded-full"
          style={{ left: `${idealTarget}%` }}
          title="Ritmo ideal"
        />
        {/* User's current progress marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full ring-2 ring-slate-400/50 transition-all duration-1000 ease-out"
          style={{ left: `${userWidth}%` }}
          title="Tu progreso"
        />
        {/* Ghost marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `calc(${ghostLeft}% - 10px)` }}
          title="Progreso mes pasado"
        >
          <GhostIcon className="w-5 h-5 text-slate-500" />
        </div>
      </div>
      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
        <span>0 hrs</span>
        <span>Meta</span>
      </div>
    </div>
  );
};

const PrivacyModeVisualExample: React.FC<{ theme: Theme }> = ({ theme }) => (
  <div className="flex flex-col items-center space-y-4 h-28 justify-center">
    <div className="flex items-center space-x-4">
      <p className="text-4xl font-bold text-white">50:00</p>
      <p className="text-4xl font-bold text-white blur-md select-none">50:00</p>
    </div>
    <p className={`text-sm ${theme.text} font-semibold`}>Oculta tus horas con un toque</p>
  </div>
);

const HistoryVisualExample: React.FC<{ theme: Theme }> = ({ theme }) => (
    <div className="w-48 p-2 bg-slate-800/50 rounded-lg">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-1">
            <div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div><div>D</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
            {[...Array(7)].map((_, i) => {
                const hasHours = Math.random() > 0.4;
                const isToday = i === 3;
                return (
                    <div key={i} className={`w-full aspect-square flex items-center justify-center rounded ${
                        isToday ? `border ${theme.text}` : ''
                    } ${
                        hasHours ? 'bg-green-700/60' : 'bg-slate-700/30'
                    }`}>
                        <span className={`text-xs font-semibold ${isToday ? 'text-white' : 'text-slate-400'}`}>{i+8}</span>
                    </div>
                )
            })}
        </div>
    </div>
);

const TimerVisualExample: React.FC<{ theme: Theme }> = ({ theme }) => (
    <div className="flex flex-col items-center space-y-4 h-28 justify-center">
        <p className="text-5xl font-mono font-bold text-white tracking-tight">01:25:47</p>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg ${theme.bg}`}>
            <PauseIcon className="w-7 h-7" />
        </div>
    </div>
);


type Slide = {
  type: 'title' | 'feature' | 'setup' | 'customize';
  title: string;
  icon?: (theme: Theme, isActive?: boolean) => React.ReactNode;
  description?: React.ReactNode | ((name: string, role: UserRole) => React.ReactNode);
  step?: number;
};

const getServiceYearMonthsForSetup = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  let serviceYearStartYear = now.getFullYear();

  if (currentMonth < 8) { 
    serviceYearStartYear -= 1;
  }

  const months = [];
  const serviceYearStartDate = new Date(serviceYearStartYear, 8, 1);

  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(serviceYearStartDate.getFullYear(), serviceYearStartDate.getMonth() + i, 1);
    if (monthDate.getFullYear() > now.getFullYear() || (monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() >= now.getMonth())) {
      break;
    }
    months.push(monthDate);
  }
  return months.reverse(); 
};


const slideData: Slide[] = [
  {
    type: 'title',
    title: "Bienvenida a Garden",
  },
  {
    type: 'feature',
    icon: (_: Theme) => (
        <div className="flex items-center justify-center space-x-6 h-16">
            <HomeIcon className="w-12 h-12 text-white" />
            <ListBulletIcon className="w-12 h-12 text-white" />
            <TrophyIcon className="w-12 h-12 text-white" />
        </div>
    ),
    title: "Todo en un solo lugar",
    description: "La mejor aplicación para registrar tu servicio.",
  },
  {
    type: 'feature',
    icon: (theme: Theme, isActive?: boolean) => (
        <div className="flex items-center justify-center space-x-4">
            <StreakCounterAnimation isActive={isActive ?? false} theme={theme} />
            <GardenIcon className="w-16 h-16 text-white" />
        </div>
    ),
    title: "Mantén tu racha",
    description: "Cada día que registres horas, tu racha aumentará. Los fines de semana y tu día de descanso semanal protegen tu racha para que no la pierdas.",
  },
  {
    type: 'feature',
    icon: (theme: Theme, isActive?: boolean) => <GhostModeVisualExample isActive={isActive ?? false} />,
    title: "Compite contra ti mismo",
    description: "Activa el modo espejo para comparar tu ritmo actual con el del mes pasado. ¡Una excelente forma de mantener la motivación!",
  },
  {
    type: 'feature',
    icon: (theme: Theme) => <TimerVisualExample theme={theme} />,
    title: "Temporizador Integrado",
    description: "Inicia el temporizador cuando comiences a predicar y la app registrará el tiempo por ti. Simple y preciso.",
  },
  {
    type: 'feature',
    icon: (theme: Theme) => <HistoryVisualExample theme={theme} />,
    title: "Tu Historial, Visualizado",
    description: "Navega por tu servicio en un calendario interactivo. Toca cualquier día para añadir o editar tus horas fácilmente.",
  },
  {
    type: 'feature',
    icon: (theme: Theme) => <PrivacyModeVisualExample theme={theme} />,
    title: "Tu Privacidad, Tu Control",
    description: "Con el Modo Privacidad, puedes ocultar tus horas con un solo toque, ideal para cuando estás en público.",
  },
  {
    type: 'feature',
    icon: () => (
        <div className="relative w-28 h-28">
            <ShapeProgress progress={0.75} shape="flower" themeColor="pink" isPrivacyMode={false} />
        </div>
    ),
    title: "Diseño Moderno y Personal",
    description: "Disfruta de una interfaz limpia y personaliza la apariencia de la app con diferentes formas, colores y temas.",
  },
  {
    type: 'setup',
    step: 1,
    title: "Cuéntame de ti",
  },
  {
    type: 'setup',
    step: 2,
    title: "Define tu meta mensual",
  },
  {
    type: 'setup',
    step: 3,
    title: "Ponte al día",
  },
  {
    type: 'setup',
    step: 4,
    title: "Tu Rutina Semanal",
  },
  {
    type: 'customize',
    step: 5,
    title: "Dale tu toque personal",
  },
  {
    type: 'feature',
    title: 'FinalSlide',
    description: '',
  }
];

const RoleButton: React.FC<{label: string, value: UserRole, current: UserRole, onClick: (role: UserRole) => void, theme: Theme}> = ({label, value, current, onClick, theme}) => (
    <button
        type="button"
        onClick={() => onClick(value)}
        className={`w-full p-3 rounded-lg text-sm font-semibold transition-colors border-2 ${current === value ? `${theme.bg} text-white border-transparent` : 'bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600'}`}
    >
        {label}
    </button>
)

const ChangingWordComponent: React.FC<{ isActive: boolean, theme: Theme }> = ({ isActive, theme }) => {
    const changingWords = useMemo(() => ['organizar', 'mejorar', 'disfrutar', 'planificar', 'fortalecer'], []);
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        let intervalId: number | null = null;
        if (isActive) {
            intervalId = window.setInterval(() => {
                setWordIndex(prevIndex => (prevIndex + 1) % changingWords.length);
            }, 2500);
        } else {
            setWordIndex(0); // Reset when not active
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isActive, changingWords.length]);

    return (
        <div className="relative h-14 md:h-16 w-full"> {/* Container to prevent layout shift */}
            {changingWords.map((word, index) => (
                <h1
                    key={word}
                    className={`absolute w-full text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} leading-tight transition-all duration-700 ease-in-out ${index === wordIndex ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
                    style={{ transitionDelay: `${index === wordIndex ? '200ms' : '0ms'}` }}
                >
                    {word}
                </h1>
            ))}
        </div>
    );
};


const Welcome: React.FC<WelcomeProps> = ({ 
  onFinish, 
  themeColor, 
  themeMode, 
  progressShape, 
  setThemeColor, 
  setThemeMode, 
  setProgressShape, 
  performanceMode 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState('Precursor');
  const [role, setRole] = useState<UserRole>('reg_pioneer');
  const [goal, setGoal] = useState(50);
  const [currentMonthHours, setCurrentMonthHours] = useState('');
  const [previousHoursInput, setPreviousHoursInput] = useState<{ [key: string]: string }>({});
  const [meetingDays, setMeetingDays] = useState<Set<number>>(new Set());
  const [protectedDay, setProtectedDay] = useState<number | null>(null);

  const monthsForSetup = useMemo(() => getServiceYearMonthsForSetup(), []);
  const userSelectedTheme = THEMES[themeColor] || THEMES.green;

  useEffect(() => {
    switch (role) {
      case 'publisher':
      case 'aux_pioneer':
        setGoal(30);
        break;
      case 'spec_pioneer':
        setGoal(100);
        break;
      case 'reg_pioneer':
      default:
        setGoal(50);
        break;
    }
  }, [role]);

  const slides = useMemo(() => {
    let stepCounter = 0;
    return slideData.map(slide => {
        if (slide.step) {
            stepCounter++;
            return { ...slide, step: stepCounter };
        }
        return slide;
    });
  }, []);

  const customizeSlideIndex = useMemo(() => slides.findIndex(s => s.title === 'Dale tu toque personal'), [slides]);
  
  const getSlideTheme = (slideIndex: number, slideTitle: string): Theme => {
    if (slideIndex < customizeSlideIndex && slideTitle !== "Dale tu toque personal") {
        if (slideTitle === "Mantén tu racha") return THEMES.orange;
        if (slideTitle === "Compite contra ti mismo") return THEMES.bw;
        if (slideTitle === "Tu Privacidad, Tu Control") return THEMES.indigo;
        return THEMES.green;
    }
    return userSelectedTheme;
  };
  
  const isLastSlide = currentSlide === slides.length - 1;
  const currentSlideData = slides[currentSlide];
  const displayTheme = getSlideTheme(currentSlide, currentSlideData.title);
  const isOnOrAfterCustomize = currentSlide >= customizeSlideIndex;

  let backgroundClasses = 'bg-black';
  if (currentSlideData.title === 'Dale tu toque personal' || (currentSlideData.type === 'setup')) {
    switch (themeMode) {
      case 'light':
        backgroundClasses = 'bg-gray-100';
        break;
      case 'dark':
        backgroundClasses = 'bg-slate-900';
        break;
      case 'black':
        backgroundClasses = 'bg-black';
        break;
    }
  }
  if (isLastSlide) {
    backgroundClasses = 'bg-black';
  }

  useEffect(() => {
    const isDark = (currentSlideData.title === 'Dale tu toque personal' || (currentSlideData.type === 'setup')) ? themeMode !== 'light' : true;
    const isBlack = (currentSlideData.title === 'Dale tu toque personal' || (currentSlideData.type === 'setup')) ? themeMode === 'black' : true;

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('theme-black', isBlack);
  }, [currentSlide, themeMode, currentSlideData]);
  
  const isEffectiveLight = (currentSlideData.title === 'Dale tu toque personal' || (currentSlideData.type === 'setup')) ? themeMode === 'light' : false;

  const mainTextColor = isEffectiveLight ? 'text-slate-900' : 'text-white';
  const subTextColor = isEffectiveLight ? 'text-slate-600' : 'text-slate-400';
  const cardBgColor = isEffectiveLight ? 'bg-white/60' : 'bg-slate-900/60';
  const inputBgColor = isEffectiveLight ? 'bg-white/80' : 'bg-slate-800';
  const inputBorderColor = isEffectiveLight ? 'border-slate-300' : 'border-slate-600';
  
  const TOTAL_SETUP_STEPS = useMemo(() => slides.filter(s => s.step).length, [slides]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      const parsedPreviousHours: { [key: string]: number } = {};
        Object.entries(previousHoursInput).forEach(([key, value]) => {
            const hours = flexibleInputToHours(value as string);
            if (!isNaN(hours) && hours > 0) {
                parsedPreviousHours[key] = hours;
            } else if ((value as string).trim() === '0') {
                parsedPreviousHours[key] = 0;
            }
        });

      onFinish({
        name: name || 'Precursor',
        role,
        goal,
        currentMonthHours: flexibleInputToHours(currentMonthHours) || 0,
        previousHours: parsedPreviousHours,
        meetingDays: Array.from(meetingDays),
        protectedDay,
        protectedDaySetDate: protectedDay !== null ? new Date().toISOString() : null,
      });
    }
  };
  
  const buttonText = isLastSlide ? 'Iniciar' : 'Siguiente';
  
  const isNextDisabled = useMemo(() => {
    const slideTitle = currentSlideData?.title;
    switch (slideTitle) {
      case "Cuéntame de ti":
        return name.trim() === '';
      case "Define tu meta mensual":
        return isNaN(goal) || goal <= 0;
      case "Ponte al día": {
        // Current month hours must be filled and valid (0 is ok).
        const currentHoursNum = flexibleInputToHours(currentMonthHours);
        if (currentMonthHours.trim() === '' || isNaN(currentHoursNum) || currentHoursNum < 0) {
            return true;
        }

        // All previous months must be filled and valid (0 is ok).
        for (const date of monthsForSetup) {
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
            const value = previousHoursInput[dateKey] || '';
            const hoursNum = flexibleInputToHours(value);
            if (value.trim() === '' || isNaN(hoursNum) || hoursNum < 0) {
                return true;
            }
        }
        
        return false; // All good
      }
      case "Tu Rutina Semanal":
        return meetingDays.size === 0 || protectedDay === null;
      default:
        return false;
    }
  }, [currentSlideData, name, goal, currentMonthHours, previousHoursInput, monthsForSetup, meetingDays, protectedDay]);


  const shapeOptions: { name: Shape; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { name: 'flower', Icon: FlowerIcon },
    { name: 'circle', Icon: CircleIcon },
    { name: 'heart', Icon: HeartIcon },
  ];

  const themeOptions: { name: ThemeMode, Icon: React.FC<React.SVGProps<SVGSVGElement>>, label: string }[] = [
    { name: 'light', Icon: SunIcon, label: 'Claro' },
    { name: 'dark', Icon: MoonIcon, label: 'Oscuro' },
    { name: 'black', Icon: SolidCircleIcon, label: 'Negro' },
  ];

  const weekDaysForMeeting = [
    { label: 'D', value: 0 }, { label: 'L', value: 1 }, { label: 'M', value: 2 }, 
    { label: 'M', value: 3 }, { label: 'J', value: 4 }, { label: 'V', value: 5 }, 
    { label: 'S', value: 6 },
  ];

  const weekDaysForRest = [
    { label: 'L', value: 1 }, { label: 'M', value: 2 }, { label: 'M', value: 3 }, 
    { label: 'J', value: 4 }, { label: 'V', value: 5 },
  ];
  
  const handleMeetingDayToggle = (dayValue: number) => {
    setMeetingDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayValue)) {
        newSet.delete(dayValue);
      } else {
        newSet.add(dayValue);
        // If the newly added meeting day is the current protected day, unset the protected day.
        if (protectedDay === dayValue) {
          setProtectedDay(null);
        }
      }
      return newSet;
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 text-center transition-colors duration-500`}>
      <div className={`absolute inset-0 ${backgroundClasses} transition-all duration-500 overflow-hidden`}>
        {(currentSlide < customizeSlideIndex || isLastSlide || currentSlideData.type === 'title' || currentSlideData.type === 'feature') && <div className="absolute -bottom-1/2 -left-1/3 w-[200%] max-w-5xl aspect-square bg-cyan-500/20 rounded-full blur-3xl opacity-90" />}
      </div>
      
      <div className="relative z-10 w-full flex-shrink-0 h-10 flex items-center justify-center">
        {currentSlideData.step && currentSlide !== 0 && (
            <span className={`text-sm font-bold ${isEffectiveLight ? 'text-slate-500' : 'text-slate-400'} animate-fadeIn`}>{currentSlideData.step} / {TOTAL_SETUP_STEPS}</span>
        )}
      </div>
      
      <div className="relative z-10 w-full flex-grow flex flex-col justify-center">
        <div className="relative w-full h-[34rem] overflow-hidden">
          <div 
            className={`absolute top-0 left-0 w-full h-full flex ${!performanceMode ? 'transition-transform duration-500 ease-in-out' : ''}`}
            style={{ transform: `translateX(-${currentSlide * 100}%)`}}
          >
            {slides.map((slide, index) => {
              const slideTheme = getSlideTheme(index, slide.title);
              return (
              <div key={index} className={`w-full h-full flex-shrink-0 flex flex-col relative ${slide.type === 'title' ? 'items-center justify-center' : 'items-center justify-center p-4'}`}>
              
                {slide.type === 'title' && (
                    <div className="flex flex-col items-center justify-center text-center animate-fadeIn z-10 h-full w-full px-4">
                        <GardenIcon className="w-24 h-24 text-white mb-8" />
                        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">Garden te ayuda a</h1>
                        <ChangingWordComponent isActive={currentSlide === index} theme={slideTheme} />
                        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">tu ministerio</h1>
                    </div>
                )}

                {slide.type === 'feature' && (
                   slide.title === 'FinalSlide' ? (
                     <div className="flex flex-col items-center justify-center animate-fadeIn">
                        <h2 className={`text-8xl font-logotype ${mainTextColor}`}>Garden</h2>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 h-28 flex items-center justify-center">
                        {slide.icon && slide.icon(slideTheme, currentSlide === index)}
                      </div>
                      <h2 className={`text-3xl font-bold ${mainTextColor} mb-3 tracking-tight`}>{slide.title}</h2>
                      <p className={`${subTextColor} max-w-sm leading-relaxed`}>
                        {(() => {
                          if (typeof slide.description === 'function') {
                            return slide.description(name, role);
                          }
                          return slide.description;
                        })()}
                      </p>
                    </>
                  )
                )}

                {(slide.type === 'customize' || slide.type === 'setup') && (
                  <>
                    <h2 className={`text-3xl font-bold ${mainTextColor} mb-4 tracking-tight`}>{slide.title}</h2>
                    <div className={`w-full max-w-sm text-left space-y-4 ${cardBgColor} p-4 rounded-xl shadow-inner h-full max-h-96 flex flex-col`}>
                      
                      {slide.title === 'Cuéntame de ti' && (
                        <div className="space-y-4">
                          <div>
                            <label className={`text-sm font-medium ${subTextColor}`}>Tu nombre</label>
                            <div className="relative mt-1">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full pl-10 pr-4 py-2 ${inputBgColor} border ${inputBorderColor} rounded-lg focus:ring-2 ${displayTheme.ring} outline-none transition`} />
                            </div>
                          </div>
                          <div>
                            <label className={`text-sm font-medium ${subTextColor}`}>Tu rol en el servicio</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <RoleButton label="Publicador" value="publisher" current={role} onClick={setRole} theme={displayTheme} />
                                <RoleButton label="Precursor Auxiliar" value="aux_pioneer" current={role} onClick={setRole} theme={displayTheme} />
                                <RoleButton label="Precursor Regular" value="reg_pioneer" current={role} onClick={setRole} theme={displayTheme} />
                                <RoleButton label="Precursor Especial" value="spec_pioneer" current={role} onClick={setRole} theme={displayTheme} />
                            </div>
                          </div>
                        </div>
                      )}

                      {slide.title === 'Define tu meta mensual' && (
                        <div>
                            <label htmlFor="goal-input" className={`text-sm font-medium ${subTextColor}`}>Basado en tu rol, te sugerimos una meta, pero puedes ajustarla.</label>
                            <input
                                id="goal-input"
                                type="number"
                                value={goal}
                                onChange={(e) => setGoal(parseInt(e.target.value, 10))}
                                className={`w-full mt-2 p-3 text-center text-2xl font-bold ${inputBgColor} border ${inputBorderColor} rounded-lg focus:ring-2 ${displayTheme.ring} outline-none transition`}
                                inputMode="numeric"
                            />
                        </div>
                      )}

                      {slide.title === 'Ponte al día' && (
                        <div className="flex-grow flex flex-col min-h-0">
                          <div className="flex-shrink-0 mb-4">
                            <label className={`text-sm font-medium ${subTextColor}`}>{'¿Cuántas horas has hecho hasta hoy en el mes actual?'}</label>
                            <input type="text" value={currentMonthHours} onChange={(e) => setCurrentMonthHours(e.target.value)} placeholder="0:00" className={`w-full mt-2 p-3 text-center text-xl ${inputBgColor} border ${inputBorderColor} rounded-lg focus:ring-2 ${displayTheme.ring} outline-none transition`} inputMode="decimal" />
                          </div>
                          
                          <div className="flex-grow flex flex-col min-h-0">
                            <div className="flex-shrink-0">
                              <label className={`text-sm font-medium ${subTextColor}`}>Horas de meses pasados</label>
                              <p className="text-xs text-slate-400 mt-1">Ingresa el total de cada mes para un historial más completo y para activar el 'Modo Espejo'.</p>
                            </div>
                            <div className="mt-2 space-y-2 overflow-y-auto pr-2 flex-grow">
                              {monthsForSetup.map(date => {
                                  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
                                  const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
                                  return (
                                      <div key={dateKey} className={`flex items-center justify-between p-2 ${isEffectiveLight ? 'bg-slate-500/10' : 'bg-slate-800/50'} rounded-lg`}>
                                          <span className={`${subTextColor} capitalize text-sm font-medium`}>{monthName}</span>
                                          <input 
                                              type="text" 
                                              placeholder="0"
                                              value={previousHoursInput[dateKey] || ''}
                                              onChange={(e) => setPreviousHoursInput(prev => ({...prev, [dateKey]: e.target.value}))}
                                              className={`w-24 px-2 py-1 ${isEffectiveLight ? 'bg-slate-200' : 'bg-slate-700/80'} border ${inputBorderColor} rounded-lg text-right focus:ring-2 ${displayTheme.ring} outline-none transition`}
                                              inputMode="decimal"
                                          />
                                      </div>
                                  )
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {slide.title === 'Tu Rutina Semanal' && (
                        <div className="space-y-4">
                           <div>
                              <label className={`text-sm font-medium ${subTextColor}`}>Marca tus días de reunión</label>
                              <div className="flex justify-center gap-1.5 mt-2">
                                  {weekDaysForMeeting.map(day => (
                                      <button 
                                          key={`meeting-${day.value}`}
                                          onClick={() => handleMeetingDayToggle(day.value)}
                                          className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center border-2 transition-all ${
                                              meetingDays.has(day.value) 
                                              ? `${displayTheme.bg} text-white border-transparent shadow-sm` 
                                              : `${inputBgColor} ${subTextColor} ${inputBorderColor} hover:border-slate-400 dark:hover:border-slate-400`
                                          }`}
                                      >
                                          {day.label}
                                      </button>
                                  ))}
                              </div>
                           </div>
                           <div>
                              <label className={`text-sm font-medium ${subTextColor}`}>Elige tu día de descanso</label>
                              <p className="text-xs text-slate-400 mt-1">Este día protegerá tu racha, además del fin de semana. Podrás cambiarlo cada 7 días.</p>
                              <div className="flex justify-center gap-2 mt-2">
                                  {weekDaysForRest.map(day => {
                                      const isMeetingDay = meetingDays.has(day.value);
                                      return (
                                      <button 
                                          key={`rest-${day.value}`}
                                          onClick={() => setProtectedDay(p => p === day.value ? null : day.value)}
                                          disabled={isMeetingDay}
                                          title={isMeetingDay ? "Este día ya es un día de reunión" : ""}
                                          className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center border-2 transition-all ${
                                              protectedDay === day.value
                                              ? `${displayTheme.bg} text-white border-transparent shadow-sm` 
                                              : `${inputBgColor} ${subTextColor} ${inputBorderColor} hover:border-slate-400 dark:hover:border-slate-400`
                                          } ${isMeetingDay ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      >
                                          {day.label}
                                      </button>
                                      );
                                  })}
                              </div>
                           </div>
                        </div>
                      )}

                      {slide.title === "Dale tu toque personal" && (
                         <div className="space-y-3">
                            <div className="relative w-28 h-28 mx-auto mb-2">
                                <ShapeProgress progress={0.75} shape={progressShape} themeColor={themeColor} isPrivacyMode={false} />
                            </div>
                            <div>
                              <label className={`block text-center text-sm font-semibold ${subTextColor} mb-2`}>Forma</label>
                              <div className="flex justify-center space-x-2">
                                {shapeOptions.map(({ name: shapeName, Icon }) => (
                                  <button key={shapeName} onClick={() => setProgressShape(shapeName)} className={`flex-1 p-2 border-2 rounded-lg flex items-center justify-center transition-all ${progressShape === shapeName ? `${userSelectedTheme.text} border-current ${userSelectedTheme.bg} bg-opacity-10` : `${isEffectiveLight ? 'border-slate-300' : 'border-slate-600'} ${inputBgColor} hover:bg-slate-700`}`}>
                                    <Icon className={`w-7 h-7 ${progressShape === shapeName ? 'text-current' : 'text-slate-400'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className={`block text-center text-sm font-semibold ${subTextColor} mb-2`}>Tema</label>
                              <div className={`flex gap-2 p-1 ${isEffectiveLight ? 'bg-slate-200' : 'bg-slate-800'} rounded-lg`}>
                                  {themeOptions.map(option => (
                                      <button key={option.name} onClick={() => setThemeMode(option.name)} className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-md transition-colors text-sm font-semibold ${themeMode === option.name ? `${userSelectedTheme.bg} text-white shadow` : `${subTextColor} hover:bg-slate-700`}`}>
                                          <option.Icon className="w-4 h-4" />
                                          <span>{option.label}</span>
                                      </button>
                                  ))}
                              </div>
                            </div>
                            <div>
                              <label className={`block text-center text-sm font-semibold ${subTextColor} mb-2`}>Color</label>
                              <div className="grid grid-cols-8 gap-2">
                                {THEME_LIST.map((themeOption) => (
                                  <button key={themeOption.name} onClick={() => setThemeColor(themeOption.name)} className={`w-full h-9 rounded-full flex items-center justify-center bg-gradient-to-br ${themeOption.gradientFrom} ${themeOption.gradientTo} transition-transform transform hover:scale-110`}>
                                    {themeColor === themeOption.name && <CheckIcon className={`w-5 h-5 ${themeOption.name === 'bw' ? 'text-slate-900' : 'text-white'}`} />}
                                  </button>
                                ))}
                              </div>
                            </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )})}
          </div>
        </div>
      </div>
      
      <div className="relative z-10 w-full flex-shrink-0 pb-4">
        {currentSlide === 0 ? (
          <div className="w-full max-w-sm mx-auto animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <button
              onClick={handleNext}
              className="w-full bg-white text-slate-900 font-bold text-lg py-4 rounded-2xl shadow-lg transition-transform transform hover:scale-105"
            >
              Empezar
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center space-x-2 mb-8">
              {slides.map((_, index) => (
                <div key={index} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? `${isEffectiveLight ? 'bg-slate-800' : 'bg-white'} w-6` : `${isEffectiveLight ? 'bg-slate-500' : 'bg-slate-600'}`}`} />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`w-full max-w-sm mx-auto py-3 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isLastSlide || currentSlideData.type === 'feature' || currentSlideData.type === 'title'
                  ? `${isEffectiveLight ? 'text-slate-500' : 'text-white'} hover:text-slate-300`
                  : `shadow-lg transform hover:scale-105 disabled:scale-100 ${isEffectiveLight ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`
              }`}
            >
              {buttonText}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Welcome;
