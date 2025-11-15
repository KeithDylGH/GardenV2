import React, { useState, useMemo, useEffect } from "react";
import {
  ActivityItem,
  ThemeColor,
  GroupArrangement,
  ThemeMode,
} from "../types";
import { THEMES } from "../constants";
import ActivityCard from "./ActivityCard";
import ImportArrangementModal from "./ImportArrangementModal";
import GroupArrangementCard from "./GroupArrangementCard";
import { ClipboardPasteIcon } from "./icons/ClipboardPasteIcon";
import { TrashIcon } from "./icons/TrashIcon";
import { ArrowUturnLeftIcon } from "./icons/ArrowUturnLeftIcon";
import { BookOpenIcon } from "./icons/BookOpenIcon";

interface ActivityViewProps {
  activities: ActivityItem[];
  groupArrangements: GroupArrangement[];
  onSaveArrangements: (arrangements: GroupArrangement[]) => void;
  themeColor: ThemeColor;
  onEdit: (activity: ActivityItem) => void;
  onDelete: (activityId: string) => void;
  isOnline: boolean;
  performanceMode: boolean;
  currentDate: Date;
  isPrivacyMode: boolean;
  notes: string;
  onSaveNotes: (notes: string) => void;
  isSimpleMode: boolean;
  themeMode: ThemeMode;
}

type ActivityTab = "groups" | "visits" | "studies" | "notes";

const ActivityView: React.FC<ActivityViewProps> = ({
  activities,
  groupArrangements,
  onSaveArrangements,
  themeColor,
  onEdit,
  onDelete,
  isOnline,
  performanceMode,
  currentDate,
  isPrivacyMode,
  notes,
  onSaveNotes,
  isSimpleMode,
  themeMode,
}) => {
  const [activeTab, setActiveTab] = useState<ActivityTab>("groups");
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);
  const theme = THEMES[themeColor] || THEMES.blue;
  const privacyBlur = isPrivacyMode
    ? "blur-md select-none pointer-events-none"
    : "";

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const monthlySummary = useMemo(() => {
    const now = currentDate;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let visits = 0;
    let studies = 0;

    activities.forEach((activity) => {
      const activityDate = new Date(activity.date);
      if (
        activityDate.getFullYear() === currentYear &&
        activityDate.getMonth() === currentMonth
      ) {
        if (activity.type === "visit") {
          visits++;
        } else if (activity.type === "study") {
          studies++;
        }
      }
    });

    return { visits, studies };
  }, [activities, currentDate]);

  const filteredActivities = useMemo(() => {
    if (activeTab !== "visits" && activeTab !== "studies") return [];
    const typeToShow = activeTab === "visits" ? "visit" : "study";
    return activities
      .filter((a) => a.type === typeToShow)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities, activeTab]);

  const dynamicTextColor =
    isSimpleMode && themeMode === "light" ? "text-slate-900" : theme.text;

  const tabs: { id: ActivityTab; label: string }[] = [
    { id: "groups", label: "Grupos" },
    { id: "visits", label: "Revisitas" },
    { id: "studies", label: "Estudios" },
    { id: "notes", label: "Notas" },
  ];

  const handleProcessComplete = (arrangements: GroupArrangement[]) => {
    onSaveArrangements(arrangements);
    setImportModalOpen(false);
  };

  const renderContent = () => {
    if (activeTab === "groups") {
      if (groupArrangements.length > 0) {
        return (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onSaveArrangements([])}
                className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <TrashIcon className="w-4 h-4" />
                Limpiar
              </button>
              <button
                id="import-groups-button"
                onClick={() => setImportModalOpen(true)}
                className={`flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-lg ${dynamicTextColor} ${theme.bg} bg-opacity-10 hover:bg-opacity-20`}
              >
                <ClipboardPasteIcon className="w-4 h-4" />
                Importar Nuevo
              </button>
            </div>
            {groupArrangements.map((arrangement, index) => (
              <GroupArrangementCard
                key={index}
                arrangement={arrangement}
                themeColor={themeColor}
              />
            ))}
          </div>
        );
      }
      return (
        <div className="text-center py-16 px-4">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Organiza tu semana
          </p>
          <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-md mx-auto">
            Copia el texto de los grupos de predicación que recibes y pégalo
            aquí para verlo de forma ordenada.
          </p>
          <button
            id="import-groups-button"
            onClick={() => setImportModalOpen(true)}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${
              theme.bg
            } text-white font-bold text-lg shadow-md transition-transform ${
              !performanceMode && "transform hover:scale-105"
            }`}
          >
            <ClipboardPasteIcon className="w-6 h-6" />
            Importar Grupos
          </button>
        </div>
      );
    }

    if (activeTab === "notes") {
      return (
        <div className="animate-fadeIn">
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={() => onSaveNotes(localNotes)}
            placeholder="Escribe aquí tus notas personales sobre el ministerio..."
            rows={15}
            className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none dark:text-white shadow-sm"
            aria-label="Área de notas"
          />
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
            Las notas se guardan automáticamente.
          </p>
        </div>
      );
    }

    if (filteredActivities.length > 0) {
      return (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              themeColor={themeColor}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-16 px-4">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          No hay {activeTab === "visits" ? "revisitas" : "estudios"} anotados.
        </p>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          ¡Usa el botón "Agregar" para empezar a registrar tu actividad!
        </p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        id="activity-tabs"
        className="bg-white dark:bg-slate-800 rounded-2xl p-2 sticky top-24 z-10 mb-4"
      >
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold rounded-md ${
                activeTab === tab.id
                  ? `bg-white dark:bg-slate-700 ${dynamicTextColor} dark:${theme.accentText} shadow`
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-4 mb-6 ${privacyBlur}`}>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${theme.bg} bg-opacity-10`}
          >
            <ArrowUturnLeftIcon className={`w-6 h-6 ${dynamicTextColor}`} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {isPrivacyMode ? "**" : monthlySummary.visits}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Revisitas este mes
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${theme.bg} bg-opacity-10`}
          >
            <BookOpenIcon className={`w-6 h-6 ${dynamicTextColor}`} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {isPrivacyMode ? "**" : monthlySummary.studies}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Estudios este mes
            </p>
          </div>
        </div>
      </div>

      {isPrivacyMode && activeTab !== "groups" ? (
        <div className="text-center py-16 px-4">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Modo de Privacidad Activado
          </p>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Desactiva el modo de privacidad para ver la actividad detallada.
          </p>
        </div>
      ) : (
        renderContent()
      )}

      <ImportArrangementModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onProcessComplete={handleProcessComplete}
        themeColor={themeColor}
        isOnline={isOnline}
        performanceMode={performanceMode}
      />
    </div>
  );
};

export default ActivityView;
