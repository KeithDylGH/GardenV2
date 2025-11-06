import React, { useState, useEffect } from "react";
import { THEMES } from "../constants";
import { ThemeColor } from "../types";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  themeColor: ThemeColor;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  themeColor,
}) => {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  if (!hasBeenOpened) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
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
          <h2
            id="confirmation-title"
            className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          >
            {title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
            {message}
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={onConfirm}
              className="w-full px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
            >
              {confirmText}
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

export default ConfirmationModal;
