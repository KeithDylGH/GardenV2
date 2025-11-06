// FIX: Import React to use React types like React.FC
import React from 'react';
import { THEMES } from "./constants";

export type ThemeColor = 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'teal' | 'indigo' | 'red' | 'yellow' | 'wine' | 'bw' | 'blush' | 'sunset' | 'ocean' | 'forest' | 'lavender';

export type ThemeConfig = {
  name: ThemeColor;
  gradientFrom: string;
  gradientTo: string;
  gradientFromColor: string;
  gradientToColor: string;
  bg: string;
  text: string;
  ring: string;
  accentText: string;
  accentTextLight: string;
};

export type ThemeMode = 'light' | 'dark' | 'black';

export type Shape = 'flower' | 'circle' | 'heart';

export type DayStatus = 'sick';
export type WeatherCondition = 'sunny' | 'cloudy' | 'bad';

export type DayEntry = {
  hours: number;
  ldcHours?: number;
  status?: DayStatus;
  weather?: WeatherCondition;
  isSummary?: boolean;
  isCampaign?: boolean;
};

export type HistoryLog = {
  [dateKey: string]: DayEntry;
};

export type DayLog = {
  date: string;
  hours: number;
};

export type ActivityType = 'visit' | 'study';

export type ActivityItem = {
  id: string;
  type: ActivityType;
  name: string;
  location?: string;
  comments?: string;
  date: string; // ISO string
  lat?: number;
  lng?: number;
  recurring?: boolean;
};

export type GroupArrangement = {
  groupNumber?: string;
  conductor?: string;
  time?: string;
  location?: string;
  territory?: string;
};

export type UserRole = 'publisher' | 'aux_pioneer' | 'reg_pioneer' | 'spec_pioneer';

export type SetupData = {
  name: string;
  goal: number;
  previousHours: { [dateKey: string]: number };
  role: UserRole;
  currentMonthHours: number;
  meetingDays: number[];
  protectedDay: number | null;
  protectedDaySetDate: string | null;
};

export type TutorialStep = {
  target: string; // CSS Selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightPadding?: number;
};

export type TutorialsSeen = {
  // FIX: Add 'achievements' to the type to match usage in App.tsx
  [key in 'tracker' | 'activity' | 'history' | 'planning' | 'achievements']?: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: (tierGoal: number) => string;
  icon: React.FC<any>;
  tiers: number[];
  check: (state: AppState) => { unlocked: boolean; currentProgress: number };
  unlockedTier?: number; // Only for toast
};

export type UnlockedAchievements = {
  [id: string]: {
    unlockedTier: number;
    unlockedAt: string; // ISO date string
  };
};

export type AppState = {
  currentHours: number;
  currentLdcHours: number;
  userName: string;
  goal: number;
  userRole: UserRole;
  currentDate: string; // ISO string
  progressShape: Shape;
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  archives: Record<string, HistoryLog>;
  currentServiceYear: string;
  activities: ActivityItem[];
  groupArrangements: GroupArrangement[];
  streak: number;
  lastLogDate: string | null; // ISO string
  protectedDay: number | null;
  protectedDaySetDate?: string | null;
  meetingDays?: number[];
  planningData?: PlanningData;
  notes?: string;
  unlockedAchievements?: UnlockedAchievements;
};

export type PlanningBlock = {
  id: string;
  title: string;
  timeRange?: string;
  activityIds: string[];
};

export type PlanningData = {
  [dateKey: string]: PlanningBlock[];
};

export type AppView = 'tracker' | 'activity' | 'history' | 'planning' | 'achievements';
