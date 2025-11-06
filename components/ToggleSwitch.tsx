import React from 'react';
import { ThemeColor } from '../types';
import { THEMES } from '../constants';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  themeColor: ThemeColor;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, themeColor }) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const backgroundClass = checked ? theme.bg : 'bg-slate-300 dark:bg-slate-600';

  return (
    <button
      type="button"
      className={`${backgroundClass} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-slate-800 ${theme.ring}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        aria-hidden="true"
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

export default ToggleSwitch;