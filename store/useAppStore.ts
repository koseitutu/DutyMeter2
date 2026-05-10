import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, Preferences } from './types';

interface SessionsSlice {
  sessions: Session[];
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
}

interface PreferencesSlice {
  preferences: Preferences;
  setPreferences: (prefs: Partial<Preferences>) => void;
}

export type AppStore = SessionsSlice & PreferencesSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      sessions: [],
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
        preferences: state.preferences,
      }),
    }
  )
);
