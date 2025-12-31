import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { ThemeColor, GroupArrangement } from "../types";
import { THEMES } from "../constants";
import { SparklesIcon } from "./icons/SparklesIcon";
import GroupArrangementCard from "./GroupArrangementCard";
import { RefreshIcon } from "./icons/RefreshIcon";
import EditGroupModal from "./EditGroupModal";
import { PencilIcon } from "./icons/PencilIcon";

const AI_COOLDOWN_KEY = "ai_import_cooldown_timestamp";
const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes in ms

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [processedArrangements, setProcessedArrangements] = useState<
    GroupArrangement[] | null
  >(null);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const theme = THEMES[themeColor] || THEMES.blue;
  const processingCancelledRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
      
      // Check for existing cooldown
      const lastImport = localStorage.getItem(AI_COOLDOWN_KEY);
      if (lastImport) {
        const elapsed = Date.now() - parseInt(lastImport, 10);
        if (elapsed < COOLDOWN_DURATION) {
            setCooldownTimeLeft(Math.ceil((COOLDOWN_DURATION - elapsed) / 1000));
        }
      }
    } else {
      if (isLoading) {
        processingCancelledRef.current = true;
      }
      setTimeout(() => {
        setText("");
        setSelectedImage(null);
        setProcessedArrangements(null);
        setError(null);
        setIsLoading(false);
      }, 300);
    }
  }, [isOpen, isLoading]);

  useEffect(() => {
    if (cooldownTimeLeft > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldownTimeLeft((prev) => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    }

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [cooldownTimeLeft]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen es demasiado grande. Máximo 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProcess = async () => {
    if (!isOnline) {
      setError("Se requiere conexión a internet para usar esta función.");
      return;
    }
    if (!text.trim() && !selectedImage) {
      setError("Por favor, ingresa texto o sube una imagen.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setProcessedArrangements(null);
    processingCancelledRef.current = false;

    while (!processingCancelledRef.current) {
      try {
        const ai = new GoogleGenAI({
          apiKey: import.meta.env.VITE_GEMINI_API_KEYS as string,
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

        const promptText = `
          Actúa como un asistente inteligente para organizar arreglos de predicación.
          Tu tarea es extraer información de grupos de predicación del texto o imagen proporcionada.
          
          Puede ser una foto de un Excel, una lista en WhatsApp o texto informal.
          Si falta información explícita (como el número de grupo), infiérelo del contexto o usa un nombre genérico (ej: "Grupo Mañana").
          
          Extrae la información e devuélvela estrictamente como un ARRAY de objetos JSON.
          No incluyas texto adicional, ni markdown, solo el JSON puro o dentro de un bloque de código json.

          Texto adicional (si hay):
          """
          ${text}
          """
        `;

        const contentParts: any[] = [{ text: promptText }];

        if (selectedImage) {
          // Remove the Data URL prefix to get just the base64 string
          const base64Data = selectedImage.split(',')[1];
          contentParts.push({
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            }
          });
        }

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: contentParts
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        if (processingCancelledRef.current) {
          break;
        }

        let jsonString = response.text.trim();

        // Robust JSON extraction: Find the first '[' and last ']'
        const firstBracket = jsonString.indexOf("[");
        const lastBracket = jsonString.lastIndexOf("]");

        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          jsonString = jsonString.substring(firstBracket, lastBracket + 1);
        }

        const parsedData = JSON.parse(jsonString);

        if (Array.isArray(parsedData)) {
          setProcessedArrangements(parsedData);
          setIsLoading(false);
          
          // Set cooldown
          const now = Date.now();
          localStorage.setItem(AI_COOLDOWN_KEY, now.toString());
          setCooldownTimeLeft(Math.ceil(COOLDOWN_DURATION / 1000));
          
          return; // Success
        } else {
          throw new Error("La respuesta no contiene una lista de grupos válida.");
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
    setSelectedImage(null);
    setError(null);
  };

  const handleCancelProcessing = () => {
    processingCancelledRef.current = true;
    setIsLoading(false);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updated: GroupArrangement) => {
    if (processedArrangements && editingIndex !== null) {
      const newArrangements = [...processedArrangements];
      newArrangements[editingIndex] = updated;
      setProcessedArrangements(newArrangements);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${hasBeenOpened ? "transition-colors duration-300" : ""
        } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-title"
    >
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-slate-900 rounded-t-2xl shadow-2xl pb-[env(safe-area-inset-bottom)] ${hasBeenOpened
          ? `transition-transform ${performanceMode ? "duration-0" : "duration-300"
          } ease-in-out`
          : ""
          } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-4" />
        <div className="p-6 pt-0 max-h-[80vh] overflow-y-auto">
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
                    <div key={index} className="relative group">
                      <GroupArrangementCard
                        arrangement={arrangement}
                        themeColor={themeColor}
                      />
                      <button
                        onClick={() => handleStartEdit(index)}
                        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-700/80 rounded-full shadow-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar grupo"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
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
                  className={`w-full px-6 py-3 rounded-lg ${
                    themeColor === "custom" ? "bg-custom" : theme.bg
                  } text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform flex items-center justify-center gap-2`}
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
                Sube una imagen o pega el texto con los arreglos.
              </p>

              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${selectedImage ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : `border-slate-300 dark:border-slate-600 ${themeColor === 'custom' ? 'hover:border-custom' : 'hover:border-blue-500'}`
                    }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {selectedImage ? (
                    <div className="relative">
                      <img src={selectedImage} alt="Preview" className="mx-auto max-h-40 rounded-lg shadow-sm" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Toca para subir una foto
                      </p>
                      <p className="text-xs text-slate-500">
                        (Ej: Captura del Excel)
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold">O también</span>
                  <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe o pega el texto aquí..."
                  rows={4}
                  className={`w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 ${
                    themeColor === "custom" ? "ring-custom" : theme.ring
                  } outline-none transition resize-none dark:text-white`}
                  disabled={isLoading}
                />
              </div>

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
                  className={`w-full px-6 py-3 rounded-lg ${
                    themeColor === "custom" ? "bg-custom" : theme.bg
                  } text-white font-bold text-lg shadow-lg transform ${cooldownTimeLeft > 0 || isLoading || !isOnline ? "" : "hover:scale-105"} transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isLoading || !isOnline || cooldownTimeLeft > 0}
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
                  ) : cooldownTimeLeft > 0 ? (
                    <>
                       Espera {Math.floor(cooldownTimeLeft / 60)}:{(cooldownTimeLeft % 60).toString().padStart(2, '0')}...
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

      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        arrangement={editingIndex !== null && processedArrangements ? processedArrangements[editingIndex] : null}
        onSave={handleSaveEdit}
        themeColor={themeColor}
        performanceMode={performanceMode}
      />
    </div>
  );
};

export default ImportArrangementModal;
