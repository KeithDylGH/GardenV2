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
import { ShareIcon } from "./icons/ShareIcon";
import { CalendarIcon } from "./icons/CalendarIcon";
import { ChatBubbleBottomCenterTextIcon } from "./icons/ChatBubbleBottomCenterTextIcon";
import { AcademicCapIcon } from "./icons/AcademicCapIcon";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

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
  const dateObj = new Date(activity.date);

  const handleShare = async () => {
    const dateFormatted = dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    
    const activityData = {
      version: "1.2.0",
      type: "garden_activity_import",
      data: activity
    };

    const jsonString = JSON.stringify(activityData, null, 2);
    const fileName = `actividad_${activity.name.replace(/\s+/g, '_')}_${Date.now()}.json`;

    try {
      // Create temporary file for sharing
      const result = await Filesystem.writeFile({
        path: fileName,
        data: jsonString,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: isStudy ? 'Curso Bíblico' : 'Revisita',
        text: `Compartiendo ${isStudy ? 'curso' : 'revisita'} de ${activity.name}`,
        url: result.uri,
        dialogTitle: 'Compartir Actividad'
      });
    } catch (err) {
      console.error("Error sharing file:", err);
      // Fallback to text sharing if file writing fails
      let text = `*${isStudy ? 'Curso Bíblico' : 'Revisita'}*\n`;
      text += `👤 *Nombre:* ${activity.name}\n`;
      text += `📅 *Fecha:* ${dateFormatted}\n`;
      if (activity.location) text += `📍 *Lugar:* ${activity.location}\n`;
      if (activity.comments) text += `📝 *Notas:* ${activity.comments}\n`;
      text += `\n_Enviado desde Garden_`;

      try {
        if (navigator.share) {
          await navigator.share({ title: 'Actividad', text });
        } else {
          await navigator.clipboard.writeText(text);
          alert("Copiado al portapapeles");
        }
      } catch (innerErr) {
        console.error("Fallback share error:", innerErr);
      }
    }
  };
  const formattedDate = dateObj.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).replace(/ de /g, " ").replace(/\./g, "");

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700 p-4 space-y-4">
      {/* Header with Title and Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate pt-1">
            {activity.name}
          </p>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0 -mr-1">
          <button
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-custom transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50"
            title="Compartir"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(activity)}
            className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50"
            title="Editar"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(activity.id)}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
            title="Eliminar"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metadata Section (Icon-led list) */}
      <div className="space-y-2.5">
        {/* Date and Type Badge */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
              {formattedDate}
            </span>
            <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
            <div
              className={`flex items-center space-x-1 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-md ${
                themeColor === "custom" ? "bg-custom-subtle text-custom" : `${theme.bg} bg-opacity-10 ${theme.text}`
              }`}
            >
              {isStudy ? <BookOpenIcon className="w-2.5 h-2.5" /> : <ArrowUturnLeftIcon className="w-2.5 h-2.5" />}
              <span>{isStudy ? "CURSO" : "REVISITA"}</span>
            </div>
          </div>
        </div>

        {/* Stage for revisitas */}
        {!isStudy && (
          <div className="flex items-center gap-2">
            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {getConversationStageLabel(activity.conversationStage)}
            </span>
          </div>
        )}

        {/* Lesson/Frequency for estudios */}
        {isStudy && (activity.currentLesson || activity.weeklyFrequency) && (
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex flex-wrap items-center gap-1.5">
              {activity.currentLesson && (
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Lección {activity.currentLesson}
                </span>
              )}
              {activity.currentLesson && activity.weeklyFrequency && (
                <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
              )}
              {activity.weeklyFrequency && (
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {activity.weeklyFrequency}x semana
                </span>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {activity.location && (
          <div className="flex items-center gap-2">
            <LocationMarkerIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
              {activity.location}
            </p>
          </div>
        )}

        {/* Comments */}
        {activity.comments && (
          <div className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50 mt-1">
            <DocumentTextIcon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
              {activity.comments}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;

