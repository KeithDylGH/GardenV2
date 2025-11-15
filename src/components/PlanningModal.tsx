import React, { useState, useEffect, useMemo } from "react";
import { ThemeColor, PlanningBlock, ActivityItem } from "../types";
import { THEMES } from "../constants";
import { TrashIcon } from "./icons/TrashIcon";
import { BookOpenIcon } from "./icons/BookOpenIcon";
import { ArrowUturnLeftIcon } from "./icons/ArrowUturnLeftIcon";

interface PlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  blockToEdit: PlanningBlock | null;
  onSave: (date: Date, blockData: Omit<PlanningBlock, "id">) => void;
  onDelete: (date: Date, blockId: string) => void;
  activities: ActivityItem[];
  themeColor: ThemeColor;
  performanceMode: boolean;
}

const PlanningModal: React.FC<PlanningModalProps> = ({
  isOpen,
  onClose,
  date,
  blockToEdit,
  onSave,
  onDelete,
  activities,
  themeColor,
  performanceMode,
}) => {
  const [title, setTitle] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(
    new Set()
  );
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const theme = THEMES[themeColor] || THEMES.blue;

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
      if (blockToEdit) {
        setTitle(blockToEdit.title);
        setTimeRange(blockToEdit.timeRange || "");
        setSelectedActivityIds(new Set(blockToEdit.activityIds));
      } else {
        setTitle("");
        setTimeRange("");
        setSelectedActivityIds(new Set());
      }
    }
  }, [isOpen, blockToEdit]);

  const availableActivities = useMemo(() => {
    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && title.trim()) {
      onSave(date, {
        title: title.trim(),
        timeRange: timeRange.trim(),
        activityIds: Array.from(selectedActivityIds),
      });
    }
  };

  const handleDelete = () => {
    if (date && blockToEdit) {
      onDelete(date, blockToEdit.id);
    }
  };

  const toggleActivitySelection = (id: string) => {
    setSelectedActivityIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (!date) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${
        hasBeenOpened ? "transition-colors duration-300" : ""
      } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="planning-modal-title"
    >
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-slate-900 rounded-t-2xl shadow-2xl ${
          hasBeenOpened
            ? `transition-transform ${
                performanceMode ? "duration-0" : "duration-300"
              } ease-in-out`
            : ""
        } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-4" />
        <div className="p-6 pt-0 max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <h2
              id="planning-modal-title"
              className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-1"
            >
              {blockToEdit ? "Editar Plan" : "Añadir Plan"}
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
              {date.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="plan-title"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Título
                </label>
                <input
                  id="plan-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Predicación Matutina"
                  className={`mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg focus:ring-2 ${theme.ring} outline-none transition dark:text-white border-slate-300 dark:border-slate-600`}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="plan-time"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Horario (opcional)
                </label>
                <input
                  id="plan-time"
                  type="text"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  placeholder="Ej: 9:00 - 12:00"
                  className={`mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg focus:ring-2 ${theme.ring} outline-none transition dark:text-white border-slate-300 dark:border-slate-600`}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Vincular Actividades
                </label>
                <div className="mt-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                  {availableActivities.length > 0 ? (
                    availableActivities.map((act) => (
                      <button
                        type="button"
                        key={act.id}
                        onClick={() => toggleActivitySelection(act.id)}
                        className={`w-full text-left p-2 rounded-md flex items-center gap-3 ${
                          selectedActivityIds.has(act.id)
                            ? `${theme.bg} bg-opacity-10 dark:bg-opacity-20`
                            : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center ${
                            selectedActivityIds.has(act.id)
                              ? `${theme.bg} border-transparent`
                              : "border-slate-300 dark:border-slate-500"
                          }`}
                        >
                          {selectedActivityIds.has(act.id) && (
                            <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                          )}
                        </div>
                        {act.type === "study" ? (
                          <BookOpenIcon className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ArrowUturnLeftIcon className="w-5 h-5 text-slate-500" />
                        )}
                        <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                          {act.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
                      No hay revisitas o estudios para vincular.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3 mt-6">
              <button
                type="submit"
                className={`w-full px-6 py-3 rounded-lg ${
                  theme.bg
                } text-white font-bold text-lg shadow-lg transition-transform ${
                  !performanceMode && "transform hover:scale-105"
                }`}
              >
                {blockToEdit ? "Guardar Cambios" : "Guardar Plan"}
              </button>
              {blockToEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70"
                >
                  <TrashIcon className="w-5 h-5" />
                  Eliminar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlanningModal;
