import React, { useState, useEffect } from "react";
import { THEMES } from "../constants";
import { ThemeColor } from "../types";
import { SparklesIcon } from "./icons/SparklesIcon";

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  features?: string[];
  themeColor: ThemeColor;
  performanceMode: boolean;
}

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  features,
  themeColor,
  performanceMode,
}) => {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const theme = THEMES[themeColor] || THEMES.blue;

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
      aria-labelledby="whats-new-title"
    >
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all relative flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Sparkles */}
          <div className={`p-6 pb-2 flex flex-col items-center text-center`}>
            <div className={`w-14 h-14 rounded-full ${themeColor === 'custom' ? 'bg-custom/20' : theme.bg + '/20'} flex items-center justify-center mb-3 transition-transform hover:rotate-12`}>
              <SparklesIcon className={`w-8 h-8 ${themeColor === 'custom' ? 'text-custom' : theme.text}`} />
            </div>
            <h2
              id="whats-new-title"
              className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1"
            >
              {title}
            </h2>
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>

          <div className="px-6 pb-4 overflow-y-auto max-h-[50vh]">
            {description && (
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-center mb-4">
                    {description}
                </p>
            )}
            
            {features && features.length > 0 && (
                <ul className="space-y-3">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${themeColor === 'custom' ? 'bg-custom' : theme.bg}`} />
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                                {feature}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className={`w-full py-4 rounded-2xl ${
                themeColor === "custom" ? "bg-custom" : theme.bg
              } text-white font-bold text-lg shadow-xl active:scale-95 transition-all`}
            >
              De acuerdo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsNewModal;
