"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRestCountries, RestCountryItem } from "@/lib/rest-countries";
import { CountrySummary } from "@/lib/types";

export function useCountries() {
  return useQuery<CountrySummary[]>({
    queryKey: ["countries-rest"],
    queryFn: async () => {
      const rest = await fetchRestCountries();
      // Map to CountrySummary and guarantee ascending sort by country name
      return rest
        .map((c) => ({
          country: c.country,
          country_code: c.country_code || c.country.slice(0, 3).toUpperCase(),
          region: c.region,
        }))
        .sort((a, b) =>
          a.country.localeCompare(b.country, "en", { sensitivity: "base" }),
        );
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useRestCountries(searchQuery?: string) {
  return useQuery<RestCountryItem[]>({
    queryKey: ["rest-countries", searchQuery ?? ""],
    queryFn: () => fetchRestCountries(searchQuery),
    staleTime: 1000 * 60 * 60,
  });
}
