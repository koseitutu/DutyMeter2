import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, Preferences, AppSettings, DarkMode } from './types';

const DEFAULT_POSITIONS = [
  'Missionary',
  'Cowgirl',
  'Doggy Style',
  'Spooning',
  'Reverse Cowgirl',
  'Standing',
  '69',
  'Lotus',
];

interface SessionsSlice {
  sessions: Session[];
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  importSessions: (sessions: Session[]) => void;
}

interface SettingsSlice {
  settings: AppSettings;
  setDarkMode: (mode: DarkMode) => void;
  addPosition: (position: string) => void;
  removePosition: (position: string) => void;
  getAllPositions: () => string[];
}

interface PreferencesSlice {
  preferences: Preferences;
  setPreferences: (prefs: Partial<Preferences>) => void;
}

export type AppStore = SessionsSlice & SettingsSlice & PreferencesSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      settings: {
        darkMode: 'light',
        customPositions: DEFAULT_POSITIONS,
      },
      preferences: { userName: 'Alex' },

      addSession: (session: Session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),

      updateSession: (id: string, updates: Partial<Session>) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteSession: (id: string) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),

      importSessions: (sessions: Session[]) =>
        set((state) => {
          const existingIds = new Set(state.sessions.map((s) => s.id));
          const newSessions = sessions.filter((s) => !existingIds.has(s.id));
          return { sessions: [...state.sessions, ...newSessions] };
        }),

      setDarkMode: (mode: DarkMode) =>
        set((state) => ({
          settings: { ...state.settings, darkMode: mode },
        })),

      addPosition: (position: string) =>
        set((state) => {
          if (state.settings.customPositions.includes(position)) return state;
          return {
            settings: {
              ...state.settings,
              customPositions: [...state.settings.customPositions, position],
            },
          };
        }),

      removePosition: (position: string) =>
        set((state) => ({
          settings: {
            ...state.settings,
            customPositions: state.settings.customPositions.filter((p) => p !== position),
          },
        })),

      getAllPositions: () => get().settings.customPositions,

      setPreferences: (prefs: Partial<Preferences>) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
    }),
    {
      name: 'dutymeter-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        settings: state.settings,
        preferences: state.preferences,
      }),
    }
  )
);
