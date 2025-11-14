import { HistoryLog } from "./types";

/**
 * Converts a decimal hour value to a "H:MM" string format.
 * @param hoursDecimal - The hours in decimal format (e.g., 1.5).
 * @returns A string representation like "1:30".
 */
export const hoursToHHMM = (hoursDecimal: number): string => {
  if (isNaN(hoursDecimal) || hoursDecimal < 0) {
    return "0:00";
  }
  const totalMinutes = Math.round(hoursDecimal * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}`;
};

/**
 * Converts a "H:MM" string to a decimal hour value.
 * @param hhmm - The time string in "H:MM" format.
 * @returns A decimal representation of the hours (e.g., 1.5).
 */
export const HHMMToHours = (hhmm: string): number => {
  if (!hhmm || typeof hhmm !== "string") return NaN;
  const parts = hhmm.split(":");
  if (parts.length !== 2) return NaN;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
    return NaN;
  }

  return hours + minutes / 60;
};

/**
 * Parses various time input formats (e.g., "2", "2.5", "2,30", "2:30") into decimal hours.
 * @param inputStr - The string input from the user.
 * @returns A decimal representation of the hours.
 */
export const flexibleInputToHours = (inputStr: string): number => {
  if (!inputStr || typeof inputStr !== "string") return NaN;

  const cleanInput = inputStr.trim();

  // Case 1: H:MM format
  if (cleanInput.includes(":")) {
    return HHMMToHours(cleanInput);
  }

  const inputWithDot = cleanInput.replace(",", ".");

  // Case 2: H.MM format (interpreted as hours and minutes)
  if (inputWithDot.includes(".") && !/^\d+\.$/.test(inputWithDot)) {
    const parts = inputWithDot.split(".");
    if (parts.length !== 2) return NaN;

    const hours = parseInt(parts[0] || "0", 10);
    const minutes = parseInt(parts[1], 10);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      minutes < 0 ||
      minutes > 59 ||
      parts[1].length > 2
    ) {
      return NaN;
    }
    return hours + minutes / 60;
  }

  // Case 3: Just a number (can be integer or decimal)
  const hours = parseFloat(inputWithDot);
  if (!isNaN(hours) && isFinite(hours)) {
    return hours;
  }

  return NaN;
};

/**
 * Checks if two Date objects are on the same calendar day, ignoring time.
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Calculates the number of full days between two dates.
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Checks if a given date is a weekend (Saturday or Sunday).
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 6 || day === 0; // 6 = Saturday, 0 = Sunday
};

/**
 * Gets the service year string (e.g., "2023-2024") for a given date.
 * The service year runs from September to August.
 */
export const getServiceYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

/**
 * Gets an array of Date objects for each month of the service year for a given date.
 */
export const getServiceYearMonths = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const startYear = month >= 8 ? year : year - 1;
  const months = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (8 + i) % 12;
    const yearForMonth = startYear + Math.floor((8 + i) / 12);
    months.push(new Date(yearForMonth, monthIndex, 1));
  }
  return months;
};

/**
 * Gets the date of the Commemoration for a given service year.
 * Dates are hardcoded for reliability.
 * @param serviceYear - The service year string (e.g., "2023-2024").
 * @returns A Date object for the Commemoration, or null if not found.
 */
export const getCommemorationDate = (serviceYear: string): Date | null => {
  const commemorationDates: Record<string, string> = {
    "2023-2024": "2024-03-24", // March 24, 2024
    "2024-2025": "2025-04-12", // April 12, 2025
    "2025-2026": "2026-04-02", // April 2, 2026
  };
  const dateStr = commemorationDates[serviceYear];
  if (!dateStr) return null;
  // Add T12:00:00Z to avoid timezone issues where the date could be off by one.
  return new Date(dateStr + "T12:00:00Z");
};

/**
 * Formats a Date object into a "YYYY-MM-DD" string key.
 * @param date - The date to format.
 * @returns A string key like "2023-09-01".
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
