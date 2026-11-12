"use client";

import { CheckCircle2, Globe } from "lucide-react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { CountrySummary } from "@/lib/types";

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
  const options: ComboboxOption[] = countries.map((c) => ({
    value: c.country_code,
    label: c.country,
    hint: c.region,
    keywords: [c.country_code, c.region],
  }));

  const selected = countries.find(
    (c) =>
      selectedCountryCode &&
      c.country_code.toUpperCase() === selectedCountryCode.toUpperCase(),
  );

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">
          Which country do you want to visit?
        </h2>
        <p className="text-base text-slate-600">
          Tap the box below and type the country name to search and select.
        </p>
        <p className="text-sm font-medium text-blue-800">
          আপনি কোন দেশে ভ্রমণ করতে চান তা নিচের বক্সে লিখে খুঁজে বের করুন।
        </p>
      </div>

      <div className="space-y-3">
        <Combobox
          id="country-select-combobox"
          options={options}
          value={selected?.country_code ?? ""}
          disabled={locked}
          placeholder="Select your destination country"
          searchPlaceholder="Type country name (e.g. Malaysia, India, UAE)..."
          emptyText="No country found. Please check the spelling."
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
                Selected Destination
              </p>
              <p className="truncate text-lg font-bold text-slate-900">
                {selected.country}
              </p>
              <p className="truncate text-sm text-slate-600">
                {selected.region} • Visit / Tourist Visa
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
          100 countries available. Tap above and start typing the country name.
        </div>
      )}
    </div>
  );
}
