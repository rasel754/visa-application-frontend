"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => api.fetchCountries(),
    staleTime: 1000 * 60 * 30,
  });
}

