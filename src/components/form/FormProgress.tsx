"use client";

import { Check } from "lucide-react";
import { getUiStrings } from "@/lib/i18n/translations";
import { useLanguageStore } from "@/store/language-store";

interface FormProgressProps {
  steps: string[];
  currentIndex: number;
  onSelectStep?: (index: number) => void;
  maxReachableIndex: number;
}

export function FormProgress({
  steps,
  currentIndex,
  onSelectStep,
  maxReachableIndex,
}: FormProgressProps) {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);

  const total = steps.length;
  const currentStepNumber = Math.min(currentIndex + 1, total);
  const percent = total > 0 ? Math.round((currentStepNumber / total) * 100) : 0;
  const currentName = steps[currentIndex] ?? "";

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-700">
        <span className="text-base font-bold tracking-tight text-slate-900">
          {t.progress.stepOf(currentStepNumber, total, currentName)}
        </span>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/80">
          {t.progress.percent(percent)}
        </span>
      </div>

      <div className="relative mt-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 transition-all duration-300 shadow-xs"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {steps.map((stepName, index) => {
          const isCurrent = index === currentIndex;
          const isDone = index < currentIndex;
          const isClickable = Boolean(onSelectStep && index <= maxReachableIndex);

          return (
            <button
              key={`${stepName}-${index}`}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onSelectStep?.(index)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 ${
                isCurrent
                  ? "border-blue-700 bg-blue-700 text-white shadow-xs ring-2 ring-blue-500/20"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    : "border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100"
              } ${isClickable ? "cursor-pointer" : "cursor-default opacity-80"}`}
            >
              {isDone && <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />}
              <span>{stepName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
