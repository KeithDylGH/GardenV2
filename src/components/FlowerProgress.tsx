import React, { useState, useEffect, useRef } from "react";
import { ThemeColor, Shape } from "../types";
import { THEMES } from "../constants";

interface ShapeProgressProps {
  progress: number; // 0 to 1
  shape: Shape;
  themeColor: ThemeColor;
  isPrivacyMode: boolean;
}

const SHAPE_PATHS: Record<Shape, string> = {
  flower:
    "M 75 25 Q 65 5, 50 5 Q 35 5, 25 25 Q 5 35, 5 50 Q 5 65, 25 75 Q 35 95, 50 95 Q 65 95, 75 75 Q 95 65, 95 50 Q 95 35, 75 25 Z",
  circle: "M 50, 95 A 45,45 0 1,1 50, 5 A 45,45 0 1,1 50, 95",
  heart: "M 50,90 L 10,50 A 20,20 0 1,1 50,30 A 20,20 0 1,1 90,50 Z",
  diamond: "M 50 5 L 95 50 L 50 95 L 5 50 Z",
  triangle: "M 10 10 H 90 V 90 H 10 Z",
  hexagon: "M 50 5 L 89 27.5 L 89 72.5 L 50 95 L 11 72.5 L 11 27.5 Z",
};

const ShapeProgress: React.FC<ShapeProgressProps> = ({
  progress,
  shape,
  themeColor,
  isPrivacyMode,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const shapePathData = SHAPE_PATHS[shape] || SHAPE_PATHS.flower;
  const theme = THEMES[themeColor] || THEMES.blue;
  const gradientId = `progressGradient-${themeColor}-${shape}`; // Make ID unique

  useEffect(() => {
    setIsReady(false);
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
    const timer = setTimeout(() => setIsReady(true), 50); // Short delay to allow DOM update
    return () => clearTimeout(timer);
  }, [shape]);

  const displayProgress = isPrivacyMode ? 0 : progress;
  const dashOffset =
    pathLength * (1 - Math.max(0, Math.min(1, displayProgress)));

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full transition-opacity duration-200 ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
      aria-label={`Progreso del servicio: ${(progress * 100).toFixed(0)}%`}
      role="img"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.gradientFromColor} />
          <stop offset="100%" stopColor={theme.gradientToColor} />
        </linearGradient>
      </defs>

      {/* Background track */}
      <path
        d={shapePathData}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-slate-200 dark:stroke-slate-700"
      />

      {/* Progress path */}
      <path
        ref={pathRef}
        d={shapePathData}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={dashOffset}
        style={{
          transition: isReady ? "stroke-dashoffset 0.5s ease-out" : "none",
          transformOrigin: "50% 50%",
        }}
      />
    </svg>
  );
};

export default ShapeProgress;
