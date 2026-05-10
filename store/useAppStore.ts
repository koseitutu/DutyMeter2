import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, AppSettings, DarkMode } from './types';

const DEFAULT_POSITIONS = [
  'Missionary',
  'Cowgirl',
  'Doggy Style',
  'Spooning',
  'Reverse Cowgirl',
  'Standing',
  '69',
  'Lotus',
  'Side by Side',
  'Prone Bone',
];

interface SessionsSlice {
  sessions: Session[];
  archivedSessions: Session[];
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  deleteSessions: (ids: string[]) => void;
  importSessions: (sessions: Session[]) => void;
  archiveSession: (id: string, duration: '3months' | '6months' | '1year') => void;
  restoreSession: (id: string) => void;
  deleteArchivedSession: (id: string) => void;
}

interface SettingsSlice {
  settings: AppSettings;
  setUsername: (username: string) => void;
  setDarkMode: (mode: DarkMode) => void;
  addPosition: (position: string) => void;
  removePosition: (position: string) => void;
  getAllPositions: () => string[];
}

export type AppStore = SessionsSlice & SettingsSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      archivedSessions: [],
      settings: {
        username: 'User',
        darkMode: 'light',
        customPositions: DEFAULT_POSITIONS,
      },

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

      deleteSessions: (ids: string[]) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => !ids.includes(s.id)),
        })),

      importSessions: (sessions: Session[]) =>
        set((state) => {
          const existingIds = new Set(state.sessions.map((s) => s.id));
          const archivedIds = new Set(state.archivedSessions.map((s) => s.id));
          const newSessions = sessions.filter(
            (s) => !existingIds.has(s.id) && !archivedIds.has(s.id)
          );
          return { sessions: [...state.sessions, ...newSessions] };
        }),

      archiveSession: (id: string, duration: '3months' | '6months' | '1year') =>
        set((state) => {
          const session = state.sessions.find((s) => s.id === id);
          if (!session) return state;
          const archived: Session = {
            ...session,
            archivedAt: new Date().toISOString(),
            archiveDuration: duration,
          };
          return {
            sessions: state.sessions.filter((s) => s.id !== id),
            archivedSessions: [archived, ...state.archivedSessions],
          };
        }),

      restoreSession: (id: string) =>
        set((state) => {
          const session = state.archivedSessions.find((s) => s.id === id);
          if (!session) return state;
          const restored: Session = {
            ...session,
            archivedAt: null,
            archiveDuration: null,
          };
          return {
            archivedSessions: state.archivedSessions.filter((s) => s.id !== id),
            sessions: [restored, ...state.sessions],
          };
        }),

      deleteArchivedSession: (id: string) =>
        set((state) => ({
          archivedSessions: state.archivedSessions.filter((s) => s.id !== id),
        })),

      setUsername: (username: string) =>
        set((state) => ({
          settings: { ...state.settings, username },
        })),

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
    }),
    {
      name: 'dutymeter-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        archivedSessions: state.archivedSessions,
        settings: state.settings,
      }),
    }
  )
);
