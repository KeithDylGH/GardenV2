import React from "react";
import { GroupArrangement, ThemeColor } from "../types";
import { THEMES } from "../constants";
import { UserIcon } from "./icons/UserIcon";
import { LocationMarkerIcon } from "./icons/LocationMarkerIcon";
import { ClockIcon } from "./icons/ClockIcon";
import { MapPinIcon } from "./icons/MapPinIcon";

interface GroupArrangementCardProps {
  arrangement: GroupArrangement;
  themeColor: ThemeColor;
}

const InfoRow: React.FC<{
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  text?: string;
  defaultText?: string;
}> = ({ Icon, text, defaultText = "No especificado" }) => {
  if (!text) return null;
  return (
    <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
      <Icon className="w-5 h-5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
      <p className="text-sm">
        {text || (
          <span className="italic text-slate-400 dark:text-slate-500">
            {defaultText}
          </span>
        )}
      </p>
    </div>
  );
};

const GroupArrangementCard: React.FC<GroupArrangementCardProps> = ({
  arrangement,
  themeColor,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const { groupNumber, conductor, time, location, territory } = arrangement;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700 p-4 space-y-3">
      {groupNumber && (
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            {groupNumber}
          </h3>
          {conductor && (
            <div
              className={`flex items-center space-x-2 text-sm font-semibold px-3 py-1 rounded-full ${theme.bg} bg-opacity-10 ${theme.text}`}
            >
              <UserIcon className="w-4 h-4" />
              <span>{conductor}</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
        <InfoRow
          Icon={ClockIcon}
          text={time}
          defaultText="Hora no especificada"
        />
        <InfoRow
          Icon={LocationMarkerIcon}
          text={location}
          defaultText="Lugar no especificado"
        />
        <InfoRow
          Icon={MapPinIcon}
          text={territory}
          defaultText="Territorio no especificado"
        />
      </div>
    </div>
  );
};

export default GroupArrangementCard;
