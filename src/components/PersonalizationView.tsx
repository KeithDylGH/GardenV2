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

// Helper functions for color conversion
const hexToHsl = (hex: string) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const hex = Math.round(255 * color).toString(16).padStart(2, '0');
    return hex;
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const isValidHex = (hex: string) => /^#[0-9A-F]{6}$/i.test(hex);

interface PersonalizationViewProps {
  currentShape: Shape;
  currentColor: ThemeColor;
  currentThemeMode: ThemeMode;
  customColor: string;
  customGradientTo: string;
  onSave: (
    shape: Shape,
    color: ThemeColor,
    mode: ThemeMode,
    customColor?: string,
    customGradientTo?: string
  ) => void;
  onModeChange: (mode: ThemeMode) => void;
  performanceMode: boolean;
}

const PersonalizationView: React.FC<PersonalizationViewProps> = ({
  currentShape,
  currentColor,
  currentThemeMode,
  customColor: initialCustomColor,
  customGradientTo: initialCustomGradientTo,
  onSave,
  onModeChange,
  performanceMode,
}) => {
  const [shape, setShape] = useState<Shape>(currentShape);
  const [color, setColor] = useState<ThemeColor>(currentColor);
  const [mode, setMode] = useState<ThemeMode>(currentThemeMode);
  const [localCustomColor, setLocalCustomColor] = useState(
    initialCustomColor || "#3b82f6"
  );
  const [localCustomGradientTo, setLocalCustomGradientTo] = useState(
    initialCustomGradientTo || "#8b5cf6"
  );
  const [showCustomPicker, setShowCustomPicker] = useState(
    currentColor === "custom"
  );

  const theme = THEMES[color] || THEMES.blue;

  // Sync with props when they change
  useEffect(() => {
    setShape(currentShape);
    setColor(currentColor);
    setMode(currentThemeMode);
    setLocalCustomColor(initialCustomColor || "#3b82f6");
    setLocalCustomGradientTo(initialCustomGradientTo || "#8b5cf6");
    setShowCustomPicker(currentColor === "custom");
  }, [
    currentShape,
    currentColor,
    currentThemeMode,
    initialCustomColor,
    initialCustomGradientTo,
  ]);

  // Auto-save when selections change
  useEffect(() => {
    onSave(shape, color, mode, localCustomColor, localCustomGradientTo);
  }, [shape, color, mode, localCustomColor, localCustomGradientTo]);

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

  // Get gradient colors for preview
  const getPreviewGradient = () => {
    if (color === "custom") {
      return `linear-gradient(to bottom right, ${localCustomColor}, ${localCustomGradientTo})`;
    }
    const themeData = THEMES[color] || THEMES.blue;
    return themeData.gradientTo || themeData.bg;
  };

  // Get the current shape icon component
  const CurrentShapeIcon =
    shapeOptions.find((s) => s.name === shape)?.Icon || FlowerIcon;

  const currentHslPrimary = hexToHsl(
    isValidHex(localCustomColor) ? localCustomColor : "#3b82f6"
  );
  const currentHslGradient = hexToHsl(
    isValidHex(localCustomGradientTo) ? localCustomGradientTo : "#8b5cf6"
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Live Preview Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{ background: getPreviewGradient() }}
          >
            <CurrentShapeIcon className="w-16 h-16 text-white" />
          </div>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-3">
          Vista previa
        </p>
      </div>

      {/* Settings Container */}
      <div className="space-y-4">
        {/* Theme Mode */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Tema
          </label>
          <div
            className={`flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg ${
              isBwTheme ? "opacity-50" : ""
            }`}
          >
            <button
              onClick={() => handleModeChange("light")}
              disabled={isBwTheme}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md text-sm font-semibold ${
                mode === "light"
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
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md text-sm font-semibold ${
                mode === "dark"
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
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md text-sm font-semibold ${
                mode === "black"
                  ? `${theme.bg} text-white shadow`
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50"
              } ${isBwTheme ? "cursor-not-allowed" : ""}`}
            >
              <SolidCircleIcon className="w-5 h-5" />
              <span>Negro</span>
            </button>
          </div>
        </div>

        {/* Shape Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Forma
          </label>
          <div className="grid grid-cols-6 gap-2">
            {shapeOptions.map(({ name: shapeName, Icon }) => (
              <button
                key={shapeName}
                onClick={() => setShape(shapeName)}
                className={`aspect-square p-2 border-2 rounded-xl flex items-center justify-center ${
                  shape === shapeName
                    ? `${theme.text} border-current bg-blue-50/50 dark:bg-slate-700/50`
                    : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    shape === shapeName
                      ? "text-current"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Color
          </label>
          <div className="flex flex-wrap gap-2 justify-center">
            {THEME_LIST.map((themeOption) => (
              <button
                key={themeOption.name}
                onClick={() => handleColorSelect(themeOption.name)}
                className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${
                  themeOption.gradientFrom
                } ${themeOption.gradientTo} ${
                  !performanceMode &&
                  "transition-transform transform hover:scale-110"
                } ${
                  color === themeOption.name
                    ? "ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-slate-400"
                    : ""
                }`}
              >
                {color === themeOption.name && (
                  <CheckIcon
                    className={`w-4 h-4 ${
                      themeOption.name === "bw" ? "text-slate-900" : "text-white"
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
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed ${
                color === "custom"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-slate-400"
                  : "border-slate-300 dark:border-slate-600 hover:border-blue-400"
              }`}
            >
              <div className="flex">
                <div className="w-1 h-1 rounded-full bg-red-400"></div>
                <div className="w-1 h-1 rounded-full bg-green-400"></div>
                <div className="w-1 h-1 rounded-full bg-blue-400"></div>
              </div>
            </button>
          </div>

          {/* Custom Color Picker */}
          {showCustomPicker && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-fadeIn">
              <div className="space-y-6">
                {/* Primary Color Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Color Primario
                    </label>
                    <input
                      type="text"
                      value={localCustomColor}
                      onChange={(e) => setLocalCustomColor(e.target.value)}
                      onBlur={() => {
                        if (!isValidHex(localCustomColor)) {
                          setLocalCustomColor("#3b82f6");
                        }
                      }}
                      className="text-xs font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 uppercase outline-none focus:ring-1 focus:ring-blue-500 w-24 text-center"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-slate-500 font-medium">Tono</span>
                        <span className="text-[10px] font-mono text-slate-400">{Math.round(currentHslPrimary.h)}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={currentHslPrimary.h}
                        onChange={(e) => {
                          const newHex = hslToHex(parseFloat(e.target.value), currentHslPrimary.s, currentHslPrimary.l);
                          setLocalCustomColor(newHex);
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-white"
                        style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-slate-500 font-medium">Saturación</span>
                        <span className="text-[10px] font-mono text-slate-400">{Math.round(currentHslPrimary.s)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentHslPrimary.s}
                        onChange={(e) => {
                          const newHex = hslToHex(currentHslPrimary.h, parseFloat(e.target.value), currentHslPrimary.l);
                          setLocalCustomColor(newHex);
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-white"
                        style={{ background: `linear-gradient(to right, #888, ${hslToHex(currentHslPrimary.h, 100, 50)})` }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-slate-500 font-medium">Brillo</span>
                        <span className="text-[10px] font-mono text-slate-400">{Math.round(currentHslPrimary.l)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentHslPrimary.l}
                        onChange={(e) => {
                          const newHex = hslToHex(currentHslPrimary.h, currentHslPrimary.s, parseFloat(e.target.value));
                          setLocalCustomColor(newHex);
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-white"
                        style={{ background: `linear-gradient(to right, #000, ${hslToHex(currentHslPrimary.h, 100, 50)}, #fff)` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Gradient End Section */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Gradiente (Final)
                    </label>
                    <input
                      type="text"
                      value={localCustomGradientTo}
                      onChange={(e) => setLocalCustomGradientTo(e.target.value)}
                      onBlur={() => {
                        if (!isValidHex(localCustomGradientTo)) {
                          setLocalCustomGradientTo("#8b5cf6");
                        }
                      }}
                      className="text-xs font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 uppercase outline-none focus:ring-1 focus:ring-blue-500 w-24 text-center"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] text-slate-500 font-medium">Tono del Gradiente</span>
                        <span className="text-[10px] font-mono text-slate-400">{Math.round(currentHslGradient.h)}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={currentHslGradient.h}
                        onChange={(e) => {
                          const newHex = hslToHex(parseFloat(e.target.value), currentHslGradient.s, currentHslGradient.l);
                          setLocalCustomGradientTo(newHex);
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-white"
                        style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizationView;
