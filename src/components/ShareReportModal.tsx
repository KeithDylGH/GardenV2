import React, { useState, useEffect, useMemo, useRef } from "react";
import { ThemeColor, ActivityItem } from "../types";
import { THEMES } from "../constants";
import { hoursToHHMM } from "../utils";
import { ClipboardDocumentCheckIcon } from "./icons/ClipboardDocumentCheckIcon";
import { ChatBubbleBottomCenterTextIcon } from "./icons/ChatBubbleBottomCenterTextIcon";

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currentDate: Date;
  currentHours: number;
  currentLdcHours: number;
  activities: ActivityItem[];
  themeColor: ThemeColor;
  onCopy: () => void;
}

const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  userName,
  currentDate,
  currentHours,
  currentLdcHours,
  activities,
  themeColor,
  onCopy,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const reportTextAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  const reportText = useMemo(() => {
    const monthActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getFullYear() === currentDate.getFullYear() &&
        activityDate.getMonth() === currentDate.getMonth()
      );
    });
    const visits = monthActivities.filter((a) => a.type === "visit").length;
    const studies = monthActivities.filter((a) => a.type === "study").length;

    const monthName = currentDate.toLocaleDateString("es-ES", {
      month: "long",
    });

    let report = `Informe de ${userName} - ${
      monthName.charAt(0).toUpperCase() + monthName.slice(1)
    }\n\n`;
    report += `Horas: ${hoursToHHMM(currentHours)}\n`;
    if (currentLdcHours > 0) {
      report += `LDC: ${hoursToHHMM(currentLdcHours)}\n`;
    }
    report += `Revisitas: ${visits}\n`;
    report += `Estudios: ${studies}`;

    return report;
  }, [userName, currentDate, currentHours, currentLdcHours, activities]);

  const handleCopyToClipboard = () => {
    if (reportTextAreaRef.current) {
      navigator.clipboard
        .writeText(reportText)
        .then(() => {
          onCopy();
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          // Fallback for older browsers
          if (reportTextAreaRef.current) {
            reportTextAreaRef.current.select();
            document.execCommand("copy");
          }
          onCopy();
        });
    }
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
      aria-labelledby="share-title"
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
            className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} mb-4`}
          >
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-white" />
          </div>
          <h2
            id="share-title"
            className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2"
          >
            Compartir Informe Mensual
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
            Copia y pega este texto para enviar tu informe de servicio.
          </p>

          <textarea
            ref={reportTextAreaRef}
            readOnly
            value={reportText}
            rows={5}
            className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-left font-mono"
          />

          <div className="flex flex-col space-y-3 mt-6">
            <button
              onClick={handleCopyToClipboard}
              className={`w-full px-6 py-2.5 rounded-lg ${theme.bg} text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 transition-transform`}
            >
              <ClipboardDocumentCheckIcon className="w-5 h-5" />
              Copiar Informe
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareReportModal;
