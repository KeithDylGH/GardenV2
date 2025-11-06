import React, { useMemo } from "react";
import { ThemeColor } from "../types";
import { THEMES } from "../constants";

interface WeekdayCircleProps {
  themeColor: ThemeColor;
}

const WeekdayCircle: React.FC<WeekdayCircleProps> = ({ themeColor }) => {
  const theme = THEMES[themeColor] || THEMES.blue;

  const positions = useMemo(() => {
    const angleStep = 360 / 7;
    const radius = 38; // px
    const center = 48; // px (half of width/height)
    const offset = 12; // px (half of circle width/height)
    const weekDayLabels = ["L", "M", "M", "J", "V", "S", "D"];

    // Start monday at top-left-ish. Angle -115deg seems good.
    const startAngle = -115;

    return weekDayLabels.map((label, i) => {
      const angle = startAngle + i * angleStep;
      const rad = angle * (Math.PI / 180);
      const x = center + radius * Math.cos(rad) - offset;
      const y = center + radius * Math.sin(rad) - offset;
      return { top: `${y}px`, left: `${x}px`, label };
    });
  }, []);

  // Monday = 0, Sunday = 6
  const currentDayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="relative w-24 h-24 mx-auto animate-fadeIn">
      {positions.map((pos, i) => {
        const isCurrentDay = i === currentDayIndex;
        return (
          <div
            key={i}
            style={{ top: pos.top, left: pos.left }}
            className={`absolute w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isCurrentDay
                ? `${theme.bg} text-white shadow-md`
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <span
              className={`text-xs font-bold ${
                isCurrentDay
                  ? "text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {pos.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default WeekdayCircle;
