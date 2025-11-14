import React, { useMemo, useState, useEffect } from "react";
import {
  HistoryLog,
  ThemeColor,
  WeatherCondition,
  DayEntry,
  ActivityItem,
  PlanningData,
} from "../types";
import { THEMES } from "../constants";
import CalendarGrid from "./CalendarGrid";
import {
  getServiceYear,
  getServiceYearMonths,
  hoursToHHMM,
  getCommemorationDate,
} from "../utils";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import { ChevronRightIcon } from "./icons/ChevronRightIcon";
import { SunIcon } from "./icons/SunIcon";
import { CloudIcon } from "./icons/CloudIcon";
import { RainIcon } from "./icons/RainIcon";
import { InformationCircleIcon } from "./icons/InformationCircleIcon";
import { VestIcon } from "./icons/VestIcon";

interface HistoryViewProps {
  archives: Record<string, HistoryLog>;
  currentServiceYear: string;
  themeColor: ThemeColor;
  isPrivacyMode: boolean;
  onDayClick: (date: Date) => void;
  activities: ActivityItem[];
  planningData: PlanningData;
  meetingDays: number[];
}

const Stat: React.FC<{
  Icon: React.FC<any>;
  count: number | string;
  label: string;
  colorClass: string;
}> = ({ Icon, count, label, colorClass }) => (
  <div className="flex items-center space-x-2">
    <Icon className={`w-5 h-5 ${colorClass}`} />
    <span className="font-semibold text-slate-700 dark:text-slate-200">
      {count}
    </span>
    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
  </div>
);

const HistoryView: React.FC<HistoryViewProps> = ({
  archives,
  currentServiceYear,
  themeColor,
  isPrivacyMode,
  onDayClick,
  activities,
  planningData,
  meetingDays,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const [selectedYear, setSelectedYear] = useState(currentServiceYear);

  const serviceYearMonths = useMemo(() => {
    const yearParts = selectedYear.split("-");
    const displayDate = new Date(parseInt(yearParts[0]), 8, 1);
    return getServiceYearMonths(displayDate);
  }, [selectedYear]);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const today = new Date();
    const currentMonthInView = serviceYearMonths.findIndex(
      (d) =>
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth()
    );
    return currentMonthInView !== -1
      ? currentMonthInView
      : serviceYearMonths.length - 1;
  });

  const selectedMonthDate = serviceYearMonths[currentMonthIndex];
  const privacyBlur = isPrivacyMode
    ? "blur-md select-none pointer-events-none"
    : "";
  const availableYears = Object.keys(archives).sort().reverse();

  useEffect(() => {
    setSelectedYear(currentServiceYear);
  }, [currentServiceYear]);

  const historyForSelectedYear = archives[selectedYear] || {};

  const { isSummaryMonth, carryoverHours } = useMemo(() => {
    const month = selectedMonthDate.getMonth() + 1;
    const year = selectedMonthDate.getFullYear();
    const summaryKey = `${year}-${String(month).padStart(2, "0")}-SUMMARY`;
    const carryoverKey = `${year}-${String(month).padStart(2, "0")}-CARRYOVER`;

    return {
      isSummaryMonth: historyForSelectedYear[summaryKey]?.isSummary === true,
      carryoverHours: historyForSelectedYear[carryoverKey]?.hours || 0,
    };
  }, [historyForSelectedYear, selectedMonthDate]);

  const { weatherCounts, totalLdcHours } = useMemo(() => {
    const counts: Record<WeatherCondition, number> = {
      sunny: 0,
      cloudy: 0,
      bad: 0,
    };
    let ldcHours = 0;
    if (isSummaryMonth)
      return { weatherCounts: counts, totalLdcHours: ldcHours };

    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();

    Object.keys(historyForSelectedYear).forEach((dateKey) => {
      const entry = historyForSelectedYear[dateKey];
      if (dateKey.includes("CARRYOVER") || dateKey.includes("SUMMARY")) return;

      const entryDate = new Date(dateKey);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        if (typeof entry === "object" && entry) {
          if (entry.weather) counts[entry.weather]++;
          if (entry.ldcHours) ldcHours += entry.ldcHours;
        }
      }
    });
    return { weatherCounts: counts, totalLdcHours: ldcHours };
  }, [historyForSelectedYear, selectedMonthDate, isSummaryMonth]);

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) =>
      prev > 0 ? prev - 1 : serviceYearMonths.length - 1
    );
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) =>
      prev < serviceYearMonths.length - 1 ? prev + 1 : 0
    );
  };

  const commemorationDate = useMemo(() => {
    return getCommemorationDate(selectedYear);
  }, [selectedYear]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <label htmlFor="history-year-selector" className="sr-only">
          Seleccionar año de servicio
        </label>
        <select
          id="history-year-selector"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            const today = new Date();
            const yearMonths = getServiceYearMonths(
              new Date(parseInt(e.target.value.split("-")[0]), 8, 1)
            );
            const currentMonthIdx = yearMonths.findIndex(
              (d) =>
                d.getFullYear() === today.getFullYear() &&
                d.getMonth() === today.getMonth()
            );
            setCurrentMonthIndex(currentMonthIdx !== -1 ? currentMonthIdx : 0);
          }}
          className={`w-full max-w-xs mx-auto block text-center py-2 px-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-2 ${theme.ring} font-semibold`}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              Año de Servicio {year}{" "}
              {year === currentServiceYear ? "(Actual)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
        <div
          id="month-navigator"
          className="flex items-center justify-between mb-4"
        >
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronLeftIcon className="w-6 h-6 text-slate-500" />
          </button>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
            {selectedMonthDate.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronRightIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {isSummaryMonth && (
          <div className="mb-4 text-center text-sm bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg flex items-center justify-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-slate-500" />
            <span>
              Este es un resumen. El historial por día está disponible para los
              meses registrados en la app.
            </span>
          </div>
        )}

        {carryoverHours > 0 && (
          <div className="mb-4 text-center text-sm bg-blue-50 dark:bg-blue-900/40 p-3 rounded-lg flex items-center justify-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-500" />
            <span>
              Este mes incluye{" "}
              <strong>{hoursToHHMM(carryoverHours)} horas</strong> registradas
              antes de usar la app.
            </span>
          </div>
        )}

        <CalendarGrid
          selectedMonth={selectedMonthDate}
          historyLog={historyForSelectedYear}
          onDayClick={onDayClick}
          themeColor={themeColor}
          isPrivacyMode={isPrivacyMode}
          activities={activities}
          isSummaryMonth={isSummaryMonth}
          commemorationDate={commemorationDate}
          carryoverHours={carryoverHours}
          planningData={planningData}
          meetingDays={meetingDays}
        />
      </div>

      <div
        className={`mt-4 bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl transition-all ${privacyBlur}`}
      >
        <div className="flex justify-center items-center gap-x-4 gap-y-2 flex-wrap">
          <Stat
            Icon={SunIcon}
            count={weatherCounts.sunny}
            label="soleados"
            colorClass="text-yellow-500"
          />
          <Stat
            Icon={CloudIcon}
            count={weatherCounts.cloudy}
            label="nublados"
            colorClass="text-slate-500"
          />
          <Stat
            Icon={RainIcon}
            count={weatherCounts.bad}
            label="difíciles"
            colorClass="text-blue-500"
          />
          {totalLdcHours > 0 && (
            <Stat
              Icon={VestIcon}
              count={hoursToHHMM(totalLdcHours)}
              label="LDC"
              colorClass={theme.text}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
