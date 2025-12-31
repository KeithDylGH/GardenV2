import React, { useMemo } from "react";
import {
  HistoryLog,
  ThemeColor,
  DayEntry,
  ActivityItem,
  PlanningData,
} from "../types";
import { THEMES } from "../constants";
import { hoursToHHMM, formatDateKey } from "../utils";
import { BookOpenIcon } from "./icons/BookOpenIcon";
import { ArrowUturnLeftIcon } from "./icons/ArrowUturnLeftIcon";
import { VestIcon } from "./icons/VestIcon";
import { ClipboardDocumentListIcon } from "./icons/ClipboardDocumentListIcon";
import { SparklesIcon } from "./icons/SparklesIcon";
import { HomeIcon } from "./icons/HomeIcon";
import { BuildingOfficeIcon } from "./icons/BuildingOfficeIcon";
import WineIcon from "./icons/WineIcon";
import { PlusIcon } from "./icons/PlusIcon";
import { CalendarPlanIcon } from "./icons/CalendarPlanIcon";
import { MedicalIcon } from "./icons/MedicalIcon";
import { COVisitIcon } from "./icons/COVisitIcon";
import { SpecialCampaignIcon } from "./icons/SpecialCampaignIcon";
import { HammerWrenchIcon } from "./icons/HammerWrenchIcon";

interface CalendarGridProps {
  selectedMonth: Date;
  historyLog: HistoryLog;
  onDayClick: (date: Date) => void;
  themeColor: ThemeColor;
  isPrivacyMode: boolean;
  activities: ActivityItem[];
  isSummaryMonth: boolean;
  carryoverHours: number;
  planningData: PlanningData;
  meetingDays: number[];
}

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  dayEntry?: DayEntry;
  hasActivity: boolean;
  hasPlan: boolean;
};

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];

