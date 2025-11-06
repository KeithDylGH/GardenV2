import React, { useMemo } from 'react';
import { HistoryLog, ThemeColor, DayEntry, ActivityItem, PlanningData } from '../types';
import { THEMES } from '../constants';
import { hoursToHHMM, formatDateKey } from '../utils';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';

interface CalendarGridProps {
  selectedMonth: Date;
  historyLog: HistoryLog;
  onDayClick: (date: Date) => void;
  themeColor: ThemeColor;
  isPrivacyMode: boolean;
  activities: ActivityItem[];
  isSummaryMonth: boolean;
  commemorationDate: Date | null;
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
}

const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  selectedMonth, 
  historyLog, 
  onDayClick, 
  themeColor,
  isPrivacyMode,
  activities,
  isSummaryMonth,
  commemorationDate,
  carryoverHours,
  planningData,
  meetingDays,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const privacyBlur = isPrivacyMode ? 'blur-sm select-none pointer-events-none' : '';

  const activityDates = useMemo(() => {
      const dates = new Set<string>();
      activities.forEach(act => {
          if (!act.recurring) {
            const d = new Date(act.date);
            dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
          }
      });
      return dates;
  }, [activities]);
  
  const recurringActivitiesByDayOfWeek = useMemo(() => {
    const map = new Map<number, boolean>();
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    activities.forEach(act => {
        if (act.recurring) {
            const actDate = new Date(act.date);
            const dayOfWeek = actDate.getDay();
            if (actDate.getFullYear() < year || (actDate.getFullYear() === year && actDate.getMonth() <= month)) {
                if (!map.has(dayOfWeek)) {
                   map.set(dayOfWeek, true);
                }
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
      const hasActivity = activityDates.has(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
      days.push({ date, isCurrentMonth: false, hasActivity, hasPlan: dayBlocks.length > 0 });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateKey = formatDateKey(date);
      const dayBlocks = planningData[dateKey] || [];
      const hasActivity = activityDates.has(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
      days.push({ date, isCurrentMonth: true, dayEntry: historyLog[dateKey], hasActivity, hasPlan: dayBlocks.length > 0 });
    }

    const lastDayOfWeek = (lastDayOfMonth.getDay() + 6) % 7;
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const date = new Date(lastDayOfMonth);
      date.setDate(date.getDate() + i);
      const dateKey = formatDateKey(date);
      const dayBlocks = planningData[dateKey] || [];
      const hasActivity = activityDates.has(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
      days.push({ date, isCurrentMonth: false, hasActivity, hasPlan: dayBlocks.length > 0 });
    }

    return days;
  }, [selectedMonth, historyLog, activityDates, planningData]);
  
  const monthTotalHours = useMemo(() => {
    if (isSummaryMonth) {
      const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-SUMMARY`;
      return historyLog[monthKey]?.hours || 0;
    }
    const dailyTotal = calendarDays.reduce((total, day) => total + (day.isCurrentMonth ? (day.dayEntry?.hours || 0) : 0), 0);
    return dailyTotal + carryoverHours;
  }, [calendarDays, isSummaryMonth, selectedMonth, historyLog, carryoverHours]);

  const activeDaysCount = useMemo(() => {
    if (isSummaryMonth) return 0;
    return calendarDays.filter(day => day.isCurrentMonth && day.dayEntry && day.dayEntry.hours > 0).length;
  }, [calendarDays, isSummaryMonth]);

  return (
    <div>
        <div id="calendar-grid" className="grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day, i) => (
                <div key={`${day}-${i}`} className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 pb-2">{day}</div>
            ))}
            {calendarDays.map((day, index) => {
                const { date, isCurrentMonth, dayEntry, hasActivity, hasPlan } = day;
                const isToday = new Date().toDateString() === date.toDateString();
                const hours = dayEntry?.hours || 0;
                const ldcHours = dayEntry?.ldcHours || 0;
                const status = dayEntry?.status;
                
                const isCommemoration = commemorationDate && 
                    date.getFullYear() === commemorationDate.getUTCFullYear() && 
                    date.getMonth() === commemorationDate.getUTCMonth() && 
                    date.getDate() === commemorationDate.getUTCDate();
                
                const isCampaign = dayEntry?.isCampaign;
                const hasRecurringActivity = !isSummaryMonth && isCurrentMonth && recurringActivitiesByDayOfWeek.has(date.getDay());
                const isMeetingDay = isCurrentMonth && !isSummaryMonth && meetingDays.includes(date.getDay());

                const dayClasses = ['relative h-16 flex flex-col items-center justify-center rounded-lg'];

                if (isCurrentMonth && !isSummaryMonth) dayClasses.push('cursor-pointer');
                else dayClasses.push('pointer-events-none');
                
                if (isToday && !isSummaryMonth) dayClasses.push('border-2', theme.text);
                else dayClasses.push('border-2', 'border-transparent');
                
                if (!isCurrentMonth) dayClasses.push('opacity-40');

                if (isCurrentMonth && !isSummaryMonth) {
                    dayClasses.push('hover:bg-slate-200 dark:hover:bg-slate-700');
                    if (isCommemoration) {
                        dayClasses.push('bg-red-800 dark:bg-red-900/70 text-white dark:text-red-100');
                    } else if (isCampaign) {
                        dayClasses.push(theme.bg, 'bg-opacity-20 dark:bg-opacity-20');
                    } else if (status === 'sick') {
                        dayClasses.push('bg-red-200 dark:bg-red-800/50');
                    } else if (hours > 3) {
                        dayClasses.push('bg-green-300 dark:bg-green-700/60');
                    } else if (hours > 0) {
                        dayClasses.push('bg-green-200 dark:bg-green-800/50');
                    } else {
                         dayClasses.push('bg-slate-100/50 dark:bg-slate-700/30');
                    }
                } else if (isSummaryMonth && isCurrentMonth) {
                    dayClasses.push('bg-slate-200/60 dark:bg-slate-700/60');
                } else {
                    dayClasses.push('bg-slate-100/50 dark:bg-slate-700/30');
                }

                return (
                    <button
                        key={index}
                        onClick={() => isCurrentMonth && onDayClick(date)}
                        className={dayClasses.join(' ')}
                        disabled={!isCurrentMonth || isSummaryMonth}
                    >
                        {isCurrentMonth && (hasActivity || hasRecurringActivity) && !isSummaryMonth && !isPrivacyMode && (
                            <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${hasRecurringActivity ? 'bg-purple-500' : theme.bg}`}></div>
                        )}
                        {hasPlan && !isSummaryMonth && !isPrivacyMode && (
                           <ClipboardDocumentListIcon className="absolute bottom-1.5 left-1.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        )}
                        {hasRecurringActivity && !isSummaryMonth && !isPrivacyMode &&
                            <BookOpenIcon className="absolute top-1.5 left-1.5 w-4 h-4 text-slate-500 dark:text-slate-400" />
                        }
                        {ldcHours > 0 && !isSummaryMonth && !isPrivacyMode &&
                            <BuildingOfficeIcon className="absolute bottom-1.5 right-1.5 w-4 h-4 text-slate-500 dark:text-slate-400" />
                        }

                        <span className={`text-sm font-semibold flex items-center justify-center ${isCommemoration ? 'text-white dark:text-red-100' : isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                            {date.getDate()}
                            {isMeetingDay && !isPrivacyMode && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />}
                        </span>
                        
                        <div className={`flex flex-col items-center justify-center -mt-1 ${privacyBlur}`}>
                            {hours > 0 && isCurrentMonth && !isSummaryMonth && (
                                <span className={`text-xs font-bold leading-tight ${status === 'sick' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                                    {isPrivacyMode ? '0:00' : hoursToHHMM(hours)}
                                </span>
                            )}
                            {ldcHours > 0 && isCurrentMonth && !isSummaryMonth && (
                                <span className={`text-xs font-bold leading-tight ${theme.text}`}>
                                    {isPrivacyMode ? '0:00' : hoursToHHMM(ldcHours)}
                                </span>
                            )}
                        </div>

                    </button>
                );
            })}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-around text-center">
            <div>
                <p className={`text-2xl font-bold transition-all ${theme.text} ${privacyBlur}`}>
                    {isPrivacyMode ? '0:00' : hoursToHHMM(monthTotalHours)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total del Mes</p>
            </div>
            {!isSummaryMonth && (
                 <div>
                    <p className={`text-2xl font-bold transition-all text-slate-700 dark:text-slate-200 ${privacyBlur}`}>
                        {isPrivacyMode ? '0' : activeDaysCount}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activeDaysCount === 1 ? 'Día de Actividad' : 'Días de Actividad'}</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default CalendarGrid;