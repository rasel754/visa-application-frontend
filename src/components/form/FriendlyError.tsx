"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { localizeErrorMessage } from "@/lib/error-messages";
import { getUiStrings } from "@/lib/i18n/translations";
import { useLanguageStore } from "@/store/language-store";

export interface ErrorItem {
  key: string;
  label: string;
  message: string;
  stepIndex?: number;
}

interface FriendlyErrorProps {
  title: string;
  items?: ErrorItem[];
  onJumpToItem?: (item: ErrorItem) => void;
}

export function FriendlyError({
  title,
  items = [],
  onJumpToItem,
}: FriendlyErrorProps) {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);
  const localizedTitle = localizeErrorMessage(title, language);

  return (
    <div
      role="alert"
      className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-red-950 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-base font-semibold leading-snug">{localizedTitle}</p>
          {items.length > 0 && (
            <ul className="mt-2 space-y-2">
              {items.map((item) => {
                const localizedMessage = localizeErrorMessage(
                  item.message,
                  language,
                  item.label,
                );
                return (
                  <li
                    key={item.key}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{item.label}: </span>
                      <span className="text-red-700">{localizedMessage}</span>
                    </div>
                    {onJumpToItem && typeof item.stepIndex === "number" && (
                      <button
                        type="button"
                        onClick={() => onJumpToItem(item)}
                        className="inline-flex min-h-9 items-center gap-1 rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-900 hover:bg-red-200"
                      >
                        {t.fixThisButton}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
