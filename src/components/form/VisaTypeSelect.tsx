"use client";

import { Briefcase, Building2, CheckCircle2, FileText, GraduationCap } from "lucide-react";
import { useCountryCategoryPreviews } from "@/hooks/useCategoryForm";
import { getCategoryDisplayInfo } from "@/lib/field-helpers";
import { CountrySummary } from "@/lib/types";

interface VisaTypeSelectProps {
  country: CountrySummary;
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  locked?: boolean;
}

function getCategoryIcon(categoryKey: string) {
  const lower = categoryKey.toLowerCase();
  if (lower === "student") return GraduationCap;
  if (lower === "business") return Building2;
  if (lower === "employee") return Briefcase;
  return FileText;
}

export function VisaTypeSelect({
  country,
  selectedCategory,
  onSelectCategory,
  locked = false,
}: VisaTypeSelectProps) {
  const previews = useCountryCategoryPreviews(
    country.country_code,
    country.categories,
  );

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">
          Choose your visa type for {country.country}
        </h2>
        <p className="text-base text-slate-600">
          Tap the reason you want to travel.
        </p>
        <p className="text-sm font-medium text-blue-800">
          আপনি কী উদ্দেশ্যে {country.country} যেতে চান তা নিচের কার্ড থেকে বেছে নিন।
        </p>
      </div>

      <div className="space-y-3">
        {country.categories.map((catKey, index) => {
          const info = getCategoryDisplayInfo(catKey);
          const Icon = getCategoryIcon(catKey);
          const preview = previews[index]?.data;
          const isSelected =
            selectedCategory?.toLowerCase() === catKey.toLowerCase();

          return (
            <button
              key={catKey}
              type="button"
              disabled={locked && !isSelected}
              onClick={() => onSelectCategory(catKey)}
              className={`flex w-full items-start justify-between gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                isSelected
                  ? "border-blue-700 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
              } ${locked && !isSelected ? "opacity-50" : ""}`}
            >
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xl font-bold text-slate-900">
                    {info.title}
                  </p>
                  <p className="text-base text-slate-700">{info.description}</p>
                  <p className="text-sm font-medium text-blue-800">
                    {info.bangla}
                  </p>
                  {preview?.official_visa_name && (
                    <p className="pt-1 text-xs text-slate-500">
                      Official name: {preview.official_visa_name}
                    </p>
                  )}
                </div>
              </div>

              {isSelected && (
                <CheckCircle2
                  className="mt-1 h-6 w-6 shrink-0 text-blue-700"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

