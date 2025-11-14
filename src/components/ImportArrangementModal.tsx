import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { ThemeColor, GroupArrangement } from "../types";
import { THEMES } from "../constants";
import { SparklesIcon } from "./icons/SparklesIcon";
import GroupArrangementCard from "./GroupArrangementCard";
import { RefreshIcon } from "./icons/RefreshIcon";

interface ImportArrangementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessComplete: (arrangements: GroupArrangement[]) => void;
  themeColor: ThemeColor;
  isOnline: boolean;
  performanceMode: boolean;
}

const ImportArrangementModal: React.FC<ImportArrangementModalProps> = ({
  isOpen,
  onClose,
  onProcessComplete,
  themeColor,
  isOnline,
  performanceMode,
}) => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [processedArrangements, setProcessedArrangements] = useState<
    GroupArrangement[] | null
  >(null);
  const theme = THEMES[themeColor] || THEMES.blue;
  const processingCancelledRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    } else {
      if (isLoading) {
        processingCancelledRef.current = true;
      }
      setTimeout(() => {
        setText("");
        setProcessedArrangements(null);
        setError(null);
        setIsLoading(false);
      }, 300);
    }
  }, [isOpen, isLoading]);

  const handleProcess = async () => {
    if (!isOnline) {
      setError("Se requiere conexión a internet para usar esta función.");
      return;
    }
    if (!text.trim()) {
      setError("Por favor, pega el texto de los grupos.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setProcessedArrangements(null);
    processingCancelledRef.current = false;

    while (!processingCancelledRef.current) {
      try {
        const ai = new GoogleGenAI({
          apiKey: import.meta.env.VITE_GEMINI_API_KEY as string,
        });

        const responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              groupNumber: {
                type: Type.STRING,
                description:
                  'El número o nombre del grupo. Ej: "Grupo 1", "Grupo del Martes".',
              },
              conductor: {
                type: Type.STRING,
                description:
                  'El nombre del conductor del grupo. Ej: "Hno. Pérez".',
              },
              time: {
                type: Type.STRING,
                description: 'La hora de la reunión. Ej: "9:00 AM".',
              },
              location: {
                type: Type.STRING,
                description:
                  'El lugar de encuentro. Ej: "Salón del Reino", "Casa de la Familia Smith".',
              },
              territory: {
                type: Type.STRING,
                description:
                  'El territorio o área asignada para predicar. Ej: "Centro", "Calles 5 y 6".',
              },
            },
          },
        };

        const prompt = `
          Eres un asistente experto en organizar información para Testigos de Jehová.
          Analiza el siguiente texto que contiene los arreglos de predicación de una congregación.
          Extrae la información para cada grupo y devuélvela estrictamente en el formato JSON solicitado.
          Si alguna información (conductor, hora, lugar, territorio) no está presente para un grupo, simplemente omite esa clave en el JSON.
          El texto a analizar es:
          ---
          ${text}
          ---
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        if (processingCancelledRef.current) {
          break;
        }

        let jsonString = response.text.trim();

        if (jsonString.startsWith("```json") && jsonString.endsWith("```")) {
          jsonString = jsonString.slice(7, -3).trim();
        } else if (jsonString.startsWith("```") && jsonString.endsWith("```")) {
          jsonString = jsonString.slice(3, -3).trim();
        }

        const parsedData = JSON.parse(jsonString);

        if (Array.isArray(parsedData)) {
          setProcessedArrangements(parsedData);
          setIsLoading(false);
          return; // Success
        } else {
          throw new Error("La respuesta de la IA no fue un arreglo de grupos.");
        }
      } catch (e) {
        console.error(`Processing attempt failed:`, e);
        if (processingCancelledRef.current) {
          break;
        }
        // Wait 1 second before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Reached only on cancellation
    setIsLoading(false);
  };

  const handleConfirmAndClose = () => {
    if (processedArrangements) {
      onProcessComplete(processedArrangements);
    }
  };

  const handleRetry = () => {
    setProcessedArrangements(null);
    setText("");
    setError(null);
  };

  const handleCancelProcessing = () => {
    processingCancelledRef.current = true;
    setIsLoading(false);
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        hasBeenOpened ? "transition-colors duration-300" : ""
      } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-title"
    >
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-slate-900 rounded-t-2xl shadow-2xl ${
          hasBeenOpened
            ? `transition-transform ${
                performanceMode ? "duration-0" : "duration-300"
              } ease-in-out`
            : ""
        } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-4" />
        <div className="p-6 pt-0 max-h-[85vh] overflow-y-auto">
          {processedArrangements ? (
            <div className="animate-fadeIn">
              <h2
                id="import-title-result"
                className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-center"
              >
                Resultados de la Importación
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                Revisa los grupos que se encontraron. Si todo está bien,
                acéptalos.
              </p>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-6 bg-slate-200/50 dark:bg-slate-800/50 p-3 rounded-lg">
                {processedArrangements.length > 0 ? (
                  processedArrangements.map((arrangement, index) => (
                    <GroupArrangementCard
                      key={index}
                      arrangement={arrangement}
                      themeColor={themeColor}
                    />
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                    No se encontraron grupos en el texto.
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleConfirmAndClose}
                  className={`w-full px-6 py-3 rounded-lg ${theme.bg} text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform flex items-center justify-center gap-2`}
                >
                  Aceptar y Guardar
                </button>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshIcon className="w-5 h-5" />
                  Importar de Nuevo
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2
                id="import-title"
                className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-center"
              >
                Importar Grupos
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                Pega aquí el texto con los arreglos de la semana.
              </p>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ej: Grupo 1 - Conductor: Hno. Ejemplo, Hora: 9:00, Lugar: Salón del Reino..."
                rows={8}
                className={`w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${theme.ring} outline-none transition resize-none dark:text-white`}
                disabled={isLoading}
              />

              {!isOnline && (
                <div className="text-center bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 p-3 rounded-lg text-sm my-4">
                  Se requiere conexión a internet para usar esta función.
                </div>
              )}

              {error && (
                <p className="text-red-600 text-sm text-center mt-2">{error}</p>
              )}

              <div className="flex flex-col space-y-3 mt-6">
                <button
                  onClick={handleProcess}
                  className={`w-full px-6 py-3 rounded-lg ${theme.bg} text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isLoading || !isOnline}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-6 h-6" />
                      Procesar con IA
                    </>
                  )}
                </button>
                {isLoading ? (
                  <button
                    type="button"
                    onClick={handleCancelProcessing}
                    className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors animate-fadeIn"
                  >
                    Cancelar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full px-6 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportArrangementModal;