const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedMonth,
  historyLog,
  onDayClick,
  themeColor,
  isPrivacyMode,
  activities,
  isSummaryMonth,
  carryoverHours,
  planningData,
  meetingDays,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const privacyBlur = isPrivacyMode
    ? "blur-sm select-none pointer-events-none"
    : "";

  const activityDates = useMemo(() => {
    const dates = new Set<string>();
    activities.forEach((act) => {
      if (!act.recurring) {
        const d = new Date(act.date);
        dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    return dates;
  }, [activities]);

  const recurringActivitiesByDayOfWeek = useMemo(() => {
    const map = new Map<number, { study: boolean; visit: boolean }>();
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    activities.forEach((act) => {
      if (act.recurring) {
        const actDate = new Date(act.date);
        const isStarted = actDate.getFullYear() < year ||
          (actDate.getFullYear() === year && actDate.getMonth() <= month);
        
        if (isStarted) {
          const days = act.recurringDays && act.recurringDays.length > 0 
            ? act.recurringDays 
            : [actDate.getDay()];
            
          days.forEach(day => {
            const current = map.get(day) || { study: false, visit: false };
            if (act.type === 'study') current.study = true;
            if (act.type === 'visit') current.visit = true;
            map.set(day, current);
          });
        }
      }
    });
    return map;
  }, [activities, selectedMonth]);

  const calendarDays: CalendarDay[] = useMemo(() => {
    const days: CalendarDay[] = [];
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    for (let i = 0; i < startDayOfWeek; i++) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - (startDayOfWeek - i));
      const dateKey = formatDateKey(date);
      const dayBlocks = planningData[dateKey] || [];
      const hasActivity = activityDates.has(
        `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      );
      days.push({
        date,
        isCurrentMonth: false,
        hasActivity,
        hasPlan: dayBlocks.length > 0,
      });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateKey = formatDateKey(date);
      const dayBlocks = planningData[dateKey] || [];
      const hasActivity = activityDates.has(
        `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      );
      days.push({
        date,
        isCurrentMonth: true,
        dayEntry: historyLog[dateKey],
        hasActivity,
        hasPlan: dayBlocks.length > 0,
      });
    }

    const lastDayOfWeek = (lastDayOfMonth.getDay() + 6) % 7;
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const date = new Date(lastDayOfMonth);
      date.setDate(date.getDate() + i);
      const dateKey = formatDateKey(date);
      const dayBlocks = planningData[dateKey] || [];
      const hasActivity = activityDates.has(
        `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      );
      days.push({
        date,
        isCurrentMonth: false,
        hasActivity,
        hasPlan: dayBlocks.length > 0,
      });
    }

    return days;
  }, [selectedMonth, historyLog, activityDates, planningData]);

  const monthTotalHours = useMemo(() => {
    if (isSummaryMonth) {
      const monthKey = `${selectedMonth.getFullYear()}-${String(
        selectedMonth.getMonth() + 1
      ).padStart(2, "0")}-SUMMARY`;
      return historyLog[monthKey]?.hours || 0;
    }
    const dailyTotal = calendarDays.reduce(
      (total, day) =>
        total + (day.isCurrentMonth ? day.dayEntry?.hours || 0 : 0),
      0
    );
    return dailyTotal + carryoverHours;
  }, [calendarDays, isSummaryMonth, selectedMonth, historyLog, carryoverHours]);

  const activeDaysCount = useMemo(() => {
    if (isSummaryMonth) return 0;
    return calendarDays.filter(
      (day) => day.isCurrentMonth && day.dayEntry && day.dayEntry.hours > 0
    ).length;
  }, [calendarDays, isSummaryMonth]);

  return (
    <div>
      <div id="calendar-grid" className="grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((day, i) => (
          <div
            key={`${day}-${i}`}
            className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 pb-2"
          >
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => {
          const { date, isCurrentMonth, dayEntry, hasActivity, hasPlan } = day;
          const isToday = new Date().toDateString() === date.toDateString();
          const hours = dayEntry?.hours || 0;
          const ldcHours = dayEntry?.ldcHours || 0;
          const status = dayEntry?.status;

          const isCampaign = dayEntry?.isCampaign;
          const hasRecurringActivity =
            !isSummaryMonth &&
            isCurrentMonth &&
            recurringActivitiesByDayOfWeek.has(date.getDay());
          const isMeetingDay =
            isCurrentMonth &&
            !isSummaryMonth &&
            meetingDays.includes(date.getDay());

          const dayClasses = [
            "relative h-16 flex flex-col items-center justify-center rounded-lg p-1",
          ];

          if (isCurrentMonth && !isSummaryMonth)
            dayClasses.push("cursor-pointer");
          else dayClasses.push("pointer-events-none");

          if (isToday && !isSummaryMonth)
            dayClasses.push("border-2", theme.text);
          else dayClasses.push("border-2", "border-transparent");

          if (!isCurrentMonth) dayClasses.push("opacity-40");

          if (isCurrentMonth && !isSummaryMonth) {
            dayClasses.push("hover:bg-slate-200 dark:hover:bg-slate-700");

            // Priority: Event > Campaign > Sick > Hours
            if (dayEntry?.event === 'circuit_assembly') {
              dayClasses.push("bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700");
            } else if (dayEntry?.event === 'regional_convention') {
              dayClasses.push("bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700");
            } else if (dayEntry?.event === 'memorial') {
              dayClasses.push("bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-700");
            } else if (dayEntry?.event === 'cleaning') {
              dayClasses.push("bg-teal-100 dark:bg-teal-900/40 border-teal-200 dark:border-teal-700");
            } else if (dayEntry?.event === 'co_visit') {
              dayClasses.push("bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700");
            } else if (dayEntry?.event === 'special_campaign') {
              dayClasses.push("bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700");
            } else if (dayEntry?.event === 'maintenance') {
              dayClasses.push("bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700");
            } else if (isCampaign || dayEntry?.event === 'campaign') {
              dayClasses.push(theme.bg, "bg-opacity-20 dark:bg-opacity-20");
            } else if (status === "sick" || dayEntry?.event === 'sick') {
              dayClasses.push("bg-red-200 dark:bg-red-800/50");
            } else if (hours > 3) {
              dayClasses.push("bg-green-300 dark:bg-green-700/60");
            } else if (hours > 0) {
              dayClasses.push("bg-green-200 dark:bg-green-800/50");
            } else {
              dayClasses.push("bg-slate-100/50 dark:bg-slate-700/30");
            }
          } else if (isSummaryMonth && isCurrentMonth) {
            dayClasses.push("bg-slate-200/60 dark:bg-slate-700/60");
          } else {
            dayClasses.push("bg-slate-100/50 dark:bg-slate-700/30");
          }

          return (
            <button
              key={index}
              onClick={() => isCurrentMonth && onDayClick(date)}
              className={dayClasses.join(" ")}
              disabled={!isCurrentMonth || isSummaryMonth}
            >
              <div className="flex flex-col items-center justify-between h-full w-full py-0.5">
                {/* 1. Date */}
                <span
                  className={`text-sm font-semibold leading-none ${isCurrentMonth
                      ? "text-slate-700 dark:text-slate-200"
                      : "text-slate-400 dark:text-slate-500"
                    }`}
                >
                  {date.getDate()}
                  {isMeetingDay && !isPrivacyMode && (
                    <span className="ml-[1px] inline-block w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500 align-top" />
                  )}
                </span>
                
                {/* 2 & 3. Hours Stack */}
                <div className={`flex flex-col items-center justify-center gap-0.5 ${privacyBlur}`}>
                    {/* Main Hours */}
                    {hours > 0 && isCurrentMonth && !isSummaryMonth && (
                      <span
                        className={`text-xs font-bold leading-none ${status === "sick" || dayEntry?.event === 'sick'
                          ? "text-red-800 dark:text-red-200"
                          : "text-green-800 dark:text-green-200"
                          }`}
                      >
                        {isPrivacyMode ? "0:00" : hoursToHHMM(hours)}
                      </span>
                    )}
                    
                    {/* LDC Hours - Made larger as requested */}
                    {ldcHours > 0 && isCurrentMonth && !isSummaryMonth && (
                       <div className="flex items-center gap-0.5">
                          <VestIcon className={`w-3 h-3 text-slate-600 dark:text-slate-300`} />
                          <span className={`text-[10px] font-bold leading-none text-slate-600 dark:text-slate-300`}>
                            {isPrivacyMode ? "0" : hoursToHHMM(ldcHours)}
                          </span>
                       </div>
                    )}
                </div>

                {/* 4. Icons Row - Dynamic Sizing */}
                 <div className={`flex items-center justify-center gap-0.5 h-3 ${privacyBlur}`}>
                    {(() => {
                        const icons = [];
                        const isDense = hours > 0 || ldcHours > 0;
                        const iconSizeClass = isDense ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
                        
                        // Event Icon
                        if (isCurrentMonth) {
                             if (dayEntry?.event === 'circuit_assembly') icons.push(<HomeIcon key="event" className={`${iconSizeClass} text-indigo-500`} />);
                             else if (dayEntry?.event === 'regional_convention') icons.push(<BuildingOfficeIcon key="event" className={`${iconSizeClass} text-purple-500`} />);
                             else if (dayEntry?.event === 'memorial') icons.push(<WineIcon key="event" className={`${iconSizeClass} text-rose-500`} />);
                             else if (dayEntry?.event === 'cleaning') icons.push(<SparklesIcon key="event" className={`${iconSizeClass} text-slate-500 dark:text-slate-400`} />);
                             else if (dayEntry?.event === 'co_visit') icons.push(<COVisitIcon key="event" className={`${iconSizeClass} text-emerald-500`} />);
                             else if (dayEntry?.event === 'special_campaign') icons.push(<SpecialCampaignIcon key="event" className={`${iconSizeClass} text-amber-500`} />);
                             else if (dayEntry?.event === 'maintenance') icons.push(<HammerWrenchIcon key="event" className={`${iconSizeClass} text-blue-500`} />);
                             else if (dayEntry?.event === 'sick' || status === 'sick') icons.push(<MedicalIcon key="event" className={`${iconSizeClass} text-red-500`} />);
                        }
                        
                        // Plan Icon
                        if (hasPlan && !isSummaryMonth && !isPrivacyMode) {
                            icons.push(<CalendarPlanIcon key="plan" className={`${iconSizeClass} text-slate-400 dark:text-slate-500`} />);
                        }

                        // Recurring Icon(s)
                        if (!isSummaryMonth && !isPrivacyMode) {
                            const recurring = recurringActivitiesByDayOfWeek.get(date.getDay());
                            if (recurring) {
                                if (recurring.visit) {
                                    icons.push(<ArrowUturnLeftIcon key="recurring-visit" className={`${iconSizeClass} text-slate-500 dark:text-slate-400`} />);
                                }
                                if (recurring.study) {
                                    icons.push(<BookOpenIcon key="recurring-study" className={`${iconSizeClass} text-slate-500 dark:text-slate-400`} />);
                                }
                            }
                        }
                        
                        // Render Logic
                        if (icons.length > 3) {
                             return (
                                <>
                                 {icons.slice(0, 2)}
                                 <PlusIcon className={`${iconSizeClass} text-slate-400`} />
                                </>
                             );
                        }
                        return icons;
                    })()}
                 </div>
              </div>
            </button>
          );
        })}
      </div >
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-around text-center">
        <div>
          <p
            className={`text-2xl font-bold transition-all ${theme.text} ${privacyBlur}`}
          >
            {isPrivacyMode ? "0:00" : hoursToHHMM(monthTotalHours)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total del Mes
          </p>
        </div>
        {!isSummaryMonth && (
          <div>
            <p
              className={`text-2xl font-bold transition-all text-slate-700 dark:text-slate-200 ${privacyBlur}`}
            >
              {isPrivacyMode ? "0" : activeDaysCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeDaysCount === 1 ? "Día de Actividad" : "Días de Actividad"}
            </p>
          </div>
        )}
      </div>
    </div >
  );
};

export default CalendarGrid;
