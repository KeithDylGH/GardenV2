import React, { useState, useEffect } from "react";
import { ThemeColor } from "../types";
import { THEMES } from "../constants";
import { SparklesIcon } from "./icons/SparklesIcon";
import { XCircleIcon } from "./icons/XCircleIcon";

interface NewsItem {
  id: string;
  version: string;
  date: string;
  title: string;
  description?: string;
  features?: string[];
  importance: "info" | "important" | "urgent";
}

const NEWS_DATA: NewsItem[] = [
  {
    id: "7",
    version: "2.1",
    date: "30 de diciembre, 2025",
    title: "2.1: ¡Ajustes y Visitas!",
    description: "Una actualización mayor con grandes mejoras en funcionalidad e interfaz.",
    features: [
      "Comparte tus cursos y revisiones en la sección de “Actividad”.",
      "Ajusta los mensajes de nuestra I.A. en los grupos. ¡Siéntete libre de editar lo que necesites!.",
      "Planificación mejorada (rango de días).",
      "Disfruta de una interfaz más fluida. ¡Desliza para cambiar de sección!.",
      "Nuevos accesos rápidos para “Añadir horas”.",
      "Dos nuevos eventos especiales en “Historial” (Campaña e Instalación)."
    ],
    importance: "important",
  },
  {
    id: "6",
    version: "2.0.3",
    date: "21 de diciembre, 2025",
    title: "Mejoras menores y correciones gramáticas",
    importance: "info",
  },
  {
    id: "5",
    version: "2.0.2",
    date: "20 de diciembre, 2025",
    title: "Arreglo de bug al exportar datos",
    importance: "urgent",
  },
  {
    id: "4",
    version: "2.0.2",
    date: "20 de diciembre, 2025",
    title: "Cambios mínimos",
    description: "Mejoras menores y correcciones de estabilidad.",
    importance: "info",
  },
  {
    id: "2",
    version: "2.0.1",
    date: "20 de diciembre, 2025",
    title: "Corrección del temporizador de horas acreditadas",
    description:
      "Se arregló un error en que el temporizador de las horas acreditadas reemplazaba las horas en vez de añadirlas correctamente.",
    importance: "urgent",
  },
  {
    id: "3",
    version: "2.0.1",
    date: "20 de diciembre, 2025",
    title: "Días de reunión protegen la racha",
    description:
      "Los días de reunión ahora protegen tu racha, al igual que los fines de semana y tu día de descanso.",
    importance: "important",
  },
  {
    id: "1",
    version: "2.0",
    date: "19 de diciembre, 2025",
    title: "¡Garden salió oficialmente!",
    description: "Bienvenido a la nueva versión de Garden.",
    importance: "info",
  },
];

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: ThemeColor;
  performanceMode: boolean;
}

const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  onClose,
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

  const getImportanceColor = (importance: NewsItem["importance"]) => {
    switch (importance) {
      case "urgent":
        return "bg-red-500";
      case "important":
        return "bg-amber-500";
      case "info":
      default:
        return "bg-emerald-500";
    }
  };

  const getImportanceBgColor = (importance: NewsItem["importance"]) => {
    switch (importance) {
      case "urgent":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "important":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
      case "info":
      default:
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        hasBeenOpened ? "transition-colors duration-300" : ""
      } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-title"
    >
      <div
        className={`fixed bottom-0 left-0 right-0 flex flex-col max-h-[85vh] bg-gray-100 dark:bg-slate-900 rounded-t-2xl shadow-2xl pb-[env(safe-area-inset-bottom)] ${
          hasBeenOpened
            ? `transition-transform ${
                performanceMode ? "duration-0" : "duration-300"
              } ease-in-out`
            : ""
        } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3" />

        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <SparklesIcon className={`w-6 h-6 ${theme.text}`} />
            <h2
              id="news-title"
              className="text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              Novedades
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <XCircleIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto max-h-[80vh]">
          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-300 dark:bg-slate-700" />

            {NEWS_DATA.map((item, index) => (
              <div key={item.id} className={`relative pb-6 ${index === NEWS_DATA.length - 1 ? "pb-0" : ""}`}>
                {/* Timeline dot */}
                <div
                  className={`absolute left-[-14px] top-1.5 w-3 h-3 rounded-full ring-4 ring-gray-100 dark:ring-slate-900 ${getImportanceColor(
                    item.importance
                  )}`}
                />

                <div
                  className={`ml-4 p-3 rounded-lg border ${getImportanceBgColor(
                    item.importance
                  )}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {item.date}
                    </span>
                    <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                      v{item.version}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-2">
                      {item.description}
                    </p>
                  )}
                  {item.features && (
                    <ul className="space-y-1.5 mt-2">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className={`flex-shrink-0 w-1 h-1 rounded-full mt-1.5 ${getImportanceColor(item.importance)}`} />
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                            {feature}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="flex-shrink-0 p-4 pt-2 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 rounded-lg ${
              themeColor === "custom" ? "bg-custom" : theme.bg
            } text-white font-bold text-lg shadow-md ${
              !performanceMode && "transition-transform transform hover:scale-105"
            }`}
          >
            Entendido
          </button>
        </footer>
      </div>
    </div>
  );
};

export default NewsModal;
