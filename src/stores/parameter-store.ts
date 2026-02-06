import { create } from 'zustand';
import { Parameter } from '@/types/parameter';
import { STORAGE_KEYS } from '@/lib/constants';
import { loadFromSession, saveToSession } from '@/lib/storage';
import { SEED_PARAMETERS } from '@/lib/seed-data';

interface ParameterStore {
  parameters: Parameter[];
  hydrated: boolean;
  hydrate: () => void;
  addParameter: (parameter: Parameter) => void;
  updateParameter: (id: string, data: Partial<Parameter>) => void;
  deleteParameter: (id: string) => void;
  setParameters: (parameters: Parameter[]) => void;
  getParameter: (id: string) => Parameter | undefined;
  getParameterByKey: (key: string) => Parameter | undefined;
}

export const useParameterStore = create<ParameterStore>((set, get) => ({
  parameters: [],
  hydrated: false,

  hydrate: () => {
    const stored = loadFromSession<Parameter[]>(STORAGE_KEYS.PARAMETERS, []);
    if (stored.length > 0) {
      set({ parameters: stored, hydrated: true });
    } else {
      saveToSession(STORAGE_KEYS.PARAMETERS, SEED_PARAMETERS);
      set({ parameters: SEED_PARAMETERS, hydrated: true });
    }
  },

  addParameter: (parameter) => {
    const next = [...get().parameters, parameter];
    saveToSession(STORAGE_KEYS.PARAMETERS, next);
    set({ parameters: next });
  },

  updateParameter: (id, data) => {
    const next = get().parameters.map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    saveToSession(STORAGE_KEYS.PARAMETERS, next);
    set({ parameters: next });
  },

  deleteParameter: (id) => {
    const next = get().parameters.filter((p) => p.id !== id);
    saveToSession(STORAGE_KEYS.PARAMETERS, next);
    set({ parameters: next });
  },

  setParameters: (parameters) => {
    saveToSession(STORAGE_KEYS.PARAMETERS, parameters);
    set({ parameters });
  },

  getParameter: (id) => get().parameters.find((p) => p.id === id),
  getParameterByKey: (key) => get().parameters.find((p) => p.key === key),
}));
