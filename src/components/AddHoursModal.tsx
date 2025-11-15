import React, { useState, useEffect, useMemo } from "react";
import {
  ThemeColor,
  ActivityItem,
  ActivityType,
  HistoryLog,
  WeatherCondition,
  DayStatus,
  DayEntry,
  PlanningData,
  PlanningBlock,
  UserRole,
} from "../types";
import { THEMES } from "../constants";
import { UserIcon } from "./icons/UserIcon";
import { LocationMarkerIcon } from "./icons/LocationMarkerIcon";
import { DocumentTextIcon } from "./icons/DocumentTextIcon";
import {
  hoursToHHMM,
  flexibleInputToHours,
  getServiceYear,
  formatDateKey,
} from "../utils";
import { SunIcon } from "./icons/SunIcon";
import { CloudIcon } from "./icons/CloudIcon";
import { RainIcon } from "./icons/RainIcon";
import { MedicalIcon } from "./icons/MedicalIcon";
import { ArrowUturnLeftIcon } from "./icons/ArrowUturnLeftIcon";
import { BookOpenIcon } from "./icons/BookOpenIcon";
import { XCircleIcon } from "./icons/XCircleIcon";
import ToggleSwitch from "./ToggleSwitch";
import { TrashIcon } from "./icons/TrashIcon";
import { MinusIcon } from "./icons/MinusIcon";
import { PlusIcon } from "./icons/PlusIcon";

interface AddHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHours: (hours: number, weather?: WeatherCondition) => void;
  onAddLdcHours: (hours: number, notes?: string) => void;
  onSetHours: (hours: number) => void;
  onSetLdcHours?: (hours: number) => void;
  onDeleteLdcHours?: () => void;
  onSaveActivity: (
    activity: Omit<ActivityItem, "id" | "date"> & { recurring?: boolean }
  ) => void;
  activityToEdit: ActivityItem | null;
  currentHours: number;
  currentLdcHours?: number;
  isEditMode: boolean;
  isEditLdcMode?: boolean;
  themeColor: ThemeColor;
  performanceMode: boolean;
  dateForEntry: Date | null;
  onSetHoursForDate: (
    hours: number,
    date: Date,
    weather?: WeatherCondition,
    isCampaign?: boolean
  ) => void;
  onSetLdcHoursForDate: (hours: number, date: Date, notes?: string) => void;
  onMarkDayStatus: (date: Date, status: DayStatus | null) => void;
  archives: Record<string, HistoryLog>;
  activities: ActivityItem[];
  planningData: PlanningData;
  userRole: UserRole;
  initialHours?: number | null;
}

type ModalTab = "hours" | "ldc" | "visit" | "study";

const weatherOptions: {
  id: WeatherCondition;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  selectedClass: string;
}[] = [
  {
    id: "sunny",
    Icon: SunIcon,
    label: "Soleado",
    selectedClass:
      "text-yellow-600 border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/30",
  },
  {
    id: "cloudy",
    Icon: CloudIcon,
    label: "Nublado",
    selectedClass:
      "text-slate-600 border-slate-400 bg-slate-100 dark:bg-slate-600/20 dark:border-slate-500/30",
  },
  {
    id: "bad",
    Icon: RainIcon,
    label: "Lluvioso/Ventoso",
    selectedClass:
      "text-blue-600 border-blue-400 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/30",
  },
];

