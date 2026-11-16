import { ERROR_MESSAGES } from "./error-messages";
import {
  AdminStats,
  AdminUser,
  AdminUserSummary,
  BlockedPhoneItem,
  Company,
  CompanyWithCounts,
  CountrySummary,
  FormAnswers,
  IntakeLinkItem,
  LinkResolution,
  OtpSendResponse,
  OtpStats,
  OtpStatsPeriod,
  OtpVerifyResponse,
  PaginatedOtpLogs,
  PaginatedSubmissions,
  ProfessionKey,
  SubmissionDetail,
  SubmissionStatus,
  SubmitSuccessPayload,
  SuperAdminStats,
  UploadedDocumentEntry,
  VisitForm,
} from "./types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

function getBaseUrlForPath(path: string): string {
  const isProxied =
    path.startsWith("/auth/") ||
    path.startsWith("/admin/") ||
    path.startsWith("/super-admin/") ||
    path.startsWith("/company/") ||
    path.startsWith("/public/") ||
    path.startsWith("/submissions/") ||
    path.startsWith("/applications/");

  if (
    isProxied &&
    typeof window !== "undefined" &&
    /^https?:\/\//i.test(API_BASE_URL)
  ) {
    try {
      const apiHostname = new URL(API_BASE_URL).hostname;
      if (apiHostname !== window.location.hostname) {
        return "/api";
      }
    } catch {
      // Keep API_BASE_URL fallback
    }
  }
  return API_BASE_URL;
}

export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function fallbackMessageForStatus(status: number, isUpload = false): string {
  if (status === 401) return ERROR_MESSAGES.sessionExpired;
  if (status === 403) return "Access denied or account suspended.";
  if (status === 404) return ERROR_MESSAGES.formNotFound;
  if (status === 429) return ERROR_MESSAGES.loginTooManyTries;
  if (isUpload) return ERROR_MESSAGES.uploadFailed;
  return ERROR_MESSAGES.serverError;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { isUpload?: boolean } = {},
): Promise<T> {
  const isFormData = init.body instanceof FormData;
  const headers = new Headers(init.headers);
  if (!isFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${getBaseUrlForPath(path)}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiRequestError(
      0,
      options.isUpload ? ERROR_MESSAGES.uploadFailed : ERROR_MESSAGES.serverError,
    );
  }

  if (!response.ok) {
    let parsedMessage = fallbackMessageForStatus(response.status, options.isUpload);
    let parsedFieldErrors: Record<string, string> = {};

    try {
      const json = (await response.json()) as {
        message?: unknown;
        fieldErrors?: unknown;
      };
      if (typeof json.message === "string" && json.message.trim()) {
        parsedMessage = json.message;
      }
      if (
        typeof json.fieldErrors === "object" &&
        json.fieldErrors !== null &&
        !Array.isArray(json.fieldErrors)
      ) {
        const cleanErrors: Record<string, string> = {};
        for (const [k, v] of Object.entries(json.fieldErrors)) {
          if (typeof v === "string") {
            cleanErrors[k] = v;
          }
        }
        parsedFieldErrors = cleanErrors;
      }
    } catch {
      // Keep friendly status fallback
    }

    throw new ApiRequestError(response.status, parsedMessage, parsedFieldErrors);
  }

  return (await response.json()) as T;
}

