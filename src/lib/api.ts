import { ERROR_MESSAGES } from "./error-messages";
import {
  AdminStats,
  AdminUser,
  CategoryForm,
  CountrySummary,
  FormAnswers,
  IntakeLinkItem,
  LinkResolution,
  PaginatedSubmissions,
  SubmissionDetail,
  SubmissionStatus,
  SubmitSuccessPayload,
  UploadedDocumentEntry,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

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
    response = await fetch(`${API_BASE_URL}${path}`, {
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

  fetchCategoryForm(countryCode: string, category: string): Promise<CategoryForm> {
    return request<CategoryForm>(
      `/forms/${encodeURIComponent(countryCode)}/${encodeURIComponent(category)}`,
    );
  },

  resolveIntakeLink(token: string): Promise<LinkResolution> {
    return request<LinkResolution>(`/links/${encodeURIComponent(token)}`);
  },

  submitApplication(payload: {
    countryCode: string;
    category: string;
    answers: FormAnswers;
    intakeToken?: string;
    files: Record<string, UploadedDocumentEntry>;
  }): Promise<SubmitSuccessPayload> {
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        countryCode: payload.countryCode,
        category: payload.category,
        answers: payload.answers,
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
        body: formData,
      },
      { isUpload: true },
    );
  },

  getPublicPdfUrl(downloadToken: string): string {
    return `${API_BASE_URL}/submissions/by-token/${encodeURIComponent(downloadToken)}/pdf`;
  },

  loginAdmin(email: string, password: string): Promise<{ admin: AdminUser }> {
    return request<{ admin: AdminUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logoutAdmin(): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>("/auth/logout", {
      method: "POST",
    });
  },

  fetchAdminMe(): Promise<{ admin: AdminUser }> {
    return request<{ admin: AdminUser }>("/auth/me");
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

  fetchAdminStats(): Promise<AdminStats> {
    return request<AdminStats>("/admin/stats");
  },

  fetchAdminSubmissions(params: {
    search?: string;
    country?: string;
    category?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedSubmissions> {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.country) qs.set("country", params.country);
    if (params.category) qs.set("category", params.category);
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
    return `${API_BASE_URL}/admin/submissions/${encodeURIComponent(id)}/pdf`;
  },

  getAdminZipUrl(id: string): string {
    return `${API_BASE_URL}/admin/submissions/${encodeURIComponent(id)}/archive.zip`;
  },

  getAdminDocumentUrl(id: string, docId: string, inline = false): string {
    return `${API_BASE_URL}/admin/submissions/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}${inline ? "?inline=1" : ""}`;
  },

  fetchAdminLinks(): Promise<{ items: IntakeLinkItem[] }> {
    return request<{ items: IntakeLinkItem[] }>("/admin/links");
  },

  createAdminLink(payload: {
    countryCode?: string | null;
    category?: string | null;
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
};

