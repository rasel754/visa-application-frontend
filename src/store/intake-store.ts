"use client";

import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { AnswerValue, FormAnswers, SubmitSuccessPayload } from "@/lib/types";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

interface IntakeState {
  countryCode: string | null;
  category: string | null;
  answers: FormAnswers;
  currentStepIndex: number;
  savedAt: string | null;
  hasHydrated: boolean;
  lastSubmission: SubmitSuccessPayload | null;
  setCountry: (countryCode: string | null) => void;
  setCategory: (category: string | null) => void;
  setAnswer: (key: string, value: AnswerValue) => void;
  setAnswersBulk: (updates: FormAnswers) => void;
  setStepIndex: (index: number) => void;
  setHasHydrated: (hydrated: boolean) => void;
  setLastSubmission: (payload: SubmitSuccessPayload | null) => void;
  resetDraft: () => void;
}

const LAST_SUBMISSION_KEY = "igl-visa-last-submission";

export function readLastSubmissionFallback(): SubmitSuccessPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LAST_SUBMISSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SubmitSuccessPayload>;
    if (typeof parsed.reference === "string" && typeof parsed.downloadToken === "string") {
      return { reference: parsed.reference, downloadToken: parsed.downloadToken };
    }
    return null;
  } catch {
    return null;
  }
}

export const useIntakeStore = create<IntakeState>()(
  persist(
    (set) => ({
      countryCode: null,
      category: null,
      answers: {},
      currentStepIndex: 0,
      savedAt: null,
      hasHydrated: false,
      lastSubmission: null,

      setCountry: (countryCode) =>
        set((state) => ({
          countryCode,
          category:
            state.countryCode === countryCode ? state.category : null,
          savedAt: new Date().toISOString(),
        })),

      setCategory: (category) =>
        set({
          category,
          savedAt: new Date().toISOString(),
        }),

      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value },
          savedAt: new Date().toISOString(),
        })),

      setAnswersBulk: (updates) =>
        set((state) => ({
          answers: { ...state.answers, ...updates },
          savedAt: new Date().toISOString(),
        })),

      setStepIndex: (index) =>
        set({
          currentStepIndex: index,
          savedAt: new Date().toISOString(),
        }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      setLastSubmission: (payload) => {
        if (typeof window !== "undefined") {
          try {
            if (payload) {
              window.sessionStorage.setItem(
                LAST_SUBMISSION_KEY,
                JSON.stringify(payload),
              );
            } else {
              window.sessionStorage.removeItem(LAST_SUBMISSION_KEY);
            }
          } catch {
            // Ignore storage errors
          }
        }
        set({ lastSubmission: payload });
      },

      resetDraft: () =>
        set({
          countryCode: null,
          category: null,
          answers: {},
          currentStepIndex: 0,
          savedAt: null,
        }),
    }),
    {
      name: "igl-visa-intake-draft",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      ),
      partialize: (state) => ({
        countryCode: state.countryCode,
        category: state.category,
        answers: state.answers,
        currentStepIndex: state.currentStepIndex,
        savedAt: state.savedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