export const api = {
  fetchCountries(): Promise<CountrySummary[]> {
    return request<CountrySummary[]>("/forms/countries");
  },

  fetchVisitForm(countryCode: string): Promise<VisitForm> {
    return request<VisitForm>(`/forms/${encodeURIComponent(countryCode)}`);
  },

  fetchPublicCompany(slug: string): Promise<Company> {
    return request<Company>(`/public/companies/${encodeURIComponent(slug)}`);
  },

  resolveIntakeLink(token: string): Promise<LinkResolution> {
    return request<LinkResolution>(`/links/${encodeURIComponent(token)}`);
  },

  sendOtp(phone: string): Promise<OtpSendResponse> {
    return request<OtpSendResponse>("/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  },

  verifyOtp(phone: string, code: string): Promise<OtpVerifyResponse> {
    return request<OtpVerifyResponse>("/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
  },

  submitApplication(payload: {
    countryCode: string;
    profession: ProfessionKey;
    answers: FormAnswers;
    companySlug?: string;
    intakeToken?: string;
    otpToken: string;
    files: Record<string, UploadedDocumentEntry>;
  }): Promise<SubmitSuccessPayload> {
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        countryCode: payload.countryCode,
        profession: payload.profession,
        answers: payload.answers,
        otpToken: payload.otpToken,
        ...(payload.companySlug ? { companySlug: payload.companySlug } : {}),
        ...(payload.intakeToken ? { intakeToken: payload.intakeToken } : {}),
      }),
    );

    for (const [docKey, entry] of Object.entries(payload.files)) {
      formData.append(`documents[${docKey}]`, entry.file, entry.file.name);
    }

    return request<SubmitSuccessPayload>(
      "/submissions",
      {
        method: "POST",
        headers: {
          "x-otp-token": payload.otpToken,
        },
        body: formData,
      },
      { isUpload: true },
    );
  },

  getPublicPdfUrl(downloadToken: string): string {
    return `${getBaseUrlForPath("/submissions/")}/submissions/by-token/${encodeURIComponent(downloadToken)}/pdf`;
  },

  loginAdmin(email: string, password: string): Promise<{ user: AdminUser; admin: AdminUser }> {
    return request<{ user: AdminUser; admin: AdminUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logoutAdmin(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>("/auth/logout", {
      method: "POST",
    });
  },

  fetchAdminMe(): Promise<{ user: AdminUser; admin: AdminUser }> {
    return request<{ user: AdminUser; admin: AdminUser }>("/auth/me");
  },

  changeAdminPassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // -------------------------------------------------------------
  // SUPER ADMIN ENDPOINTS
  // -------------------------------------------------------------
  fetchSuperAdminStats(): Promise<SuperAdminStats> {
    return request<SuperAdminStats>("/super-admin/stats");
  },

  fetchCompanies(): Promise<{ items: CompanyWithCounts[] }> {
    return request<{ items: CompanyWithCounts[] }>("/super-admin/companies");
  },

  createCompany(payload: {
    name: string;
    slug: string;
    prefix: string;
    logoUrl?: string | null;
    phone?: string | null;
    address?: string | null;
    adminEmail: string;
    adminPassword: string;
    adminName: string;
  }): Promise<{ company: Company; user: AdminUser }> {
    return request<{ company: Company; user: AdminUser }>("/super-admin/companies", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  toggleCompanyStatus(
    id: string,
    isActive: boolean,
  ): Promise<Company> {
    return request<Company>(`/super-admin/companies/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  fetchCompanyDetail(id: string): Promise<CompanyWithCounts> {
    return request<CompanyWithCounts>(`/super-admin/companies/${encodeURIComponent(id)}`);
  },

  provisionCompanyUser(
    companyId: string,
    payload: { email: string; password: string; name: string },
  ): Promise<AdminUser> {
    return request<AdminUser>(`/super-admin/companies/${encodeURIComponent(companyId)}/users`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // -------------------------------------------------------------
  // TENANT COMPANY ENDPOINTS
  // -------------------------------------------------------------
  fetchCompanyProfile(): Promise<CompanyWithCounts> {
    return request<CompanyWithCounts>("/company/profile");
  },

  updateCompanyProfile(payload: {
    phone?: string | null;
    address?: string | null;
    logoUrl?: string | null;
  }): Promise<Company> {
    return request<Company>("/company/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  fetchCompanyStats(): Promise<AdminStats> {
    return request<AdminStats>("/company/stats");
  },

  fetchCompanyLinks(): Promise<{ items: IntakeLinkItem[] }> {
    return request<{ items: IntakeLinkItem[] }>("/company/links");
  },

  createCompanyLink(payload: {
    countryCode?: string | null;
    profession?: string | null;
    expiresInDays?: number | null;
  }): Promise<IntakeLinkItem> {
    return request<IntakeLinkItem>("/company/links", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteCompanyLink(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/company/links/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  // -------------------------------------------------------------
  // AGENCY STAFF MANAGEMENT (EXCLUSIVELY AGENCY ADMIN)
  // -------------------------------------------------------------
  fetchCompanyStaff(): Promise<{ items: AdminUserSummary[] }> {
    return request<{ items: AdminUserSummary[] }>("/company/staff");
  },

  createCompanyStaff(payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<AdminUserSummary> {
    return request<AdminUserSummary>("/company/staff", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteCompanyStaff(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/company/staff/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  // -------------------------------------------------------------
  // SHARED SUBMISSIONS ENDPOINTS
  // -------------------------------------------------------------
  fetchAdminStats(): Promise<AdminStats> {
    return request<AdminStats>("/admin/stats");
  },

  fetchAdminSubmissions(params: {
    companyId?: string;
    search?: string;
    country?: string;
    profession?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedSubmissions> {
    const qs = new URLSearchParams();
    if (params.companyId) qs.set("companyId", params.companyId);
    if (params.search) qs.set("search", params.search);
    if (params.country) qs.set("country", params.country);
    if (params.profession) qs.set("profession", params.profession);
    if (params.status) qs.set("status", params.status);
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));

    const query = qs.toString();
    return request<PaginatedSubmissions>(
      `/admin/submissions${query ? `?${query}` : ""}`,
    );
  },

  fetchAdminSubmissionDetail(id: string): Promise<SubmissionDetail> {
    return request<SubmissionDetail>(`/admin/submissions/${encodeURIComponent(id)}`);
  },

  updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
  ): Promise<{ id: string; status: SubmissionStatus; updatedAt: string }> {
    return request<{ id: string; status: SubmissionStatus; updatedAt: string }>(
      `/admin/submissions/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
    );
  },

  deleteSubmission(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/admin/submissions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  getAdminPdfUrl(id: string): string {
    return `${getBaseUrlForPath("/admin/")}/admin/submissions/${encodeURIComponent(id)}/pdf`;
  },

  getAdminZipUrl(id: string): string {
    return `${getBaseUrlForPath("/admin/")}/admin/submissions/${encodeURIComponent(id)}/archive.zip`;
  },

  getAdminDocumentUrl(id: string, docId: string, inline = false): string {
    return `${getBaseUrlForPath("/admin/")}/admin/submissions/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}${inline ? "?inline=1" : ""}`;
  },

  fetchAdminLinks(): Promise<{ items: IntakeLinkItem[] }> {
    return request<{ items: IntakeLinkItem[] }>("/admin/links");
  },

  createAdminLink(payload: {
    companyId?: string | null;
    countryCode?: string | null;
    profession?: string | null;
    expiresInDays?: number | null;
  }): Promise<IntakeLinkItem> {
    return request<IntakeLinkItem>("/admin/links", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteAdminLink(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/admin/links/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  fetchAdminOtpStats(params?: {
    period?: OtpStatsPeriod;
    month?: string;
  }): Promise<OtpStats> {
    const qs = new URLSearchParams();
    if (params?.period) qs.set("period", params.period);
    if (params?.month) qs.set("month", params.month);
    const queryStr = qs.toString() ? `?${qs.toString()}` : "";
    return request<OtpStats>(`/admin/otp-stats${queryStr}`);
  },

  fetchAdminOtpLogs(params: {
    phone?: string;
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedOtpLogs> {
    const qs = new URLSearchParams();
    if (params.phone) qs.set("phone", params.phone);
    if (params.status) qs.set("status", params.status);
    if (params.date) qs.set("date", params.date);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));

    const query = qs.toString();
    return request<PaginatedOtpLogs>(
      `/admin/otp-logs${query ? `?${query}` : ""}`,
    );
  },

  fetchAdminBlockedPhones(): Promise<{ items: BlockedPhoneItem[] }> {
    return request<{ items: BlockedPhoneItem[] }>("/admin/blocked-phones");
  },

  blockPhone(phone: string, reason?: string | null): Promise<BlockedPhoneItem> {
    return request<BlockedPhoneItem>("/admin/blocked-phones", {
      method: "POST",
      body: JSON.stringify({ phone, reason: reason || null }),
    });
  },

  unblockPhone(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(
      `/admin/blocked-phones/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
  },
};
