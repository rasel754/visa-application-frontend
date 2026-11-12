"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useVisitForm(countryCode: string | null | undefined) {
  return useQuery({
    queryKey: ["visit-form", countryCode],
    queryFn: () => api.fetchVisitForm(countryCode!),
    enabled: Boolean(countryCode),
    staleTime: 1000 * 60 * 30,
  });
}

