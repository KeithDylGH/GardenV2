import React, { useEffect } from "react";
import { ShieldCheckIcon } from "./icons/ShieldCheckIcon";

interface StreakRestoreToastProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const StreakRestoreToast: React.FC<StreakRestoreToastProps> = ({
  isVisible,
  onDismiss,
}) => {
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
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      role="status"
      aria-live="polite"
    >
      {isVisible && (
        <div className="flex items-center space-x-3 bg-slate-800 text-white py-3 px-5 rounded-full shadow-lg">
          <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
          <p className="text-sm font-medium">
            ¡Racha salvada con un restaurador!
          </p>
        </div>
      )}
    </div>
  );
};

export default StreakRestoreToast;
