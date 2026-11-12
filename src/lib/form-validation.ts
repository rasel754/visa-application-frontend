import { validateFieldWithRules } from "./bd-validation";
import { ERROR_MESSAGES } from "./error-messages";
import {
  FormAnswers,
  FormDocument,
  FormField,
  TableRowValue,
  UploadedDocumentEntry,
} from "./types";

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

  return validateFieldWithRules(field, rawValue, allAnswers).error;
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
  allFields: FormField[],
  allDocuments: FormDocument[],
  answers: FormAnswers,
  files: Record<string, UploadedDocumentEntry>,
): Record<string, string> {
  return {
    ...validateSectionFields(allFields, answers),
    ...validateDocumentsMap(allDocuments, files),
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
