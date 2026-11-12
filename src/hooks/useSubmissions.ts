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
  profession?: string;
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
      profession?: string | null;
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

export function useAdminOtpStats() {
  return useQuery({
    queryKey: ["admin-otp-stats"],
    queryFn: () => api.fetchAdminOtpStats(),
    refetchOnMount: "always",
  });
}

export function useAdminOtpLogs(params: {
  phone?: string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin-otp-logs", params],
    queryFn: () => api.fetchAdminOtpLogs(params),
    refetchOnMount: "always",
  });
}

export function useBlockedPhones() {
  return useQuery({
    queryKey: ["admin-blocked-phones"],
    queryFn: () => api.fetchAdminBlockedPhones(),
    refetchOnMount: "always",
  });
}

export function useBlockPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { phone: string; reason?: string | null }) =>
      api.blockPhone(payload.phone, payload.reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-blocked-phones"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-otp-logs"] });
    },
  });
}

export function useUnblockPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.unblockPhone(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-blocked-phones"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-otp-logs"] });
    },
  });
}
