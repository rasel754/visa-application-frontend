"use client";

import { Languages } from "lucide-react";
import { FormLanguage, useLanguageStore } from "@/store/language-store";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const handleSelect = (next: FormLanguage) => {
    setLanguage(next);
  };

  return (
    <div
      role="group"
      aria-label="Language / ভাষা"
      className={`inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-2xs ${className}`}
    >
      <span className="hidden items-center pl-2 pr-1.5 text-slate-500 sm:inline-flex">
        <Languages className="h-4 w-4" aria-hidden="true" />
      </span>
      <button
        type="button"
        onClick={() => handleSelect("en")}
        aria-pressed={language === "en"}
        className={`min-h-8 cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all sm:px-3 sm:text-sm ${
          language === "en"
            ? "bg-blue-700 text-white shadow-xs"
            : "text-slate-700 hover:bg-white/70 hover:text-slate-900"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => handleSelect("bn")}
        aria-pressed={language === "bn"}
        className={`min-h-8 cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all sm:px-3 sm:text-sm ${
          language === "bn"
            ? "bg-blue-700 text-white shadow-xs"
            : "text-slate-700 hover:bg-white/70 hover:text-slate-900"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}

