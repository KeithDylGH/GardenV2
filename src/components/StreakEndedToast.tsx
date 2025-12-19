import React, { useEffect } from "react";
import { FlameIcon } from "./icons/FlameIcon";

interface StreakEndedToastProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const StreakEndedToast: React.FC<StreakEndedToastProps> = ({ isVisible, onDismiss }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-in-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      role="status"
      aria-live="polite"
    >
      {isVisible && (
        <div className="flex items-center space-x-3 bg-slate-800 dark:bg-slate-700 text-white py-3 px-5 rounded-full shadow-2xl border border-slate-600 animate-boingIn">
          <div className="bg-red-500 rounded-full p-1">
            <FlameIcon className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-bold">¡Se terminó tu racha!</p>
        </div>
      )}
    </div>
  );
};

export default StreakEndedToast;
