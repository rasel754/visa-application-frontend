import { NextRequest, NextResponse } from "next/server";

const RESTCOUNTRIES_API = "https://api.restcountries.com/countries/v5";
const API_KEY = "rc_live_6636216ea6c0490c934783464a0ee214";

interface RawCountryObject {
  names?: {
    common?: string;
    official?: string;
  };
  codes?: {
    alpha_2?: string;
    alpha_3?: string;
  };
  demonyms?: {
    eng?: {
      f?: string;
      m?: string;
    };
  };
  region?: string;
  flag?: string;
}

export interface RestCountryItem {
  country: string;
  country_code: string;
  nationality: string;
  region: string;
  flag?: string;
}

function mapRawObject(obj: RawCountryObject): RestCountryItem {
  const country = obj.names?.common || obj.names?.official || "";
  const country_code = (obj.codes?.alpha_2 || obj.codes?.alpha_3 || "").toUpperCase();
  const nationality =
    obj.demonyms?.eng?.m ||
    obj.demonyms?.eng?.f ||
    country;
  const region = obj.region || "Other";
  const flag = obj.flag || "";

  return {
    country,
    country_code,
    nationality,
    region,
    flag,
  };
}

let memoryCache: RestCountryItem[] | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchAllFromRestCountries(): Promise<RestCountryItem[]> {
  const now = Date.now();
  if (memoryCache && now - cacheTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  const offsets = [0, 100, 200];
  const promises = offsets.map((offset) =>
    fetch(`${RESTCOUNTRIES_API}?limit=100&offset=${offset}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "force-cache",
    }).then((r) => (r.ok ? r.json() : null)),
  );

  const results = await Promise.all(promises);
  const items: RestCountryItem[] = [];
  const seenCodes = new Set<string>();

  for (const res of results) {
    const rawList: RawCountryObject[] = res?.data?.objects ?? [];
    for (const raw of rawList) {
      const mapped = mapRawObject(raw);
      if (mapped.country && (!mapped.country_code || !seenCodes.has(mapped.country_code))) {
        if (mapped.country_code) seenCodes.add(mapped.country_code);
        items.push(mapped);
      }
    }
  }

  // Ensure ascending order
  items.sort((a, b) =>
    a.country.localeCompare(b.country, "en", { sensitivity: "base" }),
  );

  if (items.length > 0) {
    memoryCache = items;
    cacheTime = now;
  }

  return items;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (q) {
      // Query specific country search using RestCountries API as requested
      const response = await fetch(
        `${RESTCOUNTRIES_API}?q=${encodeURIComponent(q)}&limit=100`,
        {
          headers: { Authorization: `Bearer ${API_KEY}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const rawObjects: RawCountryObject[] = data?.data?.objects ?? [];
        const mapped = rawObjects
          .map(mapRawObject)
          .filter((c) => c.country)
          .sort((a, b) =>
            a.country.localeCompare(b.country, "en", { sensitivity: "base" }),
          );

        return NextResponse.json({ countries: mapped });
      }

      // If search endpoint returned non-200, fallback to filtering all cached countries
      const all = await fetchAllFromRestCountries();
      const lowerQ = q.toLowerCase();
      const filtered = all
        .filter(
          (c) =>
            c.country.toLowerCase().includes(lowerQ) ||
            c.country_code.toLowerCase().includes(lowerQ) ||
            c.nationality.toLowerCase().includes(lowerQ),
        )
        .sort((a, b) =>
          a.country.localeCompare(b.country, "en", { sensitivity: "base" }),
        );
      return NextResponse.json({ countries: filtered });
    }

    // Return full list of countries in ascending order
    const all = await fetchAllFromRestCountries();
    return NextResponse.json({ countries: all });
  } catch (error) {
    console.error("Error fetching restcountries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries", countries: [] },
      { status: 500 },
    );
  }
}
