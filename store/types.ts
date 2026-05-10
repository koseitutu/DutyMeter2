/**
 * Data model types for DutyMeter
 */

export interface Session {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM format
  durationMinutes: number;
  location: string;
  position: string;
  orgasm: boolean;
  orgasmCount: number;
  notes: string;
  createdAt: string; // ISO timestamp
}

export type DarkMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  darkMode: DarkMode;
  customPositions: string[];
}

export interface Preferences {
  userName?: string;
}
