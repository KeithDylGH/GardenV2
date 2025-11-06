import React from "react";
import { GardenIcon } from "./icons/GardenIcon";
import { ThemeColor } from "../types";
import { THEMES } from "../constants";
import { Bars3Icon } from "./icons/Bars3Icon";

interface HeaderProps {
  title: string;
  themeColor: ThemeColor;
  streak: number;
  onStreakClick: () => void;
  onMenuClick: () => void;
  onTitleClick: () => void;
  isSimpleMode: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  themeColor,
  streak,
  onStreakClick,
  onMenuClick,
  onTitleClick,
  isSimpleMode,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const useCustomFont = ["Garden"].includes(title);
  const isTitleClickable = title === "Garden" && !isSimpleMode;

  const TitleComponent = isTitleClickable ? "button" : "h1";

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-100/80 dark:bg-slate-900/80 backdrop-blur-lg z-30 border-b border-slate-200/80 dark:border-slate-700/80">
      <div className="relative flex items-center justify-between h-20 px-4">
        <div className="flex items-center -ml-2">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 z-20"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="w-8 h-8" />
          </button>
        </div>

        <TitleComponent
          id="header-title"
          onClick={isTitleClickable ? onTitleClick : undefined}
          className={`absolute left-1/2 -translate-x-1/2 text-3xl text-slate-900 dark:text-slate-100 ${
            useCustomFont ? "font-logotype pb-1" : "font-bold tracking-tight"
          } ${
            isTitleClickable
              ? "cursor-pointer hover:opacity-80 transition-opacity active:opacity-75"
              : ""
          }`}
        >
          {title}
        </TitleComponent>

        <button
          id="streak-indicator"
          onClick={onStreakClick}
          className="flex items-center space-x-2 p-2 -mr-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/50 z-20"
          aria-label="Ver detalles de la racha"
        >
          {streak > 0 && (
            <span className={`text-2xl font-bold ${theme.text} animate-fadeIn`}>
              {streak}
            </span>
          )}
          <GardenIcon className={`w-8 h-8 ${theme.text}`} />
        </button>
      </div>
    </header>
  );
};

export default Header;
