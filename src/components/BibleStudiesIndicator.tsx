
import React, { useMemo } from 'react';
import { ActivityItem } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface BibleStudiesIndicatorProps {
  currentDate: Date;
  activities: ActivityItem[];
  isPrivacyMode: boolean;
}

const BibleStudiesIndicator: React.FC<BibleStudiesIndicatorProps> = ({ currentDate, activities, isPrivacyMode }) => {
  const studyCount = useMemo(() => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return activities.filter(activity => {
      if (activity.type !== 'study') return false;
      const activityDate = new Date(activity.date);
      return activityDate.getMonth() === currentMonth && activityDate.getFullYear() === currentYear;
    }).length;

  }, [currentDate, activities]);
  
  if (isPrivacyMode) {
    return <div className="text-center w-24" aria-hidden="true" />;
  }

  return (
    <div className="text-center w-24">
      <BookOpenIcon className="w-6 h-6 mx-auto text-slate-500 dark:text-slate-400" />
      <p className={`text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1`}>
        {studyCount}
      </p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estudios</p>
    </div>
  );
};

export default BibleStudiesIndicator;
