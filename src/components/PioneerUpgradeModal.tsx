import React, { useState, useEffect } from "react";
import { ThemeColor, UserRole } from "../types";
import { THEMES } from "../constants";
import { StarIcon } from "./icons/StarIcon";

interface PioneerUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newRole: "aux_pioneer" | "reg_pioneer" | "spec_pioneer") => void;
  themeColor: ThemeColor;
}

const PioneerUpgradeModal: React.FC<PioneerUpgradeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  themeColor,
}) => {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "aux_pioneer" | "reg_pioneer" | "spec_pioneer"
  >("reg_pioneer");
  const theme = THEMES[themeColor] || THEMES.blue;

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  if (!hasBeenOpened) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pioneer-upgrade-title"
    >
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center transform transition-all duration-300"
          style={{ transform: isOpen ? "scale(1)" : "scale(0.95)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500 mb-4`}
          >
            <StarIcon className="w-9 h-9 text-white" />
          </div>
          <h2
            id="pioneer-upgrade-title"
            className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          >
            ¡Felicidades por tu decisión!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Al iniciar tu precursorado, desbloquearás nuevas funciones como el
            registro de horas LDC y el 'Modo Fantasma'.
          </p>
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setSelectedRole("aux_pioneer")}
              className={`w-full p-3 rounded-lg text-sm font-semibold transition-colors border-2 ${
                selectedRole === "aux_pioneer"
                  ? `${theme.bg} text-white border-transparent`
                  : "bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600"
              }`}
            >
              Precursor Auxiliar
            </button>
            <button
              onClick={() => setSelectedRole("reg_pioneer")}
              className={`w-full p-3 rounded-lg text-sm font-semibold transition-colors border-2 ${
                selectedRole === "reg_pioneer"
                  ? `${theme.bg} text-white border-transparent`
                  : "bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600"
              }`}
            >
              Precursor Regular
            </button>
            <button
              onClick={() => setSelectedRole("spec_pioneer")}
              className={`w-full p-3 rounded-lg text-sm font-semibold transition-colors border-2 ${
                selectedRole === "spec_pioneer"
                  ? `${theme.bg} text-white border-transparent`
                  : "bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600"
              }`}
            >
              Precursor Especial
            </button>
          </div>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleConfirm}
              className={`w-full px-6 py-3 rounded-lg ${theme.bg} text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform`}
            >
              Confirmar
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PioneerUpgradeModal;
