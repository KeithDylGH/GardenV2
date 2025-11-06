import React, { useMemo } from 'react';
import { HistoryLog, ThemeColor } from '../types';
import { hoursToHHMM } from '../utils';
import { CalendarStarIcon } from './icons/CalendarStarIcon';
import { ArrowTrendingUpIcon } from './icons/ArrowTrendingUpIcon';

interface StatsViewProps {
  archives: Record<string, HistoryLog>;
  currentServiceYear: string;
  currentDate: Date;
  currentHours: number;
  goal: number;
  isPrivacyMode: boolean;
  themeColor: ThemeColor;
}

const StatCard: React.FC<{
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string | number;
  unit?: string;
}> = ({ Icon, title, value, unit }) => (
  <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg flex items-center space-x-3">
    <Icon className="w-7 h-7 text-slate-500 dark:text-slate-400 flex-shrink-0" />
    <div className="overflow-hidden">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{title}</p>
      <p className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
        {value} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>
      </p>
    </div>
  </div>
);

const StatsView: React.FC<StatsViewProps> = ({
  archives,
  currentServiceYear,
  currentDate,
  isPrivacyMode,
}) => {
  const privacyValue = '-.--';

  const stats = useMemo(() => {
    const historyForYear = archives[currentServiceYear] || {};
    const currentMonth = currentDate.getMonth();
    const currentDayOfMonth = currentDate.getDate();

    // 1. Service Year Total
    let serviceYearTotal = 0;
    const yearMonths = [...Array(12).keys()].map(i => {
        const monthIndex = (8 + i) % 12;
        const year = parseInt(currentServiceYear.split('-')[0]) + Math.floor((8 + i) / 12);
        return { year, month: monthIndex };
    });

    yearMonths.forEach(({ year, month }) => {
        const summaryKey = `${year}-${String(month + 1).padStart(2, '0')}-SUMMARY`;
        if (historyForYear[summaryKey]) {
            serviceYearTotal += historyForYear[summaryKey].hours;
        } else {
            for (const dateKey in historyForYear) {
                 if (dateKey.includes('CARRYOVER') || dateKey.includes('SUMMARY')) continue;
                const entryDate = new Date(dateKey);
                if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
                    serviceYearTotal += historyForYear[dateKey].hours || 0;
                }
            }
        }
    });

    // 2. Annual Projection
    const monthsPassed = (currentMonth - 8 < 0 ? currentMonth + 4 : currentMonth - 8) + (currentDayOfMonth / 31);
    const averageMonthlyHours = monthsPassed > 0 ? serviceYearTotal / monthsPassed : 0;
    const annualProjection = averageMonthlyHours * 12;

    return {
        serviceYearTotal: isPrivacyMode ? privacyValue : hoursToHHMM(serviceYearTotal),
        annualProjection: isPrivacyMode ? privacyValue : Math.round(annualProjection),
    };
  }, [archives, currentServiceYear, currentDate, isPrivacyMode]);

  return (
    <div className="w-full animate-fadeIn">
      <div className="grid grid-cols-2 gap-3">
        <StatCard Icon={CalendarStarIcon} title="Total del Año" value={stats.serviceYearTotal} unit="hrs" />
        <StatCard Icon={ArrowTrendingUpIcon} title="Proyección Anual" value={stats.annualProjection} unit="hrs" />
      </div>
    </div>
  );
};

export default StatsView;