import React from 'react';
import { Achievement, UnlockedAchievements, ThemeColor, AppState } from '../types';
import AchievementCard from './AchievementCard';

interface AchievementsViewProps {
  allAchievements: Achievement[];
  unlockedAchievements: UnlockedAchievements;
  themeColor: ThemeColor;
  appState: AppState;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ allAchievements, unlockedAchievements, themeColor, appState }) => {
  const unlockedCount = Object.keys(unlockedAchievements).length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Mis Logros</h2>
        <p className="text-slate-500 dark:text-slate-400 font-semibold">{unlockedCount} de {allAchievements.length} desbloqueados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allAchievements.map(achievement => (
          <AchievementCard 
            key={achievement.id}
            achievement={achievement}
            unlockedInfo={unlockedAchievements[achievement.id]}
            themeColor={themeColor}
            appState={appState}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementsView;
