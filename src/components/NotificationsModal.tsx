import React, { useState, useEffect } from "react";
import { ThemeColor, ThemeMode } from "../types";
import { THEMES } from "../constants";
import ToggleSwitch from "./ToggleSwitch";
import { NotificationIcon } from "./icons/NotificationIcon";
import { ClockIcon } from "./icons/ClockIcon";
import { PaperAirplaneIcon } from "./icons/PaperAirplaneIcon";
import { ArrowUturnLeftIcon } from "./icons/ArrowUturnLeftIcon";
import { BookOpenIcon } from "./icons/BookOpenIcon";
import { CalendarPlanIcon } from "./icons/CalendarPlanIcon";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportNotificationEnabled: boolean;
  onToggleReportNotification: (enabled: boolean) => void;
  visitNotificationsEnabled: boolean;
  onToggleVisitNotifications: (enabled: boolean) => void;
  studyNotificationsEnabled: boolean;
  onToggleStudyNotifications: (enabled: boolean) => void;
  planNotificationsEnabled: boolean;
  onTogglePlanNotifications: (enabled: boolean) => void;
  showTimer: boolean;
  onToggleShowTimer: (enabled: boolean) => void;
  themeColor: ThemeColor;
  themeMode: ThemeMode;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  reportNotificationEnabled,
  onToggleReportNotification,
  visitNotificationsEnabled,
  onToggleVisitNotifications,
  studyNotificationsEnabled,
  onToggleStudyNotifications,
  planNotificationsEnabled,
  onTogglePlanNotifications,
  showTimer,
  onToggleShowTimer,
  themeColor,
  themeMode,
}) => {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const theme = THEMES[themeColor] || THEMES.blue;

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 ${hasBeenOpened ? "transition-colors duration-300" : ""
        } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-50 dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-2">
            <NotificationIcon className={`w-6 h-6 ${themeColor === 'custom' ? 'text-custom' : theme.text}`} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Notificaciones
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="sr-only">Cerrar</span>
            <svg
              className="w-6 h-6 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">

          {/* Section: Recordatorios */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Recordatorios
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${themeColor === "custom" ? "bg-custom-subtle" : `${theme.bg} bg-opacity-10 dark:bg-opacity-20`
                    }`}>
                    <PaperAirplaneIcon className={`w-5 h-5 ${themeColor === "custom" ? "text-custom" : theme.text}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Recordar Informe
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Notificación el día 1 de cada mes.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={reportNotificationEnabled}
                  onChange={onToggleReportNotification}
                  themeColor={themeColor}
                />
              </div>

              {/* Visit Reminders */}
              <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${themeColor === "custom" ? "bg-custom-subtle" : `${theme.bg} bg-opacity-10 dark:bg-opacity-20`
                    }`}>
                    <ArrowUturnLeftIcon className={`w-5 h-5 ${themeColor === "custom" ? "text-custom" : theme.text}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Recordar Revisitas
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Aviso a las 7:00 AM el día seleccionado.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={visitNotificationsEnabled}
                  onChange={onToggleVisitNotifications}
                  themeColor={themeColor}
                />
              </div>

              {/* Study Reminders */}
              <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${themeColor === "custom" ? "bg-custom-subtle" : `${theme.bg} bg-opacity-10 dark:bg-opacity-20`
                    }`}>
                    <BookOpenIcon className={`w-5 h-5 ${themeColor === "custom" ? "text-custom" : theme.text}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Recordar Estudios
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Aviso a las 7:00 AM el día seleccionado.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={studyNotificationsEnabled}
                  onChange={onToggleStudyNotifications}
                  themeColor={themeColor}
                />
              </div>

              {/* Plan Reminders */}
              <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${themeColor === "custom" ? "bg-custom-subtle" : `${theme.bg} bg-opacity-10 dark:bg-opacity-20`
                    }`}>
                    <CalendarPlanIcon className={`w-5 h-5 ${themeColor === "custom" ? "text-custom" : theme.text}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Recordar Planes
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Aviso a la hora configurada en cada plan.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={planNotificationsEnabled}
                  onChange={onTogglePlanNotifications}
                  themeColor={themeColor}
                />
              </div>
            </div>
          </section>

          {/* Section: Interfaz */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Interfaz
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${themeColor === "custom" ? "bg-custom-subtle" : `${theme.bg} bg-opacity-10 dark:bg-opacity-20`
                    }`}>
                    <ClockIcon className={`w-5 h-5 ${themeColor === "custom" ? "text-custom" : theme.text}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Mostrar Temporizador
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Muestra el contador en la pantalla principal.
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={showTimer}
                  onChange={onToggleShowTimer}
                  themeColor={themeColor}
                />
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
