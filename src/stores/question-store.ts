import { create } from 'zustand';
import { Question } from '@/types/question';
import { STORAGE_KEYS } from '@/lib/constants';
import { loadFromSession, saveToSession } from '@/lib/storage';
import { SEED_QUESTIONS } from '@/lib/seed-data';

interface QuestionStore {
  questions: Question[];
  hydrated: boolean;
  hydrate: () => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, data: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  setQuestions: (questions: Question[]) => void;
  getQuestion: (id: string) => Question | undefined;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],
  hydrated: false,

  hydrate: () => {
    const stored = loadFromSession<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    if (stored.length > 0) {
      set({ questions: stored, hydrated: true });
    } else {
      saveToSession(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
      set({ questions: SEED_QUESTIONS, hydrated: true });
    }
  },

  addQuestion: (question) => {
    const next = [...get().questions, question];
    saveToSession(STORAGE_KEYS.QUESTIONS, next);
    set({ questions: next });
  },

  updateQuestion: (id, data) => {
    const next = get().questions.map((q) =>
      q.id === id ? { ...q, ...data } : q
    );
    saveToSession(STORAGE_KEYS.QUESTIONS, next);
    set({ questions: next });
  },

  deleteQuestion: (id) => {
    const next = get().questions.filter((q) => q.id !== id);
    saveToSession(STORAGE_KEYS.QUESTIONS, next);
    set({ questions: next });
  },

  setQuestions: (questions) => {
    saveToSession(STORAGE_KEYS.QUESTIONS, questions);
    set({ questions });
  },

  getQuestion: (id) => get().questions.find((q) => q.id === id),
}));
