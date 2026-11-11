"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Globe, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.country_code.toLowerCase() === q,
    );
  }, [countries, search]);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">
          Which country do you want to go to?
        </h2>
        <p className="text-base text-slate-600">
          Tap a country from the list below.
        </p>
        <p className="text-sm font-medium text-blue-800">
          আপনি কোন দেশে যেতে চান তা নিচের তালিকা থেকে বেছে নিন।
        </p>
      </div>

      {!locked && (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type your country name"
            aria-label="Type your country name"
            className="h-12 border-slate-300 bg-white pl-11 text-base placeholder:text-slate-400"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-base font-medium text-slate-700">
            No country found for &ldquo;{search}&rdquo;.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Please check the spelling and type again.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((item) => {
            const isSelected =
              selectedCountryCode?.toUpperCase() ===
              item.country_code.toUpperCase();

            return (
              <button
                key={item.country_code}
                type="button"
                disabled={locked && !isSelected}
                onClick={() => onSelectCountry(item)}
                className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  isSelected
                    ? "border-blue-700 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                } ${locked && !isSelected ? "opacity-50" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Globe className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-900">
                      {item.country}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {item.region}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2
                    className="h-6 w-6 shrink-0 text-blue-700"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

