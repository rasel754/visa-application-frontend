"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { getBanglaError } from "@/lib/error-messages";

export interface ErrorItem {
  key: string;
  label: string;
  message: string;
  stepIndex?: number;
}

interface FriendlyErrorProps {
  title: string;
  banglaHint?: string;
  items?: ErrorItem[];
  onJumpToItem?: (item: ErrorItem) => void;
}

export function FriendlyError({
  title,
  banglaHint,
  items = [],
  onJumpToItem,
}: FriendlyErrorProps) {
  const effectiveBanglaHint = banglaHint ?? getBanglaError(title);

  return (
    <div
      role="alert"
      className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-red-950 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-base font-semibold leading-snug">{title}</p>
          {effectiveBanglaHint && (
            <p className="text-sm text-red-800">{effectiveBanglaHint}</p>
          )}
          {items.length > 0 && (
            <ul className="mt-2 space-y-2">
              {items.map((item) => {
                const itemBangla = getBanglaError(item.message);
                return (
                  <li
                    key={item.key}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{item.label}: </span>
                      <span className="text-red-700">{item.message}</span>
                      {itemBangla && (
                        <p className="mt-0.5 text-xs text-red-800">{itemBangla}</p>
                      )}
                    </div>
                    {onJumpToItem && typeof item.stepIndex === "number" && (
                      <button
                        type="button"
                        onClick={() => onJumpToItem(item)}
                        className="inline-flex min-h-9 items-center gap-1 rounded-md bg-red-100 px-3 py-1 text-xs font-semibold text-red-900 hover:bg-red-200"
                      >
                        Fix this
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
