import React, { useMemo } from 'react';
import { HistoryLog, ThemeColor, DayEntry } from '../types';
import { THEMES } from '../constants';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { hoursToHHMM } from '../utils';

interface MonthHistoryCardProps {
  id: string;
  monthName: string;
  monthHours: number;
  monthDate: Date;
  history: HistoryLog;
  themeColor: ThemeColor;
  isExpanded: boolean;
  onToggle: () => void;
  isPrivacyMode: boolean;
}

const MonthHistoryCard: React.FC<MonthHistoryCardProps> = ({
  id,
  monthName,
  monthHours,
  monthDate,
  history,
  themeColor,
  isExpanded,
  onToggle,
  isPrivacyMode,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const year = monthDate.getFullYear();
  const privacyBlur = isPrivacyMode ? 'blur-sm select-none pointer-events-none' : '';
  const month = monthDate.getMonth(); // 0-11

  const { dailyEntries, totalLdcHours } = useMemo(() => {
    const entries: { date: Date, hours: number, ldcHours?: number }[] = [];
    let ldcTotal = 0;

    Object.entries(history).forEach(([dateStr, entryData]) => {
      const date = new Date(dateStr + 'T12:00:00Z');
      
      if (!isNaN(date.getTime()) && date.getUTCFullYear() === year && date.getUTCMonth() === month) {
        let entryHours = 0;
        let entryLdcHours: number | undefined = undefined;

        if (typeof entryData === 'object' && entryData !== null) {
          entryHours = (entryData as DayEntry).hours || 0;
          entryLdcHours = (entryData as DayEntry).ldcHours;
        } else if (typeof entryData === 'number') {
          entryHours = entryData;
        }
        
        if (entryHours > 0 || (entryLdcHours && entryLdcHours > 0)) {
            entries.push({ date, hours: entryHours, ldcHours: entryLdcHours });
        }
        
        if (entryLdcHours) {
          ldcTotal += entryLdcHours;
        }
      }
    });

    entries.sort((a, b) => a.date.getUTCDate() - b.date.getUTCDate());
    return { dailyEntries: entries, totalLdcHours: ldcTotal };
  }, [history, year, month]);

  const hasEntries = dailyEntries.length > 0;

  return (
    <div id={id} className={`rounded-2xl transition-all duration-300 overflow-hidden ${
      monthHours > 0 || totalLdcHours > 0
        ? 'bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700' 
        : 'bg-slate-100/80 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700'
    }`}>
      <button 
        className="w-full p-4 flex flex-col items-center justify-center text-center cursor-pointer disabled:cursor-not-allowed"
        onClick={onToggle}
        disabled={!hasEntries}
        aria-expanded={isExpanded}
      >
        <div className="w-full flex items-center justify-between">
            <span className="w-6 h-6"></span> {/* Spacer */}
            <div className="flex flex-col items-center">
                <p className="font-bold text-slate-800 dark:text-slate-100 capitalize">{monthName}</p>
                <p className={`text-4xl font-bold mt-1 transition-all ${monthHours > 0 ? theme.text : 'text-slate-400 dark:text-slate-500'} ${privacyBlur}`}>
                    {isPrivacyMode ? '0:00' : hoursToHHMM(monthHours)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">horas de predicación</p>
                {totalLdcHours > 0 && (
                  <p className={`text-sm font-semibold mt-2 ${theme.text} ${privacyBlur}`}>
                    + {isPrivacyMode ? '0:00' : hoursToHHMM(totalLdcHours)} LDC
                  </p>
                )}
            </div>
            {hasEntries ? (
                <ChevronDownIcon className={`w-6 h-6 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} />
            ) : (
                <span className="w-6 h-6"></span> /* Spacer */
            )}
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 text-center">
                {dailyEntries.length} {dailyEntries.length === 1 ? 'informe' : 'informes'} este mes
            </p>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
                {dailyEntries.map((entry, index) => (
                    <li key={index} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Día {entry.date.getUTCDate()}
                        </span>
                        <div className={`text-sm font-bold transition-all flex items-center gap-2 ${privacyBlur}`}>
                          {entry.ldcHours && entry.ldcHours > 0 && (
                             <span className={`${theme.text}`}>
                                {isPrivacyMode ? '0:00' : hoursToHHMM(entry.ldcHours)} LDC
                             </span>
                          )}
                          {entry.hours > 0 && (
                            <span className={`${theme.text}`}>
                                {isPrivacyMode ? '0:00' : hoursToHHMM(entry.hours)}
                            </span>
                          )}
                        </div>
                    </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthHistoryCard;