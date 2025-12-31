import React, { useState, useEffect } from "react";
import { ThemeColor, GroupArrangement } from "../types";
import { THEMES } from "../constants";
import { UserIcon } from "./icons/UserIcon";
import { LocationMarkerIcon } from "./icons/LocationMarkerIcon";
import { ClockIcon } from "./icons/ClockIcon";
import { TerritoryIcon } from "./icons/TerritoryIcon";
import { TrashIcon } from "./icons/TrashIcon";

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  arrangement: GroupArrangement | null;
  onSave: (updated: GroupArrangement) => void;
  onDelete?: () => void;
  themeColor: ThemeColor;
  performanceMode: boolean;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  arrangement,
  onSave,
  onDelete,
  themeColor,
  performanceMode,
}) => {
  const [groupNumber, setGroupNumber] = useState("");
  const [conductor, setConductor] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [territory, setTerritory] = useState("");
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  const theme = THEMES[themeColor] || THEMES.blue;

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
      if (arrangement) {
        setGroupNumber(arrangement.groupNumber || "");
        setConductor(arrangement.conductor || "");
        setTime(arrangement.time || "");
        setLocation(arrangement.location || "");
        setTerritory(arrangement.territory || "");
      }
    }
  }, [isOpen, arrangement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      groupNumber,
      conductor,
      time,
      location,
      territory,
    });
    onClose();
  };

  if (!isOpen && !hasBeenOpened) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] ${hasBeenOpened ? "transition-colors duration-300" : ""
        } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-slate-900 rounded-t-2xl shadow-2xl ${hasBeenOpened
          ? `transition-transform ${performanceMode ? "duration-0" : "duration-300"
          } ease-in-out`
          : ""
          } ${isOpen ? "translate-y-0" : "translate-y-full"} pb-[env(safe-area-inset-bottom)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-4 flex-shrink-0" />
        <div className="p-6 pt-0 max-h-[calc(100dvh-env(safe-area-inset-top)-3rem)] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-6">
              {onDelete ? "Editar Grupo" : "Editar Grupo Importado"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <div className="w-1 h-4 bg-slate-400 rounded-full" />
                  Grupo (Nombre o Número)
                </label>
                <input
                  type="text"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                  placeholder="Ej: Grupo 1"
                  className={`mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg focus:ring-2 ${themeColor === "custom" ? "ring-custom" : theme.ring
                    } outline-none transition dark:text-white border-slate-300 dark:border-slate-600`}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Conductor
                </label>
                <input
                  type="text"
                  value={conductor}
                  onChange={(e) => setConductor(e.target.value)}
                  placeholder="Ej: Hno. Pérez"
                  className={`mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg focus:ring-2 ${themeColor === "custom" ? "ring-custom" : theme.ring
                    } outline-none transition dark:text-white border-slate-300 dark:border-slate-600`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-slate-400" />
                    Hora
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Ej: 9:00 AM"
                    className={`mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg focus:ring-2 ${themeColor === "custom" ? "ring-custom" : theme.ring
                      } outline-none transition dark:text-white border-slate-300 dark:border-slate-600`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <TerritoryIcon className="w-4 h-4 text-slate-400" />
                    Territorio
                  </label>
                  <input
                    type="text"
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    placeholder="Ej: Centro"
                    className={`mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg focus:ring-2 ${themeColor === "custom" ? "ring-custom" : theme.ring
                      } outline-none transition dark:text-white border-slate-300 dark:border-slate-600`}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <LocationMarkerIcon className="w-4 h-4 text-slate-400" />
                  Lugar de Encuentro
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Salón del Reino"
                  className={`mt-1 w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg focus:ring-2 ${themeColor === "custom" ? "ring-custom" : theme.ring
                    } outline-none transition dark:text-white border-slate-300 dark:border-slate-600`}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-3 mt-8">
              <button
                type="submit"
                className={`w-full px-6 py-3 rounded-lg ${themeColor === "custom" ? "bg-custom" : theme.bg
                  } text-white font-bold text-lg shadow-lg transition-transform ${!performanceMode && "transform hover:scale-105"
                  }`}
              >
                Guardar Cambios
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70"
                >
                  <TrashIcon className="w-5 h-5" />
                  Eliminar Grupo
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

export default EditGroupModal;
