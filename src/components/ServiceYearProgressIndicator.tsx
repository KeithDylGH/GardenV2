import React, { useMemo } from "react";
import { CalendarDaysIcon } from "./icons/CalendarDaysIcon";

interface ServiceYearProgressIndicatorProps {
  currentDate: Date;
  isPrivacyMode: boolean;
}

const ServiceYearProgressIndicator: React.FC<
  ServiceYearProgressIndicatorProps
> = ({ currentDate, isPrivacyMode }) => {
  const serviceYearMonth = useMemo(() => {
    const month = currentDate.getMonth(); // 0-11
    // Service year starts in September (month 8)
    if (month >= 8) {
      return month - 8 + 1;
    } else {
      return month + 4 + 1;
    }
  }, [currentDate]);

  return (
    <div className="text-center w-24">
      <CalendarDaysIcon className="w-6 h-6 mx-auto text-slate-500 dark:text-slate-400" />
      <p
        className={`text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 transition-all ${
          isPrivacyMode ? "blur-sm" : ""
        }`}
      >
        {isPrivacyMode ? "? / 12" : `${serviceYearMonth} / 12`}
      </p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Mes del Año
      </p>
    </div>
  );
};

export default ServiceYearProgressIndicator;
