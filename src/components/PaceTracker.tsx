import React, { useMemo } from "react";
import { ThemeColor, HistoryLog, DayEntry } from "../types";
import { THEMES } from "../constants";
import { hoursToHHMM } from "../utils";
import { GhostIcon } from "./icons/GhostIcon";

interface PaceTrackerProps {
  currentHours: number;
  goal: number;
  currentDate: Date;
  themeColor: ThemeColor;
  isPrivacyMode: boolean;
  isGhostMode: boolean;
  previousMonthHistory?: HistoryLog;
  isPioneer: boolean;
}

const PaceTracker: React.FC<PaceTrackerProps> = ({
  currentHours,
  goal,
  currentDate,
  themeColor,
  isPrivacyMode,
  isGhostMode,
  previousMonthHistory,
  isPioneer,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const currentDay = currentDate.getDate();

  const {
    ghostProgressPercent,
    ghostDifference,
    ghostHoursUpToToday,
    isGhostDataAvailable,
  } = useMemo(() => {
    if (!isGhostMode || !previousMonthHistory || !isPioneer) {
      return {
        ghostProgressPercent: 0,
        ghostDifference: 0,
        ghostHoursUpToToday: 0,
        isGhostDataAvailable: false,
      };
    }

    const prevMonthDate = new Date(currentDate);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthYear = prevMonthDate.getFullYear();
    const prevMonthMonth = prevMonthDate.getMonth() + 1;

    const summaryKey = `${prevMonthYear}-${String(prevMonthMonth).padStart(
      2,
      "0"
    )}-SUMMARY`;
    if (previousMonthHistory[summaryKey]?.isSummary) {
      return {
        ghostProgressPercent: 0,
        ghostDifference: 0,
        ghostHoursUpToToday: 0,
        isGhostDataAvailable: false,
      };
    }

    const daysInPrevMonth = new Date(
      prevMonthYear,
      prevMonthMonth,
      0
    ).getDate();
    const dayToCompare = Math.min(currentDay, daysInPrevMonth);

    let cumulativeGhostHours = 0;
    for (let day = 1; day <= dayToCompare; day++) {
      const dateKey = `${prevMonthYear}-${String(prevMonthMonth).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const entry = previousMonthHistory[dateKey];

      if (
        typeof entry === "object" &&
        entry !== null &&
        typeof entry.hours === "number"
      ) {
        cumulativeGhostHours += entry.hours;
      } else if (typeof entry === "number") {
        // Handle legacy data format
        cumulativeGhostHours += entry;
      }
    }

    const difference = currentHours - cumulativeGhostHours;

    const progressPercent =
      goal > 0
        ? Math.max(0, Math.min((cumulativeGhostHours / goal) * 100, 100))
        : 0;

    return {
      ghostProgressPercent: progressPercent,
      ghostDifference: difference,
      ghostHoursUpToToday: cumulativeGhostHours,
      isGhostDataAvailable: true, // Data is daily, not a summary
    };
  }, [
    isGhostMode,
    previousMonthHistory,
    currentHours,
    currentDay,
    currentDate,
    goal,
    isPioneer,
  ]);

  if (goal <= 0) {
    return null;
  }

  const idealHours = (goal / daysInMonth) * currentDay;
  const difference = currentHours - idealHours;

  const isAhead = difference > 0.01;
  const isBehind = difference < -0.01;

  let message: React.ReactNode;
  let textColor = "text-slate-500 dark:text-slate-400";

  if (isGhostMode && isPioneer) {
    if (!isGhostDataAvailable) {
      message = "El 'Modo Espejo' estará disponible el próximo mes.";
    } else if (ghostHoursUpToToday === 0 && currentHours > 0) {
      message = <>¡Excelente! El mes pasado no tenías horas en esta fecha.</>;
      textColor = "text-green-600 dark:text-green-400";
    } else if (ghostHoursUpToToday === 0 && currentHours <= 0) {
      message = "El mes pasado no registraste horas para esta fecha.";
    } else if (ghostDifference > 0.01) {
      message = (
        <>
          Vas <strong>{hoursToHHMM(ghostDifference)} más</strong> que el mes
          pasado en esta misma fecha.
        </>
      );
      textColor = "text-green-600 dark:text-green-400";
    } else if (ghostDifference < -0.01) {
      message = (
        <>
          Vas <strong>{hoursToHHMM(Math.abs(ghostDifference))} menos</strong>{" "}
          que el mes pasado en esta misma fecha.
        </>
      );
      textColor = "text-amber-600 dark:text-amber-400";
    } else {
      message = "Llevas un ritmo casi idéntico al del mes pasado.";
    }
  } else {
    if (isAhead) {
      message = (
        <>
          ¡Vas con muy buen paso! Llevas{" "}
          <strong>{hoursToHHMM(difference)} de ventaja</strong>.
        </>
      );
      textColor = "text-green-600 dark:text-green-400";
    } else if (isBehind) {
      message = (
        <>
          ¡Ánimo! Te faltan{" "}
          <strong>{hoursToHHMM(Math.abs(difference))} para estar al día</strong>
          .
        </>
      );
      textColor = "text-amber-600 dark:text-amber-400";
    } else {
      message = "¡Vas al día con tu meta! Sigue así.";
    }
  }

  const monthProgressPercent = Math.min((currentDay / daysInMonth) * 100, 100);
  const userProgressPercent =
    goal > 0 ? Math.max(0, Math.min((currentHours / goal) * 100, 100)) : 0;

  return (
    <div className="w-full">
      <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-2">
        {/* User's actual progress bar */}
        {!isPrivacyMode && (
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} transition-[width] duration-500`}
            style={{ width: `${userProgressPercent}%` }}
          ></div>
        )}
        {/* "Today" marker indicating ideal progress */}
        {!isPrivacyMode && (
          <div
            className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-slate-500 dark:bg-slate-400 rounded-full"
            style={{ left: `${monthProgressPercent}%` }}
            title={`Ritmo ideal para hoy (${hoursToHHMM(idealHours)} hrs)`}
          ></div>
        )}
        {/* User's current progress marker */}
        {!isPrivacyMode && (
          <div
            className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-white dark:bg-slate-100 rounded-full ring-1 ring-slate-400/50 dark:ring-slate-500/50 transition-all duration-500"
            style={{ left: `${userProgressPercent}%` }}
            title={`Tu progreso actual (${hoursToHHMM(currentHours)} hrs)`}
          ></div>
        )}
        {/* Ghost marker */}
        {isGhostMode && isPioneer && !isPrivacyMode && isGhostDataAvailable && (
          <div
            className="absolute top-[-6px] transition-all duration-500"
            style={{ left: `calc(${ghostProgressPercent}% - 8px)` }}
            title={`Progreso mes pasado: ${hoursToHHMM(
              ghostHoursUpToToday
            )} hrs`}
          >
            <GhostIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        )}
      </div>
      {!isPrivacyMode ? (
        <p className={`text-center text-xs font-medium ${textColor}`}>
          {message}
        </p>
      ) : (
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
          Ritmo oculto
        </p>
      )}
    </div>
  );
};

export default PaceTracker;
