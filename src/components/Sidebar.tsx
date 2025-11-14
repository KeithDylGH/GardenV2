import React, { useState, useEffect } from "react";
import ToggleSwitch from "./ToggleSwitch";
import { ThemeColor, UserRole, ThemeMode } from "../types";
import { THEMES } from "../constants";
import { HeartIcon } from "./icons/HeartIcon";
import { ChatBubbleBottomCenterTextIcon } from "./icons/ChatBubbleBottomCenterTextIcon";
import { BoltIcon } from "./icons/BoltIcon";
import { ArrowDownTrayIcon } from "./icons/ArrowDownTrayIcon";
import { ArrowUpTrayIcon } from "./icons/ArrowUpTrayIcon";
import { SettingsIcon } from "./icons/SettingsIcon";
import { StarIcon } from "./icons/StarIcon";
import { TrophyIcon } from "./icons/TrophyIcon";
import { FaceSmileIcon } from "./icons/FaceSmileIcon";
import { UserIcon } from "./icons/UserIcon";
import { GardenIcon } from "./icons/GardenIcon";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  profilePicture: string | null;
  onProfileClick: () => void;
  performanceMode: boolean;
  onSetPerformanceMode: (enabled: boolean) => void;
  onExport: () => void;
  onImport: () => void;
  themeColor: ThemeColor;
  onSettingsClick: () => void;
  userRole: UserRole;
  onPioneerUpgradeClick: () => void;
  onAchievementsClick: () => void;
  isSimpleMode: boolean;
  onSetSimpleMode: (enabled: boolean) => void;
  themeMode: ThemeMode;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  userName,
  profilePicture,
  onProfileClick,
  performanceMode,
  onSetPerformanceMode,
  onExport,
  onImport,
  themeColor,
  onSettingsClick,
  userRole,
  onPioneerUpgradeClick,
  onAchievementsClick,
  isSimpleMode,
  onSetSimpleMode,
  themeMode,
}) => {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const theme = THEMES[themeColor] || THEMES.blue;

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  const iconAndTextColorClass =
    isSimpleMode && themeMode === "light" ? "text-slate-900" : theme.text;

  const sidebarContent = (
    <>
      <button
        onClick={onProfileClick}
        className="w-full text-left p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-7 h-7 text-slate-500 dark:text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-lg text-slate-800 dark:text-slate-100">
              {userName}
            </p>
            <p className={`text-sm font-semibold ${iconAndTextColorClass}`}>
              Ver Perfil
            </p>
          </div>
        </div>
        <div className="text-right">
          <GardenIcon className={`w-8 h-8 ${iconAndTextColorClass}`} />
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
            V1.2
          </p>
        </div>
      </button>

      <div className="p-4 flex-grow overflow-y-auto">
        {/* Data Management */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Gestión de Datos
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-700">
            <button
              onClick={onExport}
              className="w-full text-left p-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <ArrowUpTrayIcon
                className={`w-6 h-6 mr-3 ${iconAndTextColorClass}`}
              />
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                Exportar Datos
              </p>
            </button>
            <button
              onClick={onImport}
              className="w-full text-left p-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <ArrowDownTrayIcon
                className={`w-6 h-6 mr-3 ${iconAndTextColorClass}`}
              />
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                Importar Datos
              </p>
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Opciones
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-700">
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center">
                <FaceSmileIcon
                  className={`w-6 h-6 mr-3 ${iconAndTextColorClass}`}
                />
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    Modo Simplificado
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Interfaz más sencilla.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={isSimpleMode}
                onChange={onSetSimpleMode}
                themeColor={themeColor}
              />
            </div>
            {!isSimpleMode && (
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <BoltIcon
                    className={`w-6 h-6 mr-3 ${iconAndTextColorClass}`}
                  />
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Modo Rendimiento
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Desactiva animaciones.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={performanceMode}
                  onChange={onSetPerformanceMode}
                  themeColor={themeColor}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Acciones
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-lg divide-y divide-slate-200 dark:divide-slate-700">
            {!isSimpleMode && userRole === "publisher" && (
              <button
                onClick={onPioneerUpgradeClick}
                className="w-full text-left p-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <StarIcon className={`w-6 h-6 mr-3 ${iconAndTextColorClass}`} />
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  Precursorado
                </p>
              </button>
            )}
            {!isSimpleMode && (
              <button
                onClick={onAchievementsClick}
                className="w-full text-left p-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <TrophyIcon
                  className={`w-6 h-6 mr-3 ${iconAndTextColorClass}`}
                />
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  Logros
                </p>
              </button>
            )}
            <button
              onClick={onSettingsClick}
              className="w-full text-left p-3 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
              <SettingsIcon
                className={`w-6 h-6 mr-3 ${iconAndTextColorClass}`}
              />
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                Apariencia
              </p>
            </button>
          </div>
        </div>

        {/* Credits */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Créditos
          </h3>
          <div className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-lg">
            <HeartIcon className={`w-6 h-6 mr-3 ${iconAndTextColorClass}`} />
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              Desarrollado con amor
            </p>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Feedback
          </h3>
          <a
            href="mailto:giangia83@gmail.com"
            className="w-full text-left p-3 flex items-center bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <ChatBubbleBottomCenterTextIcon
              className={`w-6 h-6 mr-3 ${iconAndTextColorClass}`}
            />
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                Feedback y Sugerencias
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                giangia83@gmail.com
              </p>
            </div>
          </a>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`fixed inset-0 z-40 ${
        hasBeenOpened ? "transition-colors duration-300" : ""
      } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-gray-100 dark:bg-slate-900 shadow-2xl flex flex-col ${
          hasBeenOpened
            ? `transition-transform ${
                performanceMode ? "duration-0" : "duration-300"
              } ease-in-out`
            : ""
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {sidebarContent}
      </aside>
    </div>
  );
};

export default Sidebar;
