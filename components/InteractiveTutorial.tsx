import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { TutorialStep, ThemeColor } from '../types';
import { THEMES } from '../constants';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { XIcon } from './icons/XIcon';

interface InteractiveTutorialProps {
  steps: TutorialStep[] | null;
  onFinish: () => void;
  themeColor: ThemeColor;
  performanceMode: boolean;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ steps, onFinish, themeColor, performanceMode }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement>(null);
  const theme = THEMES[themeColor] || THEMES.blue;

  const currentStep = steps ? steps[currentStepIndex] : null;

  useLayoutEffect(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    let attempts = 0;
    const findElement = () => {
      const element = document.querySelector(currentStep.target);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else if (attempts < 5) { // Try a few times in case of delayed rendering
        attempts++;
        setTimeout(findElement, 100);
      } else {
        handleNext();
      }
    };
    
    findElement();

  }, [currentStepIndex, steps]);

  useEffect(() => {
    if (steps && steps.length > 0) {
        setCurrentStepIndex(0);
        setIsVisible(true);
    } else {
        setIsVisible(false);
    }
  }, [steps]);

  useLayoutEffect(() => {
    if (!popoverRef.current || !targetRect || !currentStep) return;

    const popover = popoverRef.current;
    const popoverRect = popover.getBoundingClientRect();
    const pos: React.CSSProperties = {};
    const offset = 16;
    const margin = 10;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const preferredPosition = currentStep.position || 'bottom';

    let top = 0;
    let left = 0;
    
    switch (preferredPosition) {
        case 'top':
            top = targetRect.top - popoverRect.height - offset;
            left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
            break;
        case 'left':
            top = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
            left = targetRect.left - popoverRect.width - offset;
            break;
        case 'right':
            top = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
            left = targetRect.right + offset;
            break;
        case 'bottom':
        default:
            top = targetRect.bottom + offset;
            left = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;
            break;
    }

    // Clamp values to stay within viewport
    if (left < margin) left = margin;
    if (left + popoverRect.width > screenWidth - margin) left = screenWidth - popoverRect.width - margin;
    if (top < margin) top = margin;
    if (top + popoverRect.height > screenHeight - margin) top = screenHeight - popoverRect.height - margin;

    pos.top = `${top}px`;
    pos.left = `${left}px`;
    
    setPopoverStyle(pos);

  }, [targetRect, currentStep]);


  const handleNext = () => {
    if (steps && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsVisible(false);
    setTimeout(() => {
        onFinish();
        setCurrentStepIndex(0);
    }, 300);
  };
  
  if (!isVisible || !currentStep || !targetRect) return null;

  const highlightPadding = currentStep.highlightPadding ?? 8;
  const highlightStyle = {
    top: `${targetRect.top - highlightPadding}px`,
    left: `${targetRect.left - highlightPadding}px`,
    width: `${targetRect.width + highlightPadding * 2}px`,
    height: `${targetRect.height + highlightPadding * 2}px`,
  };
  
  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
            style={{
                ...highlightStyle,
                position: 'absolute',
                borderRadius: '12px',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.7)',
                transition: performanceMode ? 'none' : 'all 0.4s ease-in-out',
                pointerEvents: 'none',
            }}
        />

        <div
            ref={popoverRef}
            style={popoverStyle}
            className={`absolute z-[101] bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-80 p-5 border border-slate-200 dark:border-slate-700 ${!performanceMode && 'animate-fadeInUp'}`}
            role="dialog"
            aria-labelledby="tutorial-title"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo} mr-4`}>
                    <LightBulbIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow">
                    <h3 id="tutorial-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">{currentStep.title}</h3>
                </div>
                <button onClick={handleFinish} className="p-1.5 -mt-2 -mr-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">{currentStep.content}</p>
            
            <div className="flex items-center justify-between">
                 <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {steps.length > 1 ? `${currentStepIndex + 1} / ${steps.length}` : ''}
                </span>
                <button
                    onClick={handleNext}
                    className={`px-5 py-2 rounded-lg ${theme.bg} text-white font-bold text-sm shadow-lg transition-transform ${!performanceMode && 'transform hover:scale-105'}`}
                >
                    {steps.length === 1 || currentStepIndex === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default InteractiveTutorial;