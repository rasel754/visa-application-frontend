import { ComboboxOption } from "@/components/ui/combobox";
import { FormField } from "@/lib/types";

export interface RestCountryItem {
  country: string;
  country_code: string;
  nationality: string;
  region: string;
  flag?: string;
}

const API_KEY = "rc_live_6636216ea6c0490c934783464a0ee214";
const DIRECT_API = "https://api.restcountries.com/countries/v5";

interface RawApiCountry {
  names?: { common?: string; official?: string };
  codes?: { alpha_2?: string; alpha_3?: string };
  demonyms?: { eng?: { f?: string; m?: string } };
  region?: string;
  flag?: string;
}

let clientCountriesCache: RestCountryItem[] | null = null;

export async function fetchRestCountries(query?: string): Promise<RestCountryItem[]> {
  const q = query?.trim() ?? "";

  // 1. Try our internal server route handler first (which bypasses CORS and caches)
  try {
    const url = q ? `/api/countries?q=${encodeURIComponent(q)}` : "/api/countries";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.countries) && data.countries.length > 0) {
        if (!q && !clientCountriesCache) {
          clientCountriesCache = data.countries;
        }
        return data.countries;
      }
    }
  } catch (err) {
    console.warn("Internal countries API failed, falling back to direct:", err);
  }

  // 2. Fallback: direct fetch from RestCountries API (as demonstrated by user)
  try {
    const directUrl = q
      ? `${DIRECT_API}?q=${encodeURIComponent(q)}&limit=100`
      : `${DIRECT_API}?limit=100`;

    const res = await fetch(directUrl, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const rawList = data?.data?.objects || [];
      const mapped: RestCountryItem[] = rawList
        .map((obj: RawApiCountry) => ({
          country: obj.names?.common || obj.names?.official || "",
          country_code: (obj.codes?.alpha_2 || obj.codes?.alpha_3 || "").toUpperCase(),
          nationality: obj.demonyms?.eng?.m || obj.demonyms?.eng?.f || obj.names?.common || "",
          region: obj.region || "Other",
          flag: obj.flag || "",
        }))
        .filter((c: RestCountryItem) => Boolean(c.country))
        .sort((a: RestCountryItem, b: RestCountryItem) =>
          a.country.localeCompare(b.country, "en", { sensitivity: "base" }),
        );

      return mapped;
    }
  } catch (err) {
    console.warn("Direct restcountries fetch failed:", err);
  }

  // 3. In-memory cached fallback if available
  if (clientCountriesCache) {
    if (!q) return clientCountriesCache;
    const lowerQ = q.toLowerCase();
    return clientCountriesCache.filter(
      (c) =>
        c.country.toLowerCase().includes(lowerQ) ||
        c.nationality.toLowerCase().includes(lowerQ) ||
        c.country_code.toLowerCase().includes(lowerQ),
    );
  }

  return [];
}

/**
 * Returns options for country selection sorted in ascending order (A to Z)
 */
export function buildCountryComboboxOptions(
  countries: RestCountryItem[],
  useCodeAsValue = false,
): ComboboxOption[] {
  return [...countries]
    .sort((a, b) =>
      a.country.localeCompare(b.country, "en", { sensitivity: "base" }),
    )
    .map((c) => ({
      value: useCodeAsValue ? c.country_code : c.country,
      label: c.country,
      hint: c.region,
      keywords: [c.country, c.country_code, c.nationality, c.region],
    }));
}

/**
 * Returns options for nationality selection sorted in ascending order (A to Z)
 */
export function buildNationalityComboboxOptions(
  countries: RestCountryItem[],
): ComboboxOption[] {
  const seen = new Set<string>();
  const options: ComboboxOption[] = [];

  for (const c of countries) {
    const nat = c.nationality || c.country;
    if (!nat || seen.has(nat.toLowerCase())) continue;
    seen.add(nat.toLowerCase());

    options.push({
      value: nat,
      label: nat === c.country ? nat : `${nat} (${c.country})`,
      hint: c.country !== nat ? c.country : undefined,
      keywords: [nat, c.country, c.country_code],
    });
  }

  // Sort ascending by label
  return options.sort((a, b) =>
    a.label.localeCompare(b.label, "en", { sensitivity: "base" }),
  );
}

/**
 * Detects if a field is for Country or Nationality selection
 */
export function isCountryOrNationalityField(
  field: FormField,
): "country" | "nationality" | null {
  const key = field.key.toLowerCase();
  const label = field.label.toLowerCase();

  // Exclude freeform text areas like past travel notes
  if (field.type === "textarea" || key === "countries_visited_last_5_years") {
    return null;
  }

  // Specific country fields
  if (
    key === "country_of_birth" ||
    key === "residing_country" ||
    key.endsWith("_country") ||
    key.startsWith("country_") ||
    label === "country" ||
    label === "country of birth"
  ) {
    return "country";
  }

  // Specific nationality fields
  if (
    key.endsWith("_nationality") ||
    key === "current_nationality" ||
    key === "nationality_at_birth" ||
    key === "other_nationalities" ||
    key.includes("nationality") ||
    label.includes("nationality")
  ) {
    return "nationality";
  }

  return null;
}
