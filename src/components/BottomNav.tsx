import React from "react";
import { PlusIcon } from "./icons/PlusIcon";
import { CalendarIcon } from "./icons/CalendarIcon";
import { HomeIcon } from "./icons/HomeIcon";
import { ListBulletIcon } from "./icons/ListBulletIcon";
import { ClockIcon } from "./icons/ClockIcon";
import { ThemeColor, ThemeMode } from "../types";
import { THEMES } from "../constants";

type ActiveView =
  | "tracker"
  | "activity"
  | "history"
  | "planning"
  | "achievements";

interface BottomNavProps {
  activeView: ActiveView;
  onAddClick: () => void;
  themeColor: ThemeColor;
  performanceMode?: boolean;
  isSimpleMode?: boolean;
  themeMode?: ThemeMode;
}

const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onAddClick,
  themeColor,
  performanceMode = false,
  isSimpleMode = false,
  themeMode = "dark",
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;

  const dynamicTextColor =
    isSimpleMode && themeMode === "light" ? "text-slate-900" : theme.text;

  const allNavItems = [
    { view: "tracker", hash: "#/", Icon: HomeIcon, label: "Informe" },
    { view: "planning", hash: "#/planning", Icon: ClockIcon, label: "Plan" },
    { view: "add", hash: "", Icon: PlusIcon, label: "Agregar" },
    {
      view: "activity",
      hash: "#/activity",
      Icon: ListBulletIcon,
      label: "Actividad",
    },
    {
      view: "history",
      hash: "#/history",
      Icon: CalendarIcon,
      label: "Historial",
    },
  ];

  const navItems = isSimpleMode
    ? allNavItems.filter((item) =>
        ["tracker", "add", "activity", "history"].includes(item.view)
      )
    : allNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-50/70 dark:bg-slate-900/70 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-700/60 z-10">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.view === "add") {
            return (
              <div
                key={item.label}
                className="relative flex justify-center items-center w-20 h-full"
              >
                <button
                  id="add-hours-button"
                  onClick={onAddClick}
                  className={`w-16 h-16 rounded-full flex items-center justify-center bg-gray-50 dark:bg-slate-900 shadow-lg transition-transform z-20 ${dynamicTextColor} ${
                    !performanceMode &&
                    "transform hover:scale-105 active:scale-100"
                  }`}
                  aria-label={item.label}
                >
                  <PlusIcon className="w-10 h-10" />
                </button>
              </div>
            );
          }

          const isActive = activeView === item.view;
          const showGlow = isActive && !performanceMode;

          return (
            <div
              key={item.label}
              className="relative flex justify-center items-center w-20 h-full"
            >
              {showGlow && (
                <div
                  className={`absolute inset-0 rounded-full blur-xl bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} opacity-20 -z-10`}
                ></div>
              )}
              <button
                onClick={() => (window.location.hash = item.hash)}
                className={`flex flex-col items-center justify-center space-y-1 w-full h-full z-10 ${
                  isActive
                    ? dynamicTextColor
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
                }`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <item.Icon className="h-7 w-7" />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
