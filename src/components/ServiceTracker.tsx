import React from "react";
import ShapeProgress from "./FlowerProgress";
import Timer from "./Timer";
import PaceTracker from "./PaceTracker";
import StatsView from "./StatsView";
import {
  ThemeColor,
  Shape,
  HistoryLog,
  ActivityItem,
  UserRole,
} from "../types";
import { THEMES } from "../constants";
import { HelpIcon } from "./icons/HelpIcon";
import { EyeIcon } from "./icons/EyeIcon";
import { EyeSlashIcon } from "./icons/EyeSlashIcon";
import { GhostIcon } from "./icons/GhostIcon";
import { hoursToHHMM } from "../utils";
import { ShareIcon } from "./icons/ShareIcon";
import WeekdayCircle from "./WeekdayCircle";
import ServiceYearProgressIndicator from "./ServiceYearProgressIndicator";
import BibleStudiesIndicator from "./BibleStudiesIndicator";

interface ServiceTrackerProps {
  currentHours: number;
  currentLdcHours: number;
  goal: number;
  userRole: UserRole;
  currentDate: Date;
  onEditClick: () => void;
  onEditLdcClick: () => void;
  onAddHours: (hours: number) => void;
  progressShape: Shape;
  themeColor: ThemeColor;
  onHelpClick: () => void;
  onShareReport: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => Promise<void>;
  performanceMode: boolean;
  isPrivacyMode: boolean;
  onTogglePrivacyMode: () => void;
  isGhostMode: boolean;
  onToggleGhostMode: () => void;
  previousMonthHistory: HistoryLog;
  isStatsMode: boolean;
  archives: Record<string, HistoryLog>;
  currentServiceYear: string;
  activities: ActivityItem[];
  isSimpleMode: boolean;
}

