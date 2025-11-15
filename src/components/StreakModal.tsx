import React, { useState, useEffect, useMemo } from "react";
import { ThemeColor } from "../types";
import { THEMES } from "../constants";
import { FlameIcon } from "./icons/FlameIcon";
import { InformationCircleIcon } from "./icons/InformationCircleIcon";
import { ShieldCheckIcon } from "./icons/ShieldCheckIcon";
import { isWeekend } from "../utils";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  themeColor: ThemeColor;
  protectedDay: number | null;
  onSaveProtectedDay: (day: number | null) => void;
  protectedDaySetDate: string | null;
  meetingDays: number[];
  performanceMode: boolean;
}

const weekDays = [
  { label: "L", value: 1 }, // Lunes
  { label: "M", value: 2 }, // Martes
  { label: "M", value: 3 }, // Miércoles
  { label: "J", value: 4 }, // Jueves
  { label: "V", value: 5 }, // Viernes
];

const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streak,
  themeColor,
  protectedDay,
  onSaveProtectedDay,
  protectedDaySetDate,
  meetingDays,
  performanceMode,
}) => {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const theme = THEMES[themeColor] || THEMES.blue;

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  const { isLocked, canChangeUntil } = useMemo(() => {
    if (!protectedDaySetDate) return { isLocked: false, canChangeUntil: null };
    const setDate = new Date(protectedDaySetDate);
    const today = new Date();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const isLocked = today.getTime() - setDate.getTime() < sevenDays;

    if (!isLocked) return { isLocked: false, canChangeUntil: null };

    const canChangeDate = new Date(setDate);
    canChangeDate.setDate(canChangeDate.getDate() + 7);
    return {
      isLocked: true,
      canChangeUntil: canChangeDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      }),
    };
  }, [protectedDaySetDate]);

  const handleDayClick = (dayValue: number) => {
    if (isLocked || meetingDays.includes(dayValue)) return;
    if (protectedDay === dayValue) {
      onSaveProtectedDay(null); // Deseleccionar
    } else {
      onSaveProtectedDay(dayValue);
    }
  };

  const today = new Date();
  const isProtectedToday =
    isWeekend(today) ||
    (protectedDay !== null && today.getDay() === protectedDay);

  return (
    <div
      className={`fixed inset-0 z-50 ${
        hasBeenOpened ? "transition-colors duration-300" : ""
      } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-title"
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
        <div className="p-6">
          <div className="flex flex-col items-center bg-white dark:bg-slate-800 rounded-2xl shadow-inner p-6">
            <h2
              id="streak-title"
              className="text-xl font-bold text-slate-800 dark:text-slate-100"
            >
              Racha de Días
            </h2>

            <div
              className={`flex items-center space-x-4 my-6 text-7xl font-bold ${theme.text} animate-fadeInUp`}
            >
              <span className="tracking-tighter">{streak}</span>
              <FlameIcon className="w-16 h-16" />
            </div>

            {isProtectedToday && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-lg mb-6 animate-fadeIn">
                <ShieldCheckIcon className="w-5 h-5" />
                <span className="font-semibold">
                  ¡Tu racha está protegida hoy!
                </span>
              </div>
            )}

            <div className="w-full text-center space-y-4">
              <div>
                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300">
                  Día de descanso semanal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Elige un día para proteger tu racha, además del fin de semana.
                </p>
                <div className="flex justify-center gap-2">
                  {weekDays.map((day) => {
                    const isMeetingDay = meetingDays.includes(day.value);
                    const isSelected = protectedDay === day.value;

                    let buttonClass =
                      "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-400";
                    if (isMeetingDay) {
                      buttonClass =
                        "bg-slate-300/50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed";
                    } else if (isSelected) {
                      buttonClass = `${theme.bg} text-white border-transparent shadow-md`;
                    }

                    return (
                      <button
                        key={day.value}
                        onClick={() => handleDayClick(day.value)}
                        disabled={isLocked || isMeetingDay}
                        title={isMeetingDay ? "Este es un día de reunión" : ""}
                        className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center border-2 transition-all ${buttonClass} ${
                          isLocked && !isMeetingDay
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {isLocked && canChangeUntil && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Podrás cambiarlo de nuevo el {canChangeUntil}.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-700/80 w-full">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold w-full"
              >
                <InformationCircleIcon className="w-5 h-5" />
                <span>¿Cómo funciona la racha?</span>
              </button>
              {showHelp && (
                <div className="mt-4 text-xs text-left text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg space-y-2 animate-fadeIn">
                  <p>
                    ✅ Tu racha aumenta por cada día consecutivo que registras
                    horas.
                  </p>
                  <p>
                    🛡️ Los{" "}
                    <strong>sábados, domingos y tu día de descanso</strong>{" "}
                    semanal no rompen tu racha.
                  </p>
                  <p>
                    ❗️ Si olvidas registrar horas un día no protegido, tu racha
                    se reiniciará.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakModal;
