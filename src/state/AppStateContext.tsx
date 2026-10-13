import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppData } from '../lib/types';
import { seed } from '../data/seed';

const STORAGE_KEY = 'saldo-data-v1';

interface AppStateValue {
  data: AppData;
  setData: (updater: (prev: AppData) => AppData) => void;
  resetData: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function loadInitial(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch {
    // storage non disponibile o dati corrotti: si riparte dai dati di esempio
  }
  return seed();
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage pieno o non disponibile (es. navigazione privata): si continua solo in memoria
    }
  }, [data]);

  const setData = (updater: (prev: AppData) => AppData) => setDataState(updater);
  const resetData = () => setDataState(seed());

  return (
    <AppStateContext.Provider value={{ data, setData, resetData }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
