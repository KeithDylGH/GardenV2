// FIX: Implemented the full component and added a default export to fix the error "Module has no default export".
import React, { useState, useMemo } from "react";
import {
  PlanningData,
  PlanningBlock,
  ActivityItem,
  ThemeColor,
} from "../types";
import { THEMES } from "../constants";
import { formatDateKey } from "../utils";
import { PlusIcon } from "./icons/PlusIcon";
import { ChevronLeftIcon } from "./icons/ChevronLeftIcon";
import { ChevronRightIcon } from "./icons/ChevronRightIcon";
import { AcademicCapIcon } from "./icons/AcademicCapIcon";
import { ArrowUturnLeftIcon } from "./icons/ArrowUturnLeftIcon";

interface PlanningViewProps {
  planningData: PlanningData;
  activities: ActivityItem[];
  onOpenModal: (date: Date, block: PlanningBlock | null) => void;
  themeColor: ThemeColor;
}

const PlanningView: React.FC<PlanningViewProps> = ({
  planningData,
  activities,
  onOpenModal,
  themeColor,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => {
    const week = [];
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      week.push(dayDate);
    }
    return week;
  }, [currentDate]);

  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const firstDay = weekDays[0];
  const lastDay = weekDays[6];

  const monthFormatOptions: Intl.DateTimeFormatOptions = { month: "short" };
  const firstMonth = firstDay.toLocaleDateString("es-ES", monthFormatOptions);
  const lastMonth = lastDay.toLocaleDateString("es-ES", monthFormatOptions);

  const rangeString =
    firstMonth === lastMonth
      ? `${firstDay.getDate()} - ${lastDay.getDate()} de ${firstMonth}`
      : `${firstDay.getDate()} de ${firstMonth} - ${lastDay.getDate()} de ${lastMonth}`;

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ChevronLeftIcon className="w-6 h-6 text-slate-500" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
          {rangeString}
        </h2>
        <button
          onClick={handleNextWeek}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ChevronRightIcon className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      <div id="planning-week-view" className="space-y-4">
        {weekDays.map((day, index) => {
          const dateKey = formatDateKey(day);
          const blocks = planningData[dateKey] || [];
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border ${
                today
                  ? `border-2 ${theme.text}`
                  : "border-slate-200/50 dark:border-slate-700/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline space-x-2">
                  <p
                    className={`text-sm font-bold ${
                      today ? theme.text : "text-slate-500 dark:text-slate-400"
                    } capitalize`}
                  >
                    {day.toLocaleDateString("es-ES", { weekday: "long" })}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      today ? theme.text : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {day.getDate()}
                  </p>
                </div>
                <button
                  id={index === 0 ? "add-plan-block-button" : undefined}
                  onClick={() => onOpenModal(day, null)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 ${theme.text} hover:bg-slate-200 dark:hover:bg-slate-600`}
                >
                  <PlusIcon className="w-6 h-6" />
                </button>
              </div>

              {blocks.length > 0 ? (
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <button
                      key={block.id}
                      onClick={() => onOpenModal(day, block)}
                      className="w-full text-left bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {block.title}
                      </p>
                      {block.timeRange && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {block.timeRange}
                        </p>
                      )}
                      {block.activityIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {block.activityIds.map((id) => {
                            const activity = activities.find(
                              (a) => a.id === id
                            );
                            if (!activity) return null;
                            return (
                              <div
                                key={id}
                                className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2 py-1 rounded-full text-xs"
                              >
                                {activity.type === "study" ? (
                                  <AcademicCapIcon className="w-3.5 h-3.5 text-slate-500" />
                                ) : (
                                  <ArrowUturnLeftIcon className="w-3.5 h-3.5 text-slate-500" />
                                )}
                                <span className="text-slate-600 dark:text-slate-300">
                                  {activity.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    No hay planes para este día.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanningView;
