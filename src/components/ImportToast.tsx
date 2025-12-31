import React, { useEffect } from "react";
import { CheckIcon } from "./icons/CheckIcon";
import { BookOpenIcon } from "./icons/BookOpenIcon";
import { ArrowUturnLeftIcon } from "./icons/ArrowUturnLeftIcon";
import { ActivityType } from "../types";

interface ImportToastProps {
  isVisible: boolean;
  onDismiss: () => void;
  type: ActivityType | null;
}

const ImportToast: React.FC<ImportToastProps> = ({ isVisible, onDismiss, type }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible || !type) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-in-out opacity-100 translate-y-0"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3 bg-slate-800 dark:bg-slate-700 text-white py-3 px-5 rounded-full shadow-2xl border border-slate-600">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400">
          <CheckIcon className="w-4 h-4" />
        </div>
        <p className="text-sm font-medium">
            ¡{type === 'study' ? 'Curso' : 'Revisita'} importado con éxito!
        </p>
      </div>
    </div>
  );
};

export default ImportToast;
