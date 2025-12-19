import React, { useMemo, useState, useEffect } from "react";
import {
  HistoryLog,
  ThemeColor,
  DayEvent,
  DayEntry,
  ActivityItem,
  PlanningData,
} from "../types";
import { THEMES } from "../constants";
import CalendarGrid from "./CalendarGrid";
import { getServiceYear, getServiceYearMonths, hoursToHHMM, parseDateKey } from "../utils";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import { ChevronRightIcon } from "./icons/ChevronRightIcon";
// Removing weather icons imports as they are replaced by emojis/text
import { InformationCircleIcon } from "./icons/InformationCircleIcon";
import { VestIcon } from "./icons/VestIcon";
import { SparklesIcon } from "./icons/SparklesIcon";
import { HomeIcon } from "./icons/HomeIcon";
import { BuildingOfficeIcon } from "./icons/BuildingOfficeIcon";
import { MegaphoneIcon } from "./icons/MegaphoneIcon";
import { MedicalIcon } from "./icons/MedicalIcon";
import { COVisitIcon } from "./icons/COVisitIcon";

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
  emoji?: string;
  Icon?: React.FC<any>;
  count: number | string;
  label: string;
  colorClass?: string;
}> = ({ emoji, Icon, count, label, colorClass }) => (
  <div className="flex items-center space-x-2">
    {Icon ? <Icon className={`w-5 h-5 ${colorClass}`} /> : <span className="text-lg">{emoji}</span>}
    <span className="font-semibold text-slate-700 dark:text-slate-200">
      {count}
    </span>
    <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">{label}</span>
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

  const { eventCounts, totalLdcHours } = useMemo(() => {
    const counts: Record<DayEvent, number> = {
        circuit_assembly: 0,
        regional_convention: 0,
        campaign: 0,
        cleaning: 0,
        sick: 0,
        memorial: 0,
        co_visit: 0
    };
    let ldcHours = 0;
    if (isSummaryMonth)
      return { eventCounts: counts, totalLdcHours: ldcHours };

    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth();

    Object.keys(historyForSelectedYear).forEach((dateKey) => {
      const entry = historyForSelectedYear[dateKey];
      if (dateKey.includes("CARRYOVER") || dateKey.includes("SUMMARY")) return;

      const entryDate = parseDateKey(dateKey);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        if (typeof entry === "object" && entry) {
          // Count events
          if (entry.event) {
            counts[entry.event] = (counts[entry.event] || 0) + 1;
          }
          // Backward compatibility for 'status' being sick
          // Note: In App.tsx we normalized status='sick' to event='sick' for new edits
          // but old data might have status='sick' and no event.
          if (!entry.event && entry.status === 'sick') {
            counts.sick++;
          }

          if (entry.ldcHours) ldcHours += entry.ldcHours;
        }
      }
    });
    return { eventCounts: counts, totalLdcHours: ldcHours };
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

  return (
    <div className="w-full max-w-4xl mx-auto mt-4">
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
          carryoverHours={carryoverHours}
          planningData={planningData}
          meetingDays={meetingDays}
        />
      </div>

      <div
        className={`mt-4 bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl transition-all ${privacyBlur}`}
      >
        <div className="flex justify-center items-center gap-x-4 gap-y-2 flex-wrap">
          {eventCounts.circuit_assembly > 0 && <Stat Icon={HomeIcon} count={eventCounts.circuit_assembly} label="Asamblea" colorClass="text-indigo-500" />}
          {eventCounts.regional_convention > 0 && <Stat Icon={BuildingOfficeIcon} count={eventCounts.regional_convention} label="Regional" colorClass="text-purple-500" />}
          {eventCounts.campaign > 0 && <Stat Icon={MegaphoneIcon} count={eventCounts.campaign} label="Campaña" colorClass="text-orange-500" />}
          {eventCounts.cleaning > 0 && <Stat Icon={SparklesIcon} count={eventCounts.cleaning} label="Limpieza" colorClass="text-teal-500" />}
          {eventCounts.sick > 0 && <Stat Icon={MedicalIcon} count={eventCounts.sick} label="Enfermo" colorClass="text-red-500" />}
          {eventCounts.co_visit > 0 && <Stat Icon={COVisitIcon} count={eventCounts.co_visit} label="Visita Sup." colorClass="text-emerald-500" />}

          {totalLdcHours > 0 && (
            <Stat
              Icon={VestIcon}
              count={hoursToHHMM(totalLdcHours)}
              label="Acred."
              colorClass={theme.text}
            />
          )}

          {/* Fallback to show if no stats to avoid empty box? Or just hide box if empty? 
              For now, if no events, it just shows nothing or LDC. */}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
