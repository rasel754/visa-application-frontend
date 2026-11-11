"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SubmissionStatus } from "@/lib/types";

export function useAdminMe() {
  return useQuery({
    queryKey: ["admin-me"],
    queryFn: () => api.fetchAdminMe(),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.fetchAdminStats(),
  });
}

export function useSubmissions(params: {
  search?: string;
  country?: string;
  category?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin-submissions", params],
    queryFn: () => api.fetchAdminSubmissions(params),
  });
}

export function useSubmissionDetail(id: string) {
  return useQuery({
    queryKey: ["admin-submission", id],
    queryFn: () => api.fetchAdminSubmissionDetail(id),
    enabled: Boolean(id),
  });
}

export function useUpdateSubmissionStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: SubmissionStatus) => api.updateSubmissionStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-submission", id] });
      void queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSubmission(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useAdminLinks() {
  return useQuery({
    queryKey: ["admin-links"],
    queryFn: () => api.fetchAdminLinks(),
  });
}

export function useCreateAdminLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      countryCode?: string | null;
      category?: string | null;
      expiresInDays?: number | null;
    }) => api.createAdminLink(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-links"] });
    },
  });
}

export function useDeleteAdminLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAdminLink(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-links"] });
    },
  });
}

