import { create } from 'zustand';
import { Policy } from '@/types/policy';
import { STORAGE_KEYS } from '@/lib/constants';
import { loadFromSession, saveToSession } from '@/lib/storage';
import { SEED_POLICIES } from '@/lib/seed-data';

interface PolicyStore {
  policies: Policy[];
  hydrated: boolean;
  hydrate: () => void;
  addPolicy: (policy: Policy) => void;
  updatePolicy: (id: string, data: Partial<Policy>) => void;
  deletePolicy: (id: string) => void;
  setPolicies: (policies: Policy[]) => void;
  getPolicy: (id: string) => Policy | undefined;
  duplicatePolicy: (id: string, scopeOverrides: Record<string, string>) => Policy | null;
}

export const usePolicyStore = create<PolicyStore>((set, get) => ({
  policies: [],
  hydrated: false,

  hydrate: () => {
    const stored = loadFromSession<Policy[]>(STORAGE_KEYS.POLICIES, []);
    if (stored.length > 0) {
      set({ policies: stored, hydrated: true });
    } else {
      saveToSession(STORAGE_KEYS.POLICIES, SEED_POLICIES);
      set({ policies: SEED_POLICIES, hydrated: true });
    }
  },

  addPolicy: (policy) => {
    const next = [...get().policies, policy];
    saveToSession(STORAGE_KEYS.POLICIES, next);
    set({ policies: next });
  },

  updatePolicy: (id, data) => {
    const next = get().policies.map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    saveToSession(STORAGE_KEYS.POLICIES, next);
    set({ policies: next });
  },

  deletePolicy: (id) => {
    const next = get().policies.filter((p) => p.id !== id);
    saveToSession(STORAGE_KEYS.POLICIES, next);
    set({ policies: next });
  },

  setPolicies: (policies) => {
    saveToSession(STORAGE_KEYS.POLICIES, policies);
    set({ policies });
  },

  getPolicy: (id) => get().policies.find((p) => p.id === id),

  duplicatePolicy: (id, scopeOverrides) => {
    const source = get().getPolicy(id);
    if (!source) return null;

    const newPolicy: Policy = {
      ...structuredClone(source),
      id: `pol_${Date.now()}`,
      name: `${source.name} (Copy)`,
      scope: { ...source.scope, ...scopeOverrides },
    };

    get().addPolicy(newPolicy);
    return newPolicy;
  },
}));
