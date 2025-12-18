import React from "react";
import { ActivityItem, ThemeColor, ConversationStage } from "../types";
import { THEMES } from "../constants";
import { UserIcon } from "./icons/UserIcon";
import { LocationMarkerIcon } from "./icons/LocationMarkerIcon";
import { DocumentTextIcon } from "./icons/DocumentTextIcon";
import { BookOpenIcon } from "./icons/BookOpenIcon"; // for study
import { ArrowUturnLeftIcon } from "./icons/ArrowUturnLeftIcon"; // for visit
import { PencilIcon } from "./icons/PencilIcon";
import { TrashIcon } from "./icons/TrashIcon";

interface ActivityCardProps {
  activity: ActivityItem;
  themeColor: ThemeColor;
  onEdit: (activity: ActivityItem) => void;
  onDelete: (activityId: string) => void;
}

// Helper function to get conversation stage label
const getConversationStageLabel = (stage?: ConversationStage): string => {
  switch (stage) {
    case "first": return "1ra conversación";
    case "second": return "2da conversación";
    case "third": return "3ra conversación";
    case "fourth_plus": return "4+ conversaciones";
    default: return "1ra conversación";
  }
};

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  themeColor,
  onEdit,
  onDelete,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const isStudy = activity.type === "study";

  const date = new Date(activity.date);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700 p-4 space-y-3 relative">
      <div className="absolute top-3 right-3 flex items-center space-x-2">
        <button
          onClick={() => onEdit(activity)}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(activity.id)}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-start justify-between pr-20">
        <div>
          <p className="font-bold text-lg text-slate-800 dark:text-slate-100">
            {activity.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formattedDate}
          </p>
        </div>
        <div
          className={`flex items-center space-x-2 text-sm font-semibold px-3 py-1 rounded-full ${
            themeColor === "custom" ? "bg-custom-subtle text-custom" : `${theme.bg} bg-opacity-10 ${theme.text}`
          }`}
        >
          {isStudy ? (
            <BookOpenIcon className="w-4 h-4" />
          ) : (
            <ArrowUturnLeftIcon className="w-4 h-4" />
          )}
          <span>{isStudy ? "Estudio" : "Revisita"}</span>
        </div>
      </div>

      {/* Conversation stage for revisitas */}
      {!isStudy && (
        <div className="flex items-center">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
            {getConversationStageLabel(activity.conversationStage)}
          </span>
        </div>
      )}

      {/* Lesson info for estudios */}
      {isStudy && (activity.currentLesson || activity.weeklyFrequency) && (
        <div className="flex flex-wrap items-center gap-2">
          {activity.currentLesson && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              📖 Lección {activity.currentLesson}/60
            </span>
          )}
          {activity.weeklyFrequency && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
              📅 {activity.weeklyFrequency}x por semana
            </span>
          )}
        </div>
      )}

      {activity.location && (
        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
          <LocationMarkerIcon className="w-5 h-5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
          <p className="text-sm">{activity.location}</p>
        </div>
      )}

      {activity.comments && (
        <div className="flex items-start space-x-2 text-slate-600 dark:text-slate-300">
          <DocumentTextIcon className="w-5 h-5 flex-shrink-0 text-slate-400 dark:text-slate-500 mt-0.5" />
          <p className="text-sm">{activity.comments}</p>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;