const ServiceTracker: React.FC<ServiceTrackerProps> = ({
  currentHours,
  currentLdcHours,
  goal,
  userRole,
  currentDate,
  onEditClick,
  onEditLdcClick,
  onAddHours,
  progressShape,
  themeColor,
  onHelpClick,
  onShareReport,
  notificationPermission,
  onRequestNotificationPermission,
  performanceMode,
  isPrivacyMode,
  onTogglePrivacyMode,
  isGhostMode,
  onToggleGhostMode,
  previousMonthHistory,
  isStatsMode,
  archives,
  currentServiceYear,
  activities,
  isSimpleMode,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;

  const privacyBlur = isPrivacyMode
    ? "blur-md select-none pointer-events-none"
    : "";

  const percentage = goal > 0 ? Math.min((currentHours / goal) * 100, 100) : 0;
  const remainingHours = Math.max(0, goal - currentHours);

  const textSizeClass =
    progressShape === "circle"
      ? "text-5xl md:text-6xl"
      : "text-4xl md:text-5xl";

  const isPioneer = userRole !== "publisher";

  return (
    <div
      className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 w-full max-w-2xl mx-auto transition-[padding-bottom] duration-300 ${
        isStatsMode ? "pb-6" : ""
      }`}
    >
      <div className="grid grid-cols-3 items-center mb-2">
        {!isSimpleMode ? (
          <div className="flex justify-start items-center space-x-1">
            <button
              onClick={onTogglePrivacyMode}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={isPrivacyMode ? "Mostrar horas" : "Ocultar horas"}
            >
              {isPrivacyMode ? (
                <EyeSlashIcon className="w-6 h-6" />
              ) : (
                <EyeIcon className="w-6 h-6" />
              )}
            </button>
            {isPioneer && (
              <button
                id="ghost-mode-toggle"
                onClick={onToggleGhostMode}
                className={`p-2 rounded-full transition-colors ${
                  isGhostMode
                    ? theme.text + " " + theme.bg + " bg-opacity-10"
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                }`}
                aria-label={
                  isGhostMode
                    ? "Ocultar ritmo del mes pasado"
                    : "Mostrar ritmo del mes pasado"
                }
              >
                <GhostIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        ) : (
          <div />
        )}
        <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          Meta: {isPrivacyMode ? "**" : goal} hrs
        </p>
        <div className="flex justify-end items-center space-x-1">
          {!isSimpleMode && (
            <button
              onClick={onHelpClick}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Ayuda"
            >
              <HelpIcon className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={onShareReport}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Compartir informe"
          >
            <ShareIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div
            id="progress-display-container"
            className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center"
          >
            <ShapeProgress
              progress={percentage / 100}
              shape={progressShape}
              themeColor={themeColor}
              isPrivacyMode={isPrivacyMode}
            />
            <button
              onClick={onEditClick}
              className="absolute inset-0 flex flex-col items-center justify-center text-center cursor-pointer group rounded-full"
              aria-label="Editar horas totales"
            >
              <div className="transition-transform group-hover:scale-105">
                <p
                  className={`${textSizeClass} font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-all ${privacyBlur}`}
                >
                  {isPrivacyMode ? "**:**" : hoursToHHMM(currentHours)}
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Horas
                </p>
              </div>
            </button>
          </div>
          {!isPrivacyMode &&
            isPioneer &&
            (currentLdcHours > 0 || (!isSimpleMode && isStatsMode)) && (
              <button
                onClick={onEditLdcClick}
                className={`flex flex-col items-center justify-center animate-fadeIn group`}
                aria-label="Editar horas LDC"
              >
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700/50 flex flex-col items-center justify-center text-center border border-slate-200 dark:border-slate-600 transition-transform group-hover:scale-105">
                  <p
                    className={`text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-all ${privacyBlur}`}
                  >
                    {isPrivacyMode ? "**:**" : hoursToHHMM(currentLdcHours)}
                  </p>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                  Horas LDC
                </p>
              </button>
            )}
        </div>

        {isStatsMode && !isSimpleMode && (
          <div className="flex items-center justify-around w-full max-w-sm mx-auto mb-4 -mt-2">
            <ServiceYearProgressIndicator
              currentDate={currentDate}
              isPrivacyMode={isPrivacyMode}
            />
            <WeekdayCircle themeColor={themeColor} />
            <BibleStudiesIndicator
              currentDate={currentDate}
              activities={activities}
              isPrivacyMode={isPrivacyMode}
            />
          </div>
        )}

        {!isSimpleMode && (
          <div
            className={`w-full grid grid-cols-2 gap-4 text-center mb-4 transition-all ${privacyBlur}`}
          >
            <div>
              <p className="text-4xl font-bold text-slate-700 dark:text-slate-200">
                {isPrivacyMode ? "**:**" : hoursToHHMM(remainingHours)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Restantes
              </p>
            </div>
            <div>
              <p className={`text-4xl font-bold ${theme.text}`}>
                {isPrivacyMode ? "**%" : `${percentage.toFixed(0)}%`}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Completado
              </p>
            </div>
          </div>
        )}

        {isSimpleMode && (
          <div
            className={`w-full max-w-xs mx-auto my-4 transition-all ${privacyBlur}`}
          >
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} transition-[width] duration-500`}
                style={{ width: isPrivacyMode ? "0%" : `${percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 px-1">
              <span>0</span>
              <span>{isPrivacyMode ? "**%" : `${percentage.toFixed(0)}%`}</span>
              <span>{isPrivacyMode ? "**" : goal}</span>
            </div>
          </div>
        )}

        {!isSimpleMode && (
          <div className="w-full px-4 mb-4">
            <PaceTracker
              currentHours={currentHours}
              goal={goal}
              currentDate={currentDate}
              themeColor={themeColor}
              isPrivacyMode={isPrivacyMode}
              isGhostMode={isGhostMode}
              previousMonthHistory={previousMonthHistory}
              isPioneer={isPioneer}
            />
          </div>
        )}

        <div
          id="timer-section"
          className="w-full border-t border-slate-200/80 dark:border-slate-700/80 pt-4"
        >
          {isStatsMode && !isSimpleMode ? (
            <StatsView
              archives={archives}
              currentServiceYear={currentServiceYear}
              currentDate={currentDate}
              currentHours={currentHours}
              goal={goal}
              isPrivacyMode={isPrivacyMode}
              themeColor={themeColor}
            />
          ) : (
            <Timer
              onFinish={onAddHours}
              themeColor={themeColor}
              notificationPermission={notificationPermission}
              onRequestNotificationPermission={onRequestNotificationPermission}
              performanceMode={performanceMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceTracker;
