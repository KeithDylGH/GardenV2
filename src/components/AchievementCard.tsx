import React from "react";
import {
  Achievement,
  UnlockedAchievements,
  ThemeColor,
  AppState,
} from "../types";
import { THEMES } from "../constants";

interface AchievementCardProps {
  achievement: Achievement;
  unlockedInfo: UnlockedAchievements[string];
  themeColor: ThemeColor;
  appState: AppState;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  unlockedInfo,
  themeColor,
  appState,
}) => {
  const theme = THEMES[themeColor] || THEMES.blue;
  const isUnlocked = !!unlockedInfo;

  const { currentProgress } = achievement.check(appState);
  const currentTier = unlockedInfo ? unlockedInfo.unlockedTier : 0;
  const nextTierIndex = achievement.tiers.findIndex(
    (tierValue) =>
      tierValue > (unlockedInfo ? achievement.tiers[currentTier - 1] : 0)
  );
  const goal =
    nextTierIndex !== -1
      ? achievement.tiers[nextTierIndex]
      : achievement.tiers[achievement.tiers.length - 1];

  const progressPercent =
    goal > 0 ? Math.min((currentProgress / goal) * 100, 100) : 0;

  const cardClasses = `p-4 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
    isUnlocked
      ? "bg-white dark:bg-slate-800 shadow-sm border-slate-200/50 dark:border-slate-700/50"
      : "bg-slate-100 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700"
  }`;

  const contentOpacity = isUnlocked ? "opacity-100" : "opacity-50";

  return (
    <div className={cardClasses}>
      <div>
        <div className="flex items-start justify-between">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
              isUnlocked
                ? `${theme.bg} bg-opacity-10`
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <achievement.icon
              className={`w-7 h-7 ${
                isUnlocked ? theme.text : "text-slate-500 dark:text-slate-400"
              }`}
            />
          </div>
          {isUnlocked && (
            <div
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.bg} text-white`}
            >
              Nivel {currentTier}
            </div>
          )}
        </div>
        <h3
          className={`mt-3 font-bold text-slate-800 dark:text-slate-100 ${contentOpacity}`}
        >
          {achievement.title}
        </h3>
        <p
          className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${contentOpacity}`}
        >
          {achievement.description(goal)}
        </p>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 mb-1">
          <span>Progreso</span>
          {!isUnlocked && (
            <span>
              {Math.floor(currentProgress)} / {goal}
            </span>
          )}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              isUnlocked ? theme.bg : "bg-slate-400 dark:bg-slate-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
