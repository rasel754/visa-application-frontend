export type FieldType =
  | "text"
  | "date"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "textarea"
  | "table";

export type ProfessionKey = "student" | "businessman" | "employee";
export type ProfessionEnum = "STUDENT" | "BUSINESSMAN" | "EMPLOYEE";

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

export interface GroupedFormDocument extends FormDocument {
  group: "common" | ProfessionKey;
}

export interface ApplicantProfileData {
  label: string;
  description: string;
  profile_information_fields: FormField[];
  additional_documents: FormDocument[];
}

export interface CountrySummary {
  country: string;
  country_code: string;
  region: string;
}

export interface VisitForm {
  country: string;
  country_code: string;
  region: string;
  official_authority: string;
  official_application_system: string;
  visa_type: "visit";
  official_visa_name: string;
  official_form: string;
  source_url: string;
  last_verified_at: string;
  common_information_fields: FormField[];
  common_required_documents: FormDocument[];
  applicant_profiles: Record<ProfessionKey, ApplicantProfileData>;
}

export interface SectionGroup {
  section: string;
  group: "common" | ProfessionKey;
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

export type OtpStatus = "SENT" | "VERIFIED" | "EXPIRED" | "FAILED" | "USED";

export interface SubmissionDocumentMeta {
  id: string;
  documentKey: string;
  group: string;
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
  visaType: string;
  profession: ProfessionEnum | null;
  officialVisaName: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string | null;
  status: SubmissionStatus;
  otpVerified: boolean;
  otpVerifiedPhone: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    documents: number;
  };
}

export interface SubmissionDetailSection {
  section: string;
  fields: FormField[];
}

export interface SubmissionDetail {
  id: string;
  reference: string;
  countryCode: string;
  countryName: string;
  visaType: string;
  profession: ProfessionEnum | null;
  professionLabel: string;
  officialVisaName: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string | null;
  answers: FormAnswers;
  status: SubmissionStatus;
  otpVerified: boolean;
  otpVerifiedPhone: string | null;
  createdAt: string;
  updatedAt: string;
  documents: SubmissionDocumentMeta[];
  commonSections: SubmissionDetailSection[];
  professionSections: SubmissionDetailSection[];
  sections: SubmissionDetailSection[];
  commonDocuments: FormDocument[];
  additionalDocuments: FormDocument[];
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
  profession: ProfessionEnum | null;
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
  submissionReference: string | null;
}

export interface LinkResolution {
  valid: boolean;
  country_code: string | null;
  profession: ProfessionKey | null;
}

export interface OtpSendResponse {
  sent: boolean;
  expiresInSeconds: number;
  devOtp?: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  otpToken: string;
}

export interface OtpStats {
  sentToday: number;
  verifiedToday: number;
  expiredToday: number;
  failedToday: number;
  successRate: number;
}

export interface OtpLogItem {
  id: string;
  phone: string;
  status: OtpStatus;
  gatewayRef: string | null;
  attempts: number;
  expiresAt: string;
  verifiedAt: string | null;
  usedAt: string | null;
  createdAt: string;
  submissionId: string | null;
  submissionReference: string | null;
  isBlocked: boolean;
}

export interface PaginatedOtpLogs {
  items: OtpLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlockedPhoneItem {
  id: string;
  phone: string;
  reason: string | null;
  createdAt: string;
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
