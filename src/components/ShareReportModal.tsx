import React, { useState, useEffect, useMemo, useRef } from "react";
import { ThemeColor, ActivityItem, UserRole, HistoryLog } from "../types";
import { THEMES } from "../constants";
import { hoursToHHMM, getServiceYear } from "../utils";
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
  userRole: UserRole;
  archives: Record<string, HistoryLog>;
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
  userRole,
  archives,
  onCopy,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [optionalComment, setOptionalComment] = useState("");
  const reportTextAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    } else {
      // Reset comment after modal closes (with delay for animation)
      const timer = setTimeout(() => {
        setOptionalComment("");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Check if user was sick during the month
  const wasSickThisMonth = useMemo(() => {
    const serviceYear = getServiceYear(currentDate);
    const yearHistory = archives[serviceYear] || {};
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for (const dateKey in yearHistory) {
      if (!dateKey.includes("SUMMARY") && !dateKey.includes("CARRYOVER")) {
        const entry = yearHistory[dateKey];
        const entryDate = new Date(dateKey);

        if (
          entryDate.getFullYear() === currentYear &&
          entryDate.getMonth() === currentMonth &&
          (entry.event === "sick" || entry.status === "sick")
        ) {
          return true;
        }
      }
    }
    return false;
  }, [archives, currentDate]);

  const reportText = useMemo(() => {
    const monthActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return (
        activityDate.getFullYear() === currentDate.getFullYear() &&
        activityDate.getMonth() === currentDate.getMonth()
      );
    });
    const studies = monthActivities.filter((a) => a.type === "study").length;

    const monthName = currentDate.toLocaleDateString("es-ES", {
      month: "long",
    });

    const lines: string[] = [];

    // Header
    lines.push(`Informe de ${userName} - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`);
    lines.push(""); // Empty line

    if (userRole === "publisher") {
      if (currentHours > 0) {
        lines.push("Sí prediqué");
      } else {
        lines.push("No prediqué este mes");
      }
    }
    // Pioneers: report hours and studies (if any)
    else {
      lines.push(`Horas: ${hoursToHHMM(currentHours)}`);
      if (currentLdcHours > 0) {
        lines.push(`Horas Acreditadas: ${hoursToHHMM(currentLdcHours)}`);
      }
      // Only include studies if there are any
      if (studies > 0) {
        lines.push(`Estudios: ${studies}`);
      }
      // Add sick note if applicable
      if (wasSickThisMonth) {
        lines.push("Me enfermé");
      }
    }

    // Add optional comment if provided
    if (optionalComment.trim()) {
      lines.push(""); // Empty line before comment
      lines.push(`Comentario: ${optionalComment.trim()}`);
    }

    return lines.join("\n");
  }, [userName, currentDate, currentHours, currentLdcHours, activities, userRole, wasSickThisMonth, optionalComment]);

  const handleCopyToClipboard = () => {
    // Check if Clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Modern Clipboard API
      navigator.clipboard
        .writeText(reportText)
        .then(() => {
          onCopy();
        })
        .catch((err) => {
          console.error("Clipboard API failed:", err);
          // Fallback to execCommand
          fallbackCopy();
        });
    } else {
      // Use fallback directly if Clipboard API not available
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    if (reportTextAreaRef.current) {
      try {
        reportTextAreaRef.current.select();
        reportTextAreaRef.current.setSelectionRange(0, 99999); // For mobile devices
        const success = document.execCommand("copy");

        if (success) {
          onCopy();
        } else {
          console.error("execCommand copy failed");
        }
      } catch (err) {
        console.error("Fallback copy error:", err);
      }
    }
  };

  if (!hasBeenOpened) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"
        }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
    >
      <div
        className={`fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
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

          <div className="mt-4">
            <label className="block text-left text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Comentario opcional
            </label>
            <textarea
              value={optionalComment}
              onChange={(e) => setOptionalComment(e.target.value)}
              placeholder="Agrega un comentario si lo deseas..."
              rows={2}
              className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-left resize-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>

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