const AddHoursModal: React.FC<AddHoursModalProps> = ({
  isOpen,
  onClose,
  onAddHours,
  onAddLdcHours,
  onSetHours,
  onSetLdcHours,
  onDeleteLdcHours,
  onSaveActivity,
  activityToEdit,
  currentHours,
  currentLdcHours = 0,
  isEditMode,
  isEditLdcMode = false,
  themeColor,
  performanceMode,
  dateForEntry,
  onSetHoursForDate,
  onSetLdcHoursForDate,
  onMarkDayStatus,
  archives,
  activities,
  planningData,
  userRole,
  initialHours,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>("hours");

  const [hoursInput, setHoursInput] = useState("");
  const [ldcHoursInput, setLdcHoursInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [isHoursValid, setIsHoursValid] = useState(true);
  const [isLdcHoursValid, setIsLdcHoursValid] = useState(true);
  const [selectedWeather, setSelectedWeather] = useState<
    WeatherCondition | undefined
  >(undefined);

  // Activity state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [comments, setComments] = useState("");
  const [isRecurringActivity, setIsRecurringActivity] = useState(false);
  const [isCampaignDay, setIsCampaignDay] = useState(false);

  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const theme = THEMES[themeColor] || THEMES.blue;
  const isPioneer = userRole !== "publisher";

  const isEditingActivity = !!activityToEdit;
  const isEditingForDate = !!dateForEntry;

  const dayEntryForDate: DayEntry | undefined = useMemo(() => {
    if (!dateForEntry) return undefined;
    const serviceYear = getServiceYear(dateForEntry);
    const yearHistory = archives[serviceYear] || {};
    const dateKey = formatDateKey(dateForEntry);
    return yearHistory[dateKey];
  }, [dateForEntry, archives]);

  const activitiesForDay = useMemo(() => {
    if (!dateForEntry) return [];
    return activities.filter((act) => {
      const actDate = new Date(act.date);
      return (
        actDate.getFullYear() === dateForEntry.getFullYear() &&
        actDate.getMonth() === dateForEntry.getMonth() &&
        actDate.getDate() === dateForEntry.getDate()
      );
    });
  }, [dateForEntry, activities]);

  const plannedBlocksForDay: PlanningBlock[] | undefined = useMemo(() => {
    if (!dateForEntry || !planningData) return undefined;
    const dateKey = formatDateKey(dateForEntry);
    return planningData[dateKey];
  }, [dateForEntry, planningData]);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Reset all non-input fields first
      setName("");
      setLocation("");
      setComments("");
      setIsHoursValid(true);
      setIsLdcHoursValid(true);
      setSelectedWeather(undefined);
      setIsRecurringActivity(false);
      setIsCampaignDay(false);
      setNotesInput("");

      if (initialHours && initialHours > 0) {
        setActiveTab("hours");
        setHoursInput(hoursToHHMM(initialHours));
        setLdcHoursInput("");
      } else if (activityToEdit) {
        setActiveTab(activityToEdit.type);
        setName(activityToEdit.name);
        setLocation(activityToEdit.location || "");
        setComments(activityToEdit.comments || "");
        setIsRecurringActivity(activityToEdit.recurring || false);
        setHoursInput("");
        setLdcHoursInput("");
      } else if (dateForEntry) {
        setActiveTab("hours");
        setHoursInput(
          dayEntryForDate && dayEntryForDate.hours > 0
            ? hoursToHHMM(dayEntryForDate.hours)
            : ""
        );
        setLdcHoursInput(
          dayEntryForDate &&
            dayEntryForDate.ldcHours &&
            dayEntryForDate.ldcHours > 0
            ? hoursToHHMM(dayEntryForDate.ldcHours)
            : ""
        );
        setSelectedWeather(dayEntryForDate?.weather);
        setIsCampaignDay(dayEntryForDate?.isCampaign || false);
        setNotesInput(dayEntryForDate?.notes || "");
      } else if (isEditLdcMode) {
        setActiveTab("ldc");
        setLdcHoursInput(hoursToHHMM(currentLdcHours));
        setHoursInput("");
      } else {
        // Default add or edit total
        setActiveTab("hours");
        if (isEditMode) {
          setHoursInput(hoursToHHMM(currentHours));
        } else {
          setHoursInput("");
        }
        setLdcHoursInput("");
      }
    }
  }, [
    isOpen,
    initialHours,
    activityToEdit,
    dateForEntry,
    isEditMode,
    isEditLdcMode,
    dayEntryForDate,
    currentHours,
    currentLdcHours,
  ]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHoursInput(value);
    if (value.trim() === "") {
      setIsHoursValid(true);
      return;
    }
    const decimalHours = flexibleInputToHours(value);
    setIsHoursValid(!isNaN(decimalHours) && decimalHours >= 0);
  };

  const handleLdcHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLdcHoursInput(value);
    if (value.trim() === "") {
      setIsLdcHoursValid(true);
      return;
    }
    const decimalHours = flexibleInputToHours(value);
    setIsLdcHoursValid(!isNaN(decimalHours) && decimalHours >= 0);
  };

  const handleHourStep = (step: number) => {
    const currentDecimal = flexibleInputToHours(hoursInput);
    const currentValue = isNaN(currentDecimal) ? 0 : currentDecimal;
    const newValue = Math.max(0, currentValue + step);
    setHoursInput(hoursToHHMM(newValue));
    setIsHoursValid(true);
  };

  const handleIncrementHour = () => handleHourStep(1);
  const handleDecrementHour = () => handleHourStep(-1);

  const handleLdcHourStep = (step: number) => {
    const currentDecimal = flexibleInputToHours(ldcHoursInput);
    const currentValue = isNaN(currentDecimal) ? 0 : currentDecimal;
    const newValue = Math.max(0, currentValue + step);
    setLdcHoursInput(hoursToHHMM(newValue));
    setIsLdcHoursValid(true);
  };

  const handleIncrementLdcHour = () => handleLdcHourStep(1);
  const handleDecrementLdcHour = () => handleLdcHourStep(-1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "hours") {
      const hoursValue = flexibleInputToHours(hoursInput);
      const finalHours = isNaN(hoursValue) || hoursValue < 0 ? 0 : hoursValue;

      if (isEditingForDate) {
        onSetHoursForDate(
          finalHours,
          dateForEntry!,
          selectedWeather,
          isCampaignDay
        );
      } else if (isEditMode) {
        onSetHours(finalHours);
      } else {
        onAddHours(finalHours, selectedWeather);
      }
    } else if (activeTab === "ldc") {
      const ldcHoursValue = flexibleInputToHours(ldcHoursInput);
      const finalLdcHours =
        isNaN(ldcHoursValue) || ldcHoursValue < 0 ? 0 : ldcHoursValue;
      if (isEditingForDate) {
        onSetLdcHoursForDate(finalLdcHours, dateForEntry!, notesInput);
      } else if (isEditLdcMode) {
        onSetLdcHours?.(finalLdcHours);
      } else {
        onAddLdcHours(finalLdcHours, notesInput);
      }
    } else {
      // visit or study
      if (name.trim() === "") return;
      onSaveActivity({
        type: activeTab as ActivityType,
        name,
        location,
        comments,
        recurring: isRecurringActivity,
      });
    }
  };

  const getModalTitle = () => {
    if (isEditingActivity)
      return `Editar ${
        activityToEdit.type === "study" ? "Estudio" : "Revisita"
      }`;
    if (isEditLdcMode) return "Editar Horas Acreditadas";
    if (dateForEntry) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const entryDate = new Date(dateForEntry);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() >= today.getTime()) {
        return `Planificar para ${dateForEntry.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
        })}`;
      }
      return `Actividad del ${dateForEntry.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      })}`;
    }
    if (isEditMode) return "Editar Total de Horas";
    if (activeTab === "ldc") return "Añadir Horas Acreditadas";
    return "Añadir Actividad";
  };

  const getButtonText = () => {
    if (isEditingActivity || isEditMode || isEditLdcMode || isEditingForDate)
      return "Guardar Cambios";
    if (activeTab === "hours") return "Añadir";
    if (activeTab === "ldc") return "Guardar Horas Acreditadas";
    return "Guardar Actividad";
  };

  const handleSickClick = () => {
    if (dateForEntry) {
      const isCurrentlySick = dayEntryForDate?.status === "sick";
      onMarkDayStatus(dateForEntry, isCurrentlySick ? null : "sick");
    }
  };

  const isDaySick = dayEntryForDate?.status === "sick";

  const TABS_ORDER: ModalTab[] = ["hours", "ldc", "visit", "study"].filter(
    (tab) => isPioneer || tab !== "ldc"
  ) as ModalTab[];
  const TABS_LABELS: Record<ModalTab, string> = {
    hours: "Horas",
    ldc: "LDC",
    visit: "Revisita",
    study: "Estudio",
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        hasBeenOpened ? "transition-colors duration-300" : ""
      } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-hours-title"
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
            {!isEditingForDate && !isEditingActivity && !isEditLdcMode && (
              <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 mb-6">
                {TABS_ORDER.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md ${
                      activeTab === tab
                        ? `bg-white dark:bg-slate-700 ${theme.text} shadow`
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {TABS_LABELS[tab]}
                  </button>
                ))}
              </div>
            )}
            {isEditingForDate && !isEditingActivity && isPioneer && (
              <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 mb-6">
                {["hours", "ldc"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab as ModalTab)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md ${
                      activeTab === tab
                        ? `bg-white dark:bg-slate-700 ${theme.text} shadow`
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {tab === "hours" ? "Predicación" : "LDC"}
                  </button>
                ))}
              </div>
            )}

            {activeTab === "hours" && (
              <div className="space-y-4">
                <h2
                  id="add-hours-title"
                  className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center"
                >
                  {getModalTitle()}
                </h2>
                {!isEditMode && !dateForEntry && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 -mt-3">
                    Añadir Horas
                  </p>
                )}

                {isEditingForDate &&
                  plannedBlocksForDay &&
                  plannedBlocksForDay.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 text-center">
                        Planes del Día
                      </h3>
                      <div className="space-y-2 bg-slate-200/50 dark:bg-slate-800/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                        {plannedBlocksForDay.map((block) => (
                          <div key={block.id}>
                            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                              {block.title}
                            </p>
                            {block.activityIds.length > 0 && (
                              <ul className="pl-4 mt-1 space-y-0.5">
                                {block.activityIds.map((id) => {
                                  const activity = activities.find(
                                    (a) => a.id === id
                                  );
                                  if (!activity) return null;
                                  return (
                                    <li
                                      key={id}
                                      className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                                    >
                                      {activity.type === "study" ? (
                                        <BookOpenIcon className="w-3.5 h-3.5" />
                                      ) : (
                                        <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                                      )}
                                      <span>{activity.name}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {isEditingForDate && activitiesForDay.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2 text-center">
                      Actividad Registrada
                    </h3>
                    <div className="space-y-2">
                      {activitiesForDay.map((act) => (
                        <div
                          key={act.id}
                          className="bg-slate-200 dark:bg-slate-800 p-2 rounded-lg flex items-center"
                        >
                          {act.type === "visit" ? (
                            <ArrowUturnLeftIcon
                              className={`w-5 h-5 mr-2 ${theme.text}`}
                            />
                          ) : (
                            <BookOpenIcon
                              className={`w-5 h-5 mr-2 ${theme.text}`}
                            />
                          )}
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {act.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="hours-input" className="sr-only">
                    Horas
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDecrementHour}
                      className={`p-3 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors ${
                        isDaySick ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isDaySick}
                      aria-label="Restar una hora"
                    >
                      <MinusIcon className="w-6 h-6" />
                    </button>
                    <input
                      id="hours-input"
                      type="text"
                      value={hoursInput}
                      onChange={handleHoursChange}
                      placeholder="1:30"
                      className={`w-full px-4 py-3 text-center text-2xl font-bold bg-white dark:bg-slate-800 border rounded-lg focus:ring-2 ${
                        theme.ring
                      } outline-none transition dark:text-white ${
                        isHoursValid
                          ? "border-slate-300 dark:border-slate-600"
                          : "border-red-500 ring-2 ring-red-300"
                      }`}
                      onFocus={(e) => e.target.select()}
                      autoFocus={isOpen && !initialHours}
                      disabled={isDaySick}
                    />
                    <button
                      type="button"
                      onClick={handleIncrementHour}
                      className={`p-3 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors ${
                        isDaySick ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isDaySick}
                      aria-label="Añadir una hora"
                    >
                      <PlusIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                {!isHoursValid && (
                  <p className="text-red-600 text-sm text-center -mt-2 mb-2">
                    Formato inválido. Usa H:MM, H.MM o solo horas.
                  </p>
                )}

                {(!isEditMode || isEditingForDate) && (
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      ¿Qué tal estuvo el clima?
                    </label>
                    <div className="flex justify-center space-x-3">
                      {weatherOptions.map(
                        ({ id, Icon, label, selectedClass }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() =>
                              setSelectedWeather((w) =>
                                w === id ? undefined : id
                              )
                            }
                            className={`p-3 border-2 rounded-lg transition-all ${
                              selectedWeather === id
                                ? selectedClass
                                : "border-slate-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                            }`}
                            aria-pressed={selectedWeather === id}
                            title={label}
                          >
                            <Icon
                              className={`w-6 h-6 ${
                                selectedWeather !== id
                                  ? "text-slate-500 dark:text-slate-400"
                                  : ""
                              }`}
                            />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {isEditingForDate && (
                  <div className="mt-4 bg-white dark:bg-slate-800 p-3 rounded-lg space-y-3 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="campaign-toggle"
                        className="font-semibold text-slate-700 dark:text-slate-200"
                      >
                        Día de Campaña
                      </label>
                      <ToggleSwitch
                        checked={isCampaignDay}
                        onChange={setIsCampaignDay}
                        themeColor={themeColor}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "ldc" && isPioneer && (
              <div className="space-y-4">
                <h2
                  id="ldc-title"
                  className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center"
                >
                  {getModalTitle()}
                </h2>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 -mt-2">
                  Estas horas no cuentan para tu meta mensual.
                </p>
                <div>
                  <label htmlFor="ldc-hours-input" className="sr-only">
                    Horas LDC
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDecrementLdcHour}
                      className={`p-3 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors ${
                        isDaySick ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isDaySick}
                      aria-label="Restar una hora"
                    >
                      <MinusIcon className="w-6 h-6" />
                    </button>
                    <input
                      id="ldc-hours-input"
                      type="text"
                      value={ldcHoursInput}
                      onChange={handleLdcHoursChange}
                      placeholder="Ej: 8:00 o 6.5"
                      className={`w-full px-4 py-3 text-center text-2xl font-bold bg-white dark:bg-slate-800 border rounded-lg focus:ring-2 ${
                        theme.ring
                      } outline-none transition dark:text-white ${
                        isLdcHoursValid
                          ? "border-slate-300 dark:border-slate-600"
                          : "border-red-500 ring-2 ring-red-300"
                      }`}
                      onFocus={(e) => e.target.select()}
                      autoFocus={isOpen}
                      disabled={isDaySick}
                    />
                    <button
                      type="button"
                      onClick={handleIncrementLdcHour}
                      className={`p-3 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors ${
                        isDaySick ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isDaySick}
                      aria-label="Añadir una hora"
                    >
                      <PlusIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                {!isLdcHoursValid && (
                  <p className="text-red-600 text-sm text-center -mt-2 mb-2">
                    Formato inválido. Usa H:MM, H.MM o solo horas.
                  </p>
                )}

                <div>
                  <label
                    htmlFor="notes-input"
                    className="block text-center text-sm font-medium text-slate-600 dark:text-slate-400 mb-2"
                  >
                    Tus notas
                  </label>
                  <textarea
                    id="notes-input"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="¿Qué actividad hiciste? ¿qué trabajaste?"
                    rows={3}
                    className={`w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${theme.ring} outline-none transition resize-none dark:text-white`}
                    disabled={isDaySick}
                  ></textarea>
                </div>
              </div>
            )}

            {(activeTab === "visit" || activeTab === "study") && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
                  {isEditingActivity ? "Editar" : "Anotar"}{" "}
                  {activeTab === "visit" ? "Revisita" : "Estudio"}
                </h2>
                <div>
                  <label htmlFor="name-input" className="sr-only">
                    Nombre
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </span>
                    <input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nombre de la persona"
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${theme.ring} outline-none transition dark:text-white`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="location-input" className="sr-only">
                    Ubicación
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <LocationMarkerIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </span>
                    <input
                      id="location-input"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ubicación (dirección, etc.)"
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${theme.ring} outline-none transition dark:text-white`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="comments-input" className="sr-only">
                    Comentarios
                  </label>
                  <div className="relative">
                    <span className="absolute top-3 left-0 flex items-center pl-3">
                      <DocumentTextIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </span>
                    <textarea
                      id="comments-input"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Comentarios (tema, próxima visita, etc.)"
                      rows={3}
                      className={`w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${theme.ring} outline-none transition resize-none dark:text-white`}
                    ></textarea>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="recurring-toggle"
                      className="font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Repetir cada semana
                    </label>
                    <ToggleSwitch
                      checked={isRecurringActivity}
                      onChange={setIsRecurringActivity}
                      themeColor={themeColor}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3 mt-6">
              <button
                type="submit"
                className={`w-full px-6 py-3 rounded-lg ${
                  theme.bg
                } text-white font-bold text-lg shadow-lg transition-transform disabled:opacity-70 disabled:cursor-not-allowed ${
                  !performanceMode && "transform hover:scale-105"
                }`}
                disabled={
                  (!isHoursValid && activeTab === "hours") ||
                  (!isLdcHoursValid && activeTab === "ldc")
                }
              >
                {getButtonText()}
              </button>
              {isEditingForDate && (
                <button
                  type="button"
                  onClick={handleSickClick}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold ${
                    isDaySick
                      ? "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50"
                      : "text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {isDaySick ? (
                    <XCircleIcon className="w-5 h-5" />
                  ) : (
                    <MedicalIcon className="w-5 h-5" />
                  )}
                  {isDaySick ? "Desmarcar como enfermo" : "Marcar como enfermo"}
                </button>
              )}
              {isEditLdcMode && onDeleteLdcHours && isPioneer && (
                <button
                  type="button"
                  onClick={onDeleteLdcHours}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70"
                >
                  <TrashIcon className="w-5 h-5" />
                  Eliminar Horas Acreditadas del Mes
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

export default AddHoursModal;
