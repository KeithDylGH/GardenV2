import React, { useState, useEffect, useRef } from "react";
import { ThemeColor, UserRole } from "../types";
import { THEMES } from "../constants";
import { UserIcon } from "./icons/UserIcon";
import { PencilIcon } from "./icons/PencilIcon";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    goal: number,
    profilePic: string | null,
    meetingDays: number[],
    role: UserRole
  ) => void;
  currentName: string;
  currentGoal: number;
  currentRole: UserRole;
  currentProfilePicture: string | null;
  currentMeetingDays: number[];
  themeColor: ThemeColor;
  performanceMode: boolean;
}

const weekDays = [
  { label: "D", value: 0 },
  { label: "L", value: 1 },
  { label: "M", value: 2 },
  { label: "M", value: 3 },
  { label: "J", value: 4 },
  { label: "V", value: 5 },
  { label: "S", value: 6 },
];

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentName,
  currentGoal,
  currentRole,
  currentProfilePicture,
  currentMeetingDays,
  themeColor,
  performanceMode,
}) => {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("publisher");
  const [meetingDays, setMeetingDays] = useState<Set<number>>(new Set());
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = THEMES[themeColor] || THEMES.blue;

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
      setName(currentName);
      setGoal(String(currentGoal));
      setRole(currentRole);
      setProfilePic(currentProfilePicture);
      setMeetingDays(new Set(currentMeetingDays));
    }
  }, [
    isOpen,
    currentName,
    currentGoal,
    currentRole,
    currentProfilePicture,
    currentMeetingDays,
  ]);

  const handleSave = () => {
    const goalValue = parseInt(goal, 10);
    if (!isNaN(goalValue) && goalValue > 0 && name.trim()) {
      onSave(name.trim(), goalValue, profilePic, Array.from(meetingDays), role);
    }
  };

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePic(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMeetingDayToggle = (dayValue: number) => {
    setMeetingDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayValue)) {
        newSet.delete(dayValue);
      } else {
        newSet.add(dayValue);
      }
      return newSet;
    });
  };

  const roleLabels: Record<UserRole, string> = {
    publisher: "Publicador",
    aux_pioneer: "P. Auxiliar",
    reg_pioneer: "P. Regular",
    spec_pioneer: "P. Especial",
  };

  const roleDefaultGoals: Record<UserRole, number> = {
    publisher: 1, // Sensible minimum, but usually custom
    aux_pioneer: 30,
    reg_pioneer: 50,
    spec_pioneer: 100,
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (roleDefaultGoals[newRole]) {
      setGoal(String(roleDefaultGoals[newRole]));
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${hasBeenOpened ? "transition-colors duration-300" : ""
        } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div
        className={`fixed bottom-0 left-0 right-0 flex flex-col max-h-[90vh] bg-gray-100 dark:bg-slate-900 rounded-t-2xl shadow-2xl ${hasBeenOpened
            ? `transition-transform ${performanceMode ? "duration-0" : "duration-300"
            } ease-in-out`
            : ""
          } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3" />

        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2
            id="profile-title"
            className="text-xl font-bold text-slate-900 dark:text-slate-100 mx-auto"
          >
            Editar Perfil
          </h2>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-6 bg-white dark:bg-slate-800 p-4 rounded-xl">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <button
                onClick={handlePictureClick}
                className="relative w-24 h-24 rounded-full group"
              >
                <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PencilIcon className="w-6 h-6 text-white" />
                </div>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name-input"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Tu Nombre
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </span>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Precursor"
                  className={`w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${
                    themeColor === "custom" ? "ring-custom" : theme.ring
                  } outline-none`}
                />
              </div>
            </div>

            {/* Goal */}
            <div>
              <label
                htmlFor="goal-input"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Meta Mensual (hrs)
              </label>
              <input
                id="goal-input"
                type="number"
                min="1"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Ej: 50"
                className={`w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${
                  themeColor === "custom" ? "ring-custom" : theme.ring
                } outline-none`}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Rol en el servicio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(roleLabels) as UserRole[]).map((roleKey) => (
                  <button
                    key={roleKey}
                    onClick={() => handleRoleChange(roleKey)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                      role === roleKey
                        ? `${themeColor === "custom" ? "bg-custom" : theme.bg} text-white border-transparent shadow-sm`
                        : `bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400`
                    }`}
                  >
                    {roleLabels[roleKey]}
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting Days */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Días de reunión
              </label>
              <div className="flex justify-center gap-1.5">
                {weekDays.map((day) => (
                  <button
                    key={`meeting-${day.value}`}
                    onClick={() => handleMeetingDayToggle(day.value)}
                    className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center border-2 transition-all ${
                      meetingDays.has(day.value)
                        ? `${themeColor === "custom" ? "bg-custom" : theme.bg} text-white border-transparent shadow-sm`
                        : `bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400`
                      }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="flex-shrink-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
          <button
            onClick={handleSave}
            className={`w-full px-6 py-3 rounded-lg ${
              themeColor === "custom" ? "bg-custom" : theme.bg
              } text-white font-bold text-lg shadow-md ${!performanceMode &&
              "transition-transform transform hover:scale-105"
              }`}
          >
            Guardar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProfileModal;
