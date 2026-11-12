"use client";

import { CheckCircle2, Globe } from "lucide-react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  getLocalizedCountryName,
  getLocalizedRegionName,
} from "@/lib/field-helpers";
import { getUiStrings } from "@/lib/i18n/translations";
import { CountrySummary } from "@/lib/types";
import { useLanguageStore } from "@/store/language-store";

interface CountrySelectProps {
  countries: CountrySummary[];
  selectedCountryCode: string | null;
  onSelectCountry: (country: CountrySummary) => void;
  locked?: boolean;
}

export function CountrySelect({
  countries,
  selectedCountryCode,
  onSelectCountry,
  locked = false,
}: CountrySelectProps) {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);

  const options: ComboboxOption[] = [...countries]
    .map((c) => {
      const bnName = getLocalizedCountryName(c.country_code, c.country, "bn");
      const bnRegion = getLocalizedRegionName(c.region, "bn");
      return {
        value: c.country_code,
        label: getLocalizedCountryName(c.country_code, c.country, language),
        hint: getLocalizedRegionName(c.region, language),
        keywords: [c.country, bnName, c.country_code, c.region, bnRegion],
      };
    })
    .sort((a, b) =>
      a.label.localeCompare(b.label, language === "bn" ? "bn" : "en", {
        sensitivity: "base",
      }),
    );

  const selected = countries.find(
    (c) =>
      selectedCountryCode &&
      c.country_code.toUpperCase() === selectedCountryCode.toUpperCase(),
  );

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">
          {t.countrySelect.title}
        </h2>
        <p className="text-base text-slate-600">{t.countrySelect.subtitle}</p>
      </div>

      <div className="space-y-3">
        <Combobox
          id="country-select-combobox"
          options={options}
          value={selected?.country_code ?? ""}
          disabled={locked}
          placeholder={t.countrySelect.placeholder}
          searchPlaceholder={t.countrySelect.searchPlaceholder}
          emptyText={t.countrySelect.emptyText}
          onValueChange={(code) => {
            const matched = countries.find(
              (c) => c.country_code.toUpperCase() === code.toUpperCase(),
            );
            if (matched) {
              onSelectCountry(matched);
            }
          }}
          className="h-14 border-2 border-slate-300 text-base shadow-xs"
        />
      </div>

      {selected ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-blue-700 bg-blue-50 px-4 py-4 shadow-xs">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Globe className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {t.countrySelect.selectedLabel}
              </p>
              <p className="truncate text-lg font-bold text-slate-900">
                {getLocalizedCountryName(
                  selected.country_code,
                  selected.country,
                  language,
                )}
              </p>
              <p className="truncate text-sm text-slate-600">
                {getLocalizedRegionName(selected.region, language)} •{" "}
                {t.countrySelect.visitVisaLabel}
              </p>
            </div>
          </div>
          <CheckCircle2
            className="h-6 w-6 shrink-0 text-blue-700"
            aria-hidden="true"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          {t.countrySelect.availableHint}
        </div>
      )}
    </div>
  );
}
