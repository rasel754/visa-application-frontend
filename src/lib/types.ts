export type FieldType =
  | "text"
  | "date"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "textarea"
  | "table";

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  section: string;
}

export interface FormDocument {
  key: string;
  label: string;
  required: boolean;
  upload?: boolean;
  note?: string;
}

export interface CountrySummary {
  country: string;
  country_code: string;
  region: string;
  categories: string[];
}

export interface CategoryForm {
  country: string;
  country_code: string;
  official_visa_name: string;
  official_form: string;
  official_authority: string;
  fields: FormField[];
  documents: FormDocument[];
}

export interface SectionGroup {
  section: string;
  fields: FormField[];
}

export type TableRowValue = Record<string, string>;
export type AnswerValue = string | number | TableRowValue[];
export type FormAnswers = Record<string, AnswerValue>;

export interface UploadedDocumentEntry {
  file: File;
  previewUrl?: string;
}

export type SubmissionStatus =
  | "NEW"
  | "CHECKED"
  | "PROCESSING"
  | "COMPLETED"
  | "REJECTED";

export interface SubmissionDocumentMeta {
  id: string;
  documentKey: string;
  label: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface SubmissionSummary {
  id: string;
  reference: string;
  countryCode: string;
  countryName: string;
  category: string;
  officialVisaName: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string | null;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  _count: {
    documents: number;
  };
}

export interface SubmissionDetail {
  id: string;
  reference: string;
  countryCode: string;
  countryName: string;
  category: string;
  officialVisaName: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string | null;
  answers: FormAnswers;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  documents: SubmissionDocumentMeta[];
  sections: SectionGroup[];
  requiredDocuments: FormDocument[];
}

export interface PaginatedSubmissions {
  items: SubmissionSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface AdminStats {
  total: number;
  today: number;
  byStatus: Record<SubmissionStatus, number>;
}

export interface IntakeLinkItem {
  id: string;
  token: string;
  countryCode: string | null;
  countryName: string | null;
  category: string | null;
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
  submissionReference: string | null;
}

export interface LinkResolution {
  valid: boolean;
  country_code: string | null;
  category: string | null;
}

export interface SubmitSuccessPayload {
  reference: string;
  downloadToken: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  fieldErrors: Record<string, string>;
}

