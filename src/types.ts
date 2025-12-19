import React from "react";

export type ThemeColor =
  | "blue"
  | "pink"
  | "green"
  | "orange"
  | "purple"
  | "teal"
  | "indigo"
  | "red"
  | "yellow"
  | "wine"
  | "bw"
  | "blush"
  | "sunset"
  | "ocean"
  | "forest"
  | "lavender"
  | "custom";

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

export type ThemeMode = "light" | "dark" | "black";

export type Shape =
  | "flower"
  | "circle"
  | "heart"
  | "diamond"
  | "triangle"
  | "hexagon";

export type DayStatus = "sick";
export type DayEvent =
  | "circuit_assembly"
  | "regional_convention"
  | "campaign"
  | "memorial"
  | "cleaning"
  | "co_visit"
  | "sick";

export type DayEntry = {
  hours: number;
  ldcHours?: number;
  status?: "sick"; // Keeping for backward compatibility or explicit sick status
  event?: DayEvent;
  weather?: string; // FLAGGED DEPRECATED in type, kept for legacy data reading if needed
  isSummary?: boolean;
  isCampaign?: boolean;
  notes?: string;
};

export type HistoryLog = {
  [dateKey: string]: DayEntry;
};

export type DayLog = {
  date: string;
  hours: number;
};

export type ActivityType = "visit" | "study";

// Conversation stage for revisitas
export type ConversationStage = "first" | "second" | "third" | "fourth_plus";

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
  recurringDays?: number[]; // 0-6 for Sun-Sat

  // Revisita fields
  conversationStage?: ConversationStage; // Default: "first"

  // Estudio fields  
  weeklyFrequency?: number; // How many times per week (1-7)
  currentLesson?: number;   // Lesson number in "Disfrute de la Vida" (1-60)
  lessonNotes?: string;     // Notes about lesson progress
};

export type GroupArrangement = {
  groupNumber?: string;
  conductor?: string;
  time?: string;
  location?: string;
  territory?: string;
};

export type UserRole =
  | "publisher"
  | "aux_pioneer"
  | "reg_pioneer"
  | "spec_pioneer";

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
  position?: "top" | "bottom" | "left" | "right";
  highlightPadding?: number;
};

export type TutorialsSeen = {
  [key in
  | "tracker"
  | "activity"
  | "history"
  | "planning"
  | "achievements"]?: boolean;
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
  profilePicture?: string | null;
  customColor?: string;
  customGradientTo?: string;
};

export type PlanningBlock = {
  id: string;
  title: string;
  timeRange?: string;
  reminderTime?: string; // HH:mm format
  activityIds: string[];
};

export type PlanningData = {
  [dateKey: string]: PlanningBlock[];
};

export type AppView =
  | "tracker"
  | "activity"
  | "history"
  | "planning"
  | "achievements";
