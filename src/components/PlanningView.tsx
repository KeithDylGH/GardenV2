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
import { PencilIcon } from "./icons/PencilIcon";

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
    const today = currentDate;
    const dayOfWeek = (today.getDay() + 6) % 7; // Lunes=0, Domingo=6
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  }, [currentDate]);

  const activitiesById = useMemo(() => {
    return new Map(activities.map((act) => [act.id, act]));
  }, [activities]);

  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const startOfWeek = weekDays[0];
  const endOfWeek = weekDays[6];
  const weekRangeString = `${startOfWeek.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  })} - ${endOfWeek.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div id="planning-week-view" className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ChevronLeftIcon className="w-6 h-6 text-slate-500" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center">
          {weekRangeString}
        </h2>
        <button
          onClick={handleNextWeek}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ChevronRightIcon className="w-6 h-6 text-slate-500" />
        </button>
      </div>
      <div className="space-y-4">
        {weekDays.map((date) => {
          const dateKey = formatDateKey(date);
          const blocks = planningData[dateKey] || [];
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={dateKey}
              className={`p-4 rounded-2xl ${
                isToday
                  ? `bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50`
                  : "bg-slate-50 dark:bg-slate-800/50"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-baseline space-x-2">
                  <h3
                    className={`font-bold text-lg ${
                      isToday
                        ? theme.text
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {date.toLocaleDateString("es-ES", { weekday: "long" })}
                  </h3>
                  <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                    {date.getDate()}
                  </p>
                </div>
                <button
                  id={isToday ? "add-plan-block-button" : undefined}
                  onClick={() => onOpenModal(date, null)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600`}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              {blocks.length > 0 ? (
                <div className="space-y-3">
                  {blocks.map((block) => (
                    <div
                      key={block.id}
                      className="bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {block.title}
                          </p>
                          {block.timeRange && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {block.timeRange}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => onOpenModal(date, block)}
                          className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {block.activityIds.length > 0 && (
                        <div
                          id="link-activities-section"
                          className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1"
                        >
                          {block.activityIds.map((id) => {
                            const activity = activitiesById.get(id);
                            if (!activity) return null;
                            return (
                              <div
                                key={id}
                                className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300"
                              >
                                {activity.type === "study" ? (
                                  <AcademicCapIcon
                                    className={`w-4 h-4 ${theme.text}`}
                                  />
                                ) : (
                                  <ArrowUturnLeftIcon
                                    className={`w-4 h-4 ${theme.text}`}
                                  />
                                )}
                                <span>{activity.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
