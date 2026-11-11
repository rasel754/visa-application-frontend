import { z } from "zod";
import { ERROR_MESSAGES } from "./error-messages";
import {
  CategoryForm,
  FormAnswers,
  FormDocument,
  FormField,
  TableRowValue,
  UploadedDocumentEntry,
} from "./types";

const emailCheck = z.string().email();
const PHONE_ALLOWED_REGEX = /^[0-9+\-\s()]{7,25}$/;
const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const FUTURE_DATE_KEYS = new Set([
  "intended_arrival_date",
  "intended_departure_date",
  "course_start_date",
  "course_end_date",
  "passport_expiry_date",
]);

const PAST_OR_TODAY_DATE_KEYS = new Set([
  "date_of_birth",
  "passport_issue_date",
  "employment_start_date",
]);

function getTodayYmd(): string {
  const now = new Date();
  const dhaka = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return dhaka.toISOString().slice(0, 10);
}

function isValidYmdDate(value: string): boolean {
  if (!YMD_REGEX.test(value)) return false;
  const parts = value.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (!year || !month || !day) return false;
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  );
}

export function isTableRowNonEmpty(row: TableRowValue): boolean {
  return Object.values(row).some((val) => val.trim().length > 0);
}

export function validateFieldValue(
  field: FormField,
  rawValue: unknown,
  allAnswers: FormAnswers,
): string | null {
  if (field.type === "table") {
    const rows = Array.isArray(rawValue)
      ? (rawValue as TableRowValue[]).filter(isTableRowNonEmpty)
      : [];
    if (field.required && rows.length === 0) {
      return ERROR_MESSAGES.requiredField(field.label);
    }
    return null;
  }

  if (field.type === "number") {
    const str =
      typeof rawValue === "number"
        ? String(rawValue)
        : typeof rawValue === "string"
          ? rawValue.trim()
          : "";
    if (!str) {
      return field.required ? ERROR_MESSAGES.requiredField(field.label) : null;
    }
    const num = Number(str);
    if (!Number.isFinite(num) || num < 0) {
      return "Please write a valid number.";
    }
    return null;
  }

  const str = typeof rawValue === "string" ? rawValue.trim() : "";
  if (!str) {
    return field.required ? ERROR_MESSAGES.requiredField(field.label) : null;
  }

  if (field.type === "email" && !emailCheck.safeParse(str).success) {
    return ERROR_MESSAGES.wrongEmail;
  }

  if (field.type === "tel") {
    const digits = str.replace(/\D/g, "");
    if (!PHONE_ALLOWED_REGEX.test(str) || digits.length < 7 || digits.length > 16) {
      return ERROR_MESSAGES.wrongPhone;
    }
  }

  if (field.type === "date") {
    if (!isValidYmdDate(str)) {
      return "Please choose a valid date.";
    }
    const todayYmd = getTodayYmd();
    if (FUTURE_DATE_KEYS.has(field.key) && str < todayYmd) {
      return ERROR_MESSAGES.pastDate;
    }
    if (PAST_OR_TODAY_DATE_KEYS.has(field.key) && str > todayYmd) {
      return "Please choose a date on or before today.";
    }

    const arrival =
      typeof allAnswers["intended_arrival_date"] === "string"
        ? allAnswers["intended_arrival_date"].trim()
        : "";
    const departure =
      typeof allAnswers["intended_departure_date"] === "string"
        ? allAnswers["intended_departure_date"].trim()
        : "";
    const courseStart =
      typeof allAnswers["course_start_date"] === "string"
        ? allAnswers["course_start_date"].trim()
        : "";

    if (field.key === "passport_expiry_date") {
      if (
        (isValidYmdDate(arrival) && str < arrival) ||
        (isValidYmdDate(departure) && str < departure)
      ) {
        return ERROR_MESSAGES.passportBeforeTravel;
      }
    }

    if (
      field.key === "intended_departure_date" &&
      isValidYmdDate(arrival) &&
      str < arrival
    ) {
      return "Departure date cannot be before your arrival date.";
    }

    if (
      field.key === "course_end_date" &&
      isValidYmdDate(courseStart) &&
      str < courseStart
    ) {
      return "Course end date cannot be before the start date.";
    }
  }

  return null;
}

export function validateSectionFields(
  fields: FormField[],
  allAnswers: FormAnswers,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const err = validateFieldValue(field, allAnswers[field.key], allAnswers);
    if (err) {
      errors[field.key] = err;
    }
  }
  return errors;
}

export function validateDocumentsMap(
  requiredDocs: FormDocument[],
  files: Record<string, UploadedDocumentEntry>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const doc of requiredDocs) {
    if (doc.required && !files[doc.key]) {
      errors[doc.key] = ERROR_MESSAGES.requiredFile(doc.label);
    }
  }
  return errors;
}

export function validateFullApplication(
  form: CategoryForm,
  answers: FormAnswers,
  files: Record<string, UploadedDocumentEntry>,
): Record<string, string> {
  return {
    ...validateSectionFields(form.fields, answers),
    ...validateDocumentsMap(form.documents, files),
  };
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTS = [".pdf", ".jpg", ".jpeg", ".png"];
const ALLOWED_UPLOAD_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

export function validateClientPickedFile(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return ERROR_MESSAGES.fileTooBig;
  }
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_UPLOAD_EXTS.some((ext) => lowerName.endsWith(ext));
  const hasValidMime =
    file.type === "" || ALLOWED_UPLOAD_MIMES.has(file.type.toLowerCase());

  if (!hasValidExt || !hasValidMime) {
    return ERROR_MESSAGES.wrongFileType;
  }
  return null;
}

