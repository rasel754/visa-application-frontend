"use client";

import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { AnswerValue, FormAnswers, ProfessionKey, SubmitSuccessPayload } from "@/lib/types";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export interface FieldMetaItem {
  source: "ocr" | "manual";
  confidence: "high" | "low";
}

// In-memory cache for clean File objects (cannot be serialized to sessionStorage)
const inMemoryScannedFiles = new Map<string, File>();

export function storeScannedFileInMemory(key: string, file: File): void {
  inMemoryScannedFiles.set(key, file);
}

export function getScannedFileFromMemory(key: string): File | undefined {
  return inMemoryScannedFiles.get(key);
}

export function clearScannedFilesInMemory(): void {
  inMemoryScannedFiles.clear();
}

interface IntakeState {
  countryCode: string | null;
  profession: ProfessionKey | null;
  answers: FormAnswers;
  fieldMeta: Record<string, FieldMetaItem>;
  currentStepIndex: number;
  savedAt: string | null;
  hasHydrated: boolean;
  lastSubmission: SubmitSuccessPayload | null;
  scannedDocAvailable: {
    passport: boolean;
    nidFront: boolean;
    nidBack: boolean;
  };
  setCountry: (countryCode: string | null) => void;
  setProfession: (profession: ProfessionKey | null) => void;
  setAnswer: (
    key: string,
    value: AnswerValue,
    source?: "ocr" | "manual",
    confidence?: "high" | "low",
  ) => void;
  setAnswersBulk: (
    updates: FormAnswers,
    metaUpdates?: Record<string, FieldMetaItem>,
  ) => void;
  setFieldMeta: (key: string, meta: FieldMetaItem) => void;
  setFieldMetaBulk: (metaUpdates: Record<string, FieldMetaItem>) => void;
  setScannedDocAvailable: (
    key: "passport" | "nidFront" | "nidBack",
    available: boolean,
  ) => void;
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
      profession: null,
      answers: {},
      fieldMeta: {},
      currentStepIndex: 0,
      savedAt: null,
      hasHydrated: false,
      lastSubmission: null,
      scannedDocAvailable: {
        passport: false,
        nidFront: false,
        nidBack: false,
      },

      setCountry: (countryCode) =>
        set((state) => ({
          countryCode,
          profession:
            state.countryCode === countryCode ? state.profession : null,
          savedAt: new Date().toISOString(),
        })),

      setProfession: (profession) =>
        set({
          profession,
          savedAt: new Date().toISOString(),
        }),

      setAnswer: (key, value, source, confidence) =>
        set((state) => {
          const nextMeta = { ...state.fieldMeta };
          if (source) {
            nextMeta[key] = { source, confidence: confidence ?? "high" };
          } else if (nextMeta[key]?.source === "ocr") {
            // When user edits an auto-filled field, switch source to 'manual'
            nextMeta[key] = { source: "manual", confidence: "high" };
          }

          return {
            answers: { ...state.answers, [key]: value },
            fieldMeta: nextMeta,
            savedAt: new Date().toISOString(),
          };
        }),

      setAnswersBulk: (updates, metaUpdates) =>
        set((state) => ({
          answers: { ...state.answers, ...updates },
          fieldMeta: metaUpdates
            ? { ...state.fieldMeta, ...metaUpdates }
            : state.fieldMeta,
          savedAt: new Date().toISOString(),
        })),

      setFieldMeta: (key, meta) =>
        set((state) => ({
          fieldMeta: { ...state.fieldMeta, [key]: meta },
        })),

      setFieldMetaBulk: (metaUpdates) =>
        set((state) => ({
          fieldMeta: { ...state.fieldMeta, ...metaUpdates },
        })),

      setScannedDocAvailable: (key, available) =>
        set((state) => ({
          scannedDocAvailable: {
            ...state.scannedDocAvailable,
            [key]: available,
          },
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

      resetDraft: () => {
        clearScannedFilesInMemory();
        set({
          countryCode: null,
          profession: null,
          answers: {},
          fieldMeta: {},
          currentStepIndex: 0,
          savedAt: null,
          scannedDocAvailable: {
            passport: false,
            nidFront: false,
            nidBack: false,
          },
        });
      },
    }),
    {
      name: "igl-visa-intake-v4-session",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : noopStorage,
      ),
      partialize: (state) => ({
        countryCode: state.countryCode,
        profession: state.profession,
        answers: state.answers,
        fieldMeta: state.fieldMeta,
        currentStepIndex: state.currentStepIndex,
        savedAt: state.savedAt,
        scannedDocAvailable: state.scannedDocAvailable,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
