import React, { useState, useEffect } from "react";
import { ThemeColor, Shape, ThemeMode } from "../types";
import { THEME_LIST, THEMES } from "../constants";
import { FlowerIcon } from "./icons/FlowerIcon";
import { CircleIcon } from "./icons/CircleIcon";
import { HeartIcon } from "./icons/HeartIcon";
import { CheckIcon } from "./icons/CheckIcon";
import { SunIcon } from "./icons/SunIcon";
import { MoonIcon } from "./icons/MoonIcon";
import { SolidCircleIcon } from "./icons/SolidCircleIcon";
import { DiamondIcon } from "./icons/DiamondIcon";
import { TriangleIcon } from "./icons/TriangleIcon";
import { HexagonIcon } from "./icons/HexagonIcon";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shape: Shape, color: ThemeColor, mode: ThemeMode, customColor?: string, customGradientTo?: string) => void;
  onModeChange: (mode: ThemeMode) => void;
  currentShape: Shape;
  currentColor: ThemeColor;
  currentThemeMode: ThemeMode;
  performanceMode: boolean;
  customColor: string;
  customGradientTo: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onModeChange,
  currentShape,
  currentColor,
  currentThemeMode,
  performanceMode,
  customColor: initialCustomColor,
  customGradientTo: initialCustomGradientTo,
}) => {
  const [shape, setShape] = useState<Shape>("flower");
  const [color, setColor] = useState<ThemeColor>("blue");
  const [mode, setMode] = useState<ThemeMode>("light");
  const [localCustomColor, setLocalCustomColor] = useState("#3b82f6");
  const [localCustomGradientTo, setLocalCustomGradientTo] = useState("#8b5cf6");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const theme = THEMES[color] || THEMES.blue;

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShape(currentShape);
      setColor(currentColor);
      setMode(currentThemeMode);
      setLocalCustomColor(initialCustomColor || "#3b82f6");
      setLocalCustomGradientTo(initialCustomGradientTo || "#8b5cf6");
      setShowCustomPicker(currentColor === "custom");
    }
  }, [isOpen, currentShape, currentColor, currentThemeMode, initialCustomColor, initialCustomGradientTo]);

  const handleSave = () => {
    onSave(shape, color, mode, localCustomColor, localCustomGradientTo);
  };

  const handleColorSelect = (selectedColor: ThemeColor) => {
    setColor(selectedColor);
    if (selectedColor === "bw") {
      const newMode = "black" as ThemeMode;
      setMode(newMode);
      onModeChange(newMode);
    }
    if (selectedColor !== "custom") {
      setShowCustomPicker(false);
    }
  };

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    onModeChange(newMode);
  };

  const shapeOptions: {
    name: Shape;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }[] = [
      { name: "flower", Icon: FlowerIcon },
      { name: "circle", Icon: CircleIcon },
      { name: "heart", Icon: HeartIcon },
      { name: "diamond", Icon: DiamondIcon },
      { name: "triangle", Icon: TriangleIcon },
      { name: "hexagon", Icon: HexagonIcon },
    ];

  const isBwTheme = color === "bw";

  return (
    <div
      className={`fixed inset-0 z-50 ${hasBeenOpened ? "transition-colors duration-300" : ""
        } ${isOpen ? "bg-black/40" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className={`fixed bottom-0 left-0 right-0 flex flex-col max-h-[90vh] bg-gray-100 dark:bg-slate-900 rounded-t-2xl shadow-2xl ${hasBeenOpened
          ? `transition-transform ${performanceMode ? "duration-0" : "duration-300"
          } ease-in-out`
          : ""
          } ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3" />

        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2
            id="settings-title"
            className="text-xl font-bold text-slate-900 dark:text-slate-100 mx-auto"
          >
            Configuración de Apariencia
          </h2>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-6 bg-white dark:bg-slate-800 p-4 rounded-xl">
            {/* Theme Mode */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tema
              </label>
              <div
                className={`flex gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg ${isBwTheme ? "opacity-50" : ""
                  }`}
              >
                <button
                  onClick={() => handleModeChange("light")}
                  disabled={isBwTheme}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-semibold ${mode === "light"
                    ? `${theme.bg} text-white shadow`
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50"
                    } ${isBwTheme ? "cursor-not-allowed" : ""}`}
                >
                  <SunIcon className="w-5 h-5" />
                  <span>Claro</span>
                </button>
                <button
                  onClick={() => handleModeChange("dark")}
                  disabled={isBwTheme}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-semibold ${mode === "dark"
                    ? `${theme.bg} text-white shadow`
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50"
                    } ${isBwTheme ? "cursor-not-allowed" : ""}`}
                >
                  <MoonIcon className="w-5 h-5" />
                  <span>Oscuro</span>
                </button>
                <button
                  onClick={() => handleModeChange("black")}
                  disabled={isBwTheme}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-semibold ${mode === "black"
                    ? `${theme.bg} text-white shadow`
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50"
                    } ${isBwTheme ? "cursor-not-allowed" : ""}`}
                >
                  <SolidCircleIcon className="w-5 h-5" />
                  <span>Negro</span>
                </button>
              </div>
            </div>

            {/* Shape */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Forma
              </label>
              <div className="grid grid-cols-3 gap-3">
                {shapeOptions.map(({ name: shapeName, Icon }) => (
                  <button
                    key={shapeName}
                    onClick={() => setShape(shapeName)}
                    className={`flex-1 p-3 border-2 rounded-lg flex items-center justify-center ${shape === shapeName
                      ? `${THEMES[color].text} border-current bg-blue-50/50 dark:bg-slate-700/50`
                      : "border-slate-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                  >
                    <Icon
                      className={`w-8 h-8 ${shape === shapeName
                        ? "text-current"
                        : "text-slate-500 dark:text-slate-400"
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Color
              </label>
              <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
                {THEME_LIST.map((themeOption) => (
                  <button
                    key={themeOption.name}
                    onClick={() => handleColorSelect(themeOption.name)}
                    className={`w-full h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${themeOption.gradientFrom
                      } ${themeOption.gradientTo} ${!performanceMode &&
                      "transition-transform transform hover:scale-110"
                      }`}
                  >
                    {color === themeOption.name && (
                      <CheckIcon
                        className={`w-6 h-6 ${themeOption.name === "bw"
                          ? "text-slate-900"
                          : "text-white"
                          }`}
                      />
                    )}
                  </button>
                ))}
                
                {/* Custom Color Button */}
                <button
                  onClick={() => {
                    setColor("custom");
                    setShowCustomPicker(!showCustomPicker);
                  }}
                  className={`w-full h-12 rounded-lg flex items-center justify-center border-2 border-dashed ${
                    color === "custom" 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-slate-300 dark:border-slate-600 hover:border-blue-400"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold leading-none dark:text-slate-300">MIX</span>
                    <div className="flex mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 -mr-0.5"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 -mr-0.5"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Mini Color Picker Interface */}
              {showCustomPicker && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-fadeIn">
                  <header className="flex justify-between items-center mb-4">
                     <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Paleta Personalizada</p>
                     <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full shadow-sm border border-white" style={{ background: `linear-gradient(to bottom right, ${localCustomColor}, ${localCustomGradientTo})` }}></div>
                     </div>
                  </header>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Color Primario</label>
                        <code className="text-[10px] font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">{localCustomColor}</code>
                      </div>
                      <div className="flex items-center space-x-3">
                         <input 
                           type="color" 
                           value={localCustomColor}
                           onChange={(e) => setLocalCustomColor(e.target.value)}
                           className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer border-none bg-transparent"
                         />
                         <div className="flex-grow h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gradiente (Final)</label>
                        <code className="text-[10px] font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">{localCustomGradientTo}</code>
                      </div>
                      <div className="flex items-center space-x-3">
                         <input 
                           type="color" 
                           value={localCustomGradientTo}
                           onChange={(e) => setLocalCustomGradientTo(e.target.value)}
                           className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer border-none bg-transparent"
                         />
                         <div className="flex-grow h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-full" style={{ background: `linear-gradient(to right, ${localCustomColor}, ${localCustomGradientTo})` }}></div>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 text-center">
                    Toca los cuadros de color para abrir el selector detallado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="flex-shrink-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
          <button
            onClick={handleSave}
            className={`w-full px-6 py-3 rounded-lg ${theme.bg} ${color === "bw" ? "text-slate-900" : "text-white"
              } font-bold text-lg shadow-md ${!performanceMode &&
              "transition-transform transform hover:scale-105"
              }`}
          >
            Guardar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
