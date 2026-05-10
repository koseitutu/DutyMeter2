/**
 * Data model types for DutyMeter
 */

export interface Session {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM format
  durationMinutes: number;
  rounds: number; // min 1
  location: string;
  positions: string[]; // array — multiple positions allowed
  orgasm: boolean;
  orgasmCount: number;
  notes: string;
  createdAt: string; // ISO timestamp
  archivedAt: string | null; // ISO timestamp if archived
  archiveDuration: '3months' | '6months' | '1year' | null;
}

export type DarkMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  username: string;
  darkMode: DarkMode;
  customPositions: string[];
}

export interface Preferences {
  userName?: string;
}
