import React, { useEffect } from "react";
import { SparklesIcon } from "./icons/SparklesIcon";

interface UpdateToastProps {
  isVisible: boolean;
  onDismiss: () => void;
  onTap?: () => void;
}

const UpdateToast: React.FC<UpdateToastProps> = ({ isVisible, onDismiss, onTap }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  const handleClick = () => {
    if (onTap) {
      onTap();
    }
    onDismiss();
  };

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-in-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      role="status"
      aria-live="polite"
    >
      {isVisible && (
        <button 
          onClick={handleClick}
          className="flex items-center space-x-3 bg-emerald-600 dark:bg-emerald-700 text-white py-3 px-5 rounded-full shadow-2xl border border-emerald-500 animate-boingIn cursor-pointer hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
        >
          <div className="bg-white/20 rounded-full p-1">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-bold">¡Garden ha sido actualizada!</p>
        </button>
      )}
    </div>
  );
};

export default UpdateToast;
