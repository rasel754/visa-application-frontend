"use client";

import {
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  Info,
  Loader2,
} from "lucide-react";
import { FriendlyError } from "@/components/form/FriendlyError";
import {
  formatProfessionLabel,
  getLocalizedCountryName,
  getLocalizedOfficialForm,
  getLocalizedProfessionDescription,
  getLocalizedVisaName,
} from "@/lib/field-helpers";
import { getUiStrings } from "@/lib/i18n/translations";
import { CountrySummary, ProfessionKey, VisitForm } from "@/lib/types";
import { useLanguageStore } from "@/store/language-store";

interface ProfessionSelectProps {
  country: CountrySummary;
  visitForm: VisitForm | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  selectedProfession: ProfessionKey | null;
  onSelectProfession: (profession: ProfessionKey) => void;
  locked?: boolean;
}

const PROFESSION_ORDER: ProfessionKey[] = ["student", "businessman", "employee"];

function getProfessionIcon(key: ProfessionKey) {
  if (key === "student") return GraduationCap;
  if (key === "businessman") return Building2;
  return Briefcase;
}

export function ProfessionSelect({
  country,
  visitForm,
  isLoading,
  errorMessage,
  selectedProfession,
  onSelectProfession,
  locked = false,
}: ProfessionSelectProps) {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);
  const localizedCountryName = getLocalizedCountryName(
    country.country_code,
    country.country,
    language,
  );

  if (isLoading) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
        <p className="text-base text-slate-600">
          {t.professionSelect.loadingForCountry(localizedCountryName)}
        </p>
      </div>
    );
  }

  if (errorMessage || !visitForm) {
    return (
      <FriendlyError
        title={errorMessage ?? t.professionSelect.loadFailedFallback}
      />
    );
  }

  const formCountryName = getLocalizedCountryName(
    visitForm.country_code,
    visitForm.country,
    language,
  );
  const localizedVisaName = getLocalizedVisaName(
    visitForm.official_visa_name,
    language,
  );
  const localizedOfficialForm = getLocalizedOfficialForm(
    visitForm.official_form,
    language,
  );

  return (
    <div className="space-y-5">
      {/* Automatic Visit Visa Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/90 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
            <Info className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-800">
              {t.professionSelect.bannerPrefix} — {formCountryName}
            </p>
            <p className="text-lg font-bold text-slate-900">
              {localizedVisaName}
            </p>
            {localizedOfficialForm && (
              <p className="text-xs text-slate-600">
                {t.professionSelect.officialFormPrefix} {localizedOfficialForm}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">
          {t.professionSelect.title}
        </h2>
        <p className="text-base text-slate-600">{t.professionSelect.subtitle}</p>
      </div>

      <div className="space-y-3">
        {PROFESSION_ORDER.map((profKey) => {
          const profile = visitForm.applicant_profiles[profKey];
          const Icon = getProfessionIcon(profKey);
          const isSelected = selectedProfession === profKey;

          return (
            <button
              key={profKey}
              type="button"
              disabled={locked && !isSelected}
              onClick={() => onSelectProfession(profKey)}
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
                    {formatProfessionLabel(profKey, language)}
                  </p>
                  <p className="text-base text-slate-700">
                    {getLocalizedProfessionDescription(
                      profKey,
                      profile.description,
                      language,
                    )}
                  </p>
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
