import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ActivityItem,
  ThemeColor,
  GroupArrangement,
  ThemeMode,
} from "../types";
import { THEMES } from "../constants";
import ActivityCard from "./ActivityCard";
import GroupArrangementCard from "./GroupArrangementCard";
import { ClipboardPasteIcon } from "./icons/ClipboardPasteIcon";
import { TrashIcon } from "./icons/TrashIcon";
import { ArrowUturnLeftIcon } from "./icons/ArrowUturnLeftIcon";
import { BookOpenIcon } from "./icons/BookOpenIcon";
import EditGroupModal from "./EditGroupModal";
import { PencilIcon } from "./icons/PencilIcon";

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
  onImportClick: () => void;
  themeMode: ThemeMode;
  onUpdateGroup: (index: number, updated: GroupArrangement) => void;
  onDeleteGroup: (index: number) => void;
  onImportActivity: (activity: ActivityItem) => void;
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
  onImportClick,
  themeMode,
  onUpdateGroup,
  onDeleteGroup,
  onImportActivity,
}) => {
  const [activeTab, setActiveTab] = useState<ActivityTab>("groups");
  const [localNotes, setLocalNotes] = useState(notes);
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = THEMES[themeColor] || THEMES.blue;
  const privacyBlur = isPrivacyMode
    ? "blur-md select-none pointer-events-none"
    : "";

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const monthlySummary = useMemo(() => {
    let visits = 0;
    let studies = 0;

    activities.forEach((activity) => {
      if (activity.type === "visit") {
        visits++;
      } else if (activity.type === "study") {
        studies++;
      }
    });

    return { visits, studies };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (activeTab !== "visits" && activeTab !== "studies") return [];
    const typeToShow = activeTab === "visits" ? "visit" : "study";
    return activities
      .filter((a) => a.type === typeToShow)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities, activeTab]);

  const dynamicTextColor = theme.text;

  const tabs: { id: ActivityTab; label: string }[] = [
    { id: "groups", label: "Grupos" },
    { id: "visits", label: "Revisitas" },
    { id: "studies", label: "Cursos" },
    { id: "notes", label: "Notas" },
  ];

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
                onClick={onImportClick}
                className={`flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-lg ${
                  themeColor === "custom" ? "bg-custom-subtle text-custom" : `${theme.bg} bg-opacity-10 hover:bg-opacity-20 ${dynamicTextColor}`
                }`}
              >
                <ClipboardPasteIcon className="w-4 h-4" />
                Importar Nuevo
              </button>
            </div>
            {groupArrangements.map((arrangement, index) => (
              <div key={index} className="relative group">
                <GroupArrangementCard
                  arrangement={arrangement}
                  themeColor={themeColor}
                />
                <button
                  onClick={() => {
                    setEditingGroupIndex(index);
                    setIsEditGroupModalOpen(true);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Editar grupo"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              </div>
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
            Copia el texto o imagen de los grupos de predicación que recibes y pégalo
            aquí para verlo de forma ordenada.
          </p>
          <button
            id="import-groups-button"
            onClick={onImportClick}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${
              themeColor === "custom" ? "bg-custom" : theme.bg
              } text-white font-bold text-lg shadow-md transition-transform ${!performanceMode && "transform hover:scale-105"
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
            className={`w-full p-4 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 rounded-2xl focus:ring-2 ${
              themeColor === "custom" ? "ring-custom" : "focus:ring-blue-500"
            } outline-none transition resize-none dark:text-white shadow-sm`}
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
          <div className="flex justify-end">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg ${
                themeColor === "custom" ? "bg-custom-subtle text-custom" : `${theme.bg} bg-opacity-10 hover:bg-opacity-20 ${dynamicTextColor}`
              }`}
            >
              <ClipboardPasteIcon className="w-4 h-4" />
              Importar {activeTab === "visits" ? "Revisita" : "Curso"}
            </button>
          </div>
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
          No hay {activeTab === "visits" ? "revisitas" : "cursos"} anotados.
        </p>
        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-slate-500 dark:text-slate-400">
            ¡Usa el botón "Agregar" para empezar o importa un archivo!
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              themeColor === "custom" ? "bg-custom-subtle text-custom" : `${theme.bg} bg-opacity-10 ${theme.text}`
            } font-semibold`}
          >
            <ClipboardPasteIcon className="w-5 h-5" />
            Importar Archivo
          </button>
        </div>
      </div>
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        
        if (imported.type === "garden_activity_import" && imported.data) {
          // Reset file input
          e.target.value = "";
          onImportActivity(imported.data);
        } else {
          alert("Archivo no válido o formato incorrecto.");
        }
      } catch (err) {
        console.error("Error parsing import file:", err);
        alert("Error al leer el archivo.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        id="activity-tabs"
        className="bg-white dark:bg-slate-800 rounded-2xl p-2 sticky top-0 z-10 mb-4 mt-4 shadow-sm"
      >
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold rounded-md ${activeTab === tab.id
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
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              themeColor === "custom" ? "bg-custom-subtle" : `${theme.bg} bg-opacity-10`
            }`}
          >
            <ArrowUturnLeftIcon className={`w-6 h-6 ${dynamicTextColor}`} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {isPrivacyMode ? "**" : monthlySummary.visits}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Revisitas actuales
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              themeColor === "custom" ? "bg-custom-subtle" : `${theme.bg} bg-opacity-10`
            }`}
          >
            <BookOpenIcon className={`w-6 h-6 ${dynamicTextColor}`} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {isPrivacyMode ? "**" : monthlySummary.studies}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cursos actuales
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

      <EditGroupModal
        isOpen={isEditGroupModalOpen}
        onClose={() => setIsEditGroupModalOpen(false)}
        arrangement={editingGroupIndex !== null ? groupArrangements[editingGroupIndex] : null}
        onSave={(updated) => editingGroupIndex !== null && onUpdateGroup(editingGroupIndex, updated)}
        onDelete={() => editingGroupIndex !== null && onDeleteGroup(editingGroupIndex)}
        themeColor={themeColor}
        performanceMode={performanceMode}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json,text/plain"
        className="hidden"
      />
    </div>
  );
};

export default ActivityView;
