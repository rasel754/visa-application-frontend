"use client";

import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-700">
        <span className="text-base font-semibold text-slate-900">
          {t.progress.stepOf(currentStepNumber, total, currentName)}
        </span>
        <span className="text-xs font-semibold text-blue-700">
          {t.progress.percent(percent)}
        </span>
      </div>

      <Progress value={percent} className="mt-3 h-2.5 bg-slate-100" />

      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
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
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isCurrent
                  ? "border-blue-700 bg-blue-700 text-white"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    : "border-slate-200 bg-slate-50 text-slate-500"
              } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
            >
              {isDone && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              <span>{stepName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
