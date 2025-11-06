import React, { useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';

interface OfflineToastProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const OfflineToast: React.FC<OfflineToastProps> = ({ isVisible, onDismiss }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000); // El toast desaparecerá después de 4 segundos
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      role="status"
      aria-live="polite"
    >
      {isVisible && (
        <div className="flex items-center space-x-3 bg-slate-800 text-white py-3 px-5 rounded-full shadow-lg">
          <CheckIcon className="w-5 h-5 text-green-400" />
          <p className="text-sm font-medium">Listo para usar sin conexión</p>
        </div>
      )}
    </div>
  );
};

export default OfflineToast;
