"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCategoryForm(
  countryCode: string | null | undefined,
  category: string | null | undefined,
) {
  return useQuery({
    queryKey: ["category-form", countryCode, category],
    queryFn: () => api.fetchCategoryForm(countryCode!, category!),
    enabled: Boolean(countryCode && category),
    staleTime: 1000 * 60 * 30,
  });
}

export function useCountryCategoryPreviews(
  countryCode: string | null | undefined,
  categories: string[],
) {
  return useQueries({
    queries: categories.map((category) => ({
      queryKey: ["category-form", countryCode, category],
      queryFn: () => api.fetchCategoryForm(countryCode!, category),
      enabled: Boolean(countryCode && category),
      staleTime: 1000 * 60 * 30,
    })),
  });
}

