import { FormField } from "@/lib/types";
import { ExtractedDocumentData, FieldExtractionMeta, OCRConfidence } from "./types";

export interface MappedFormFields {
  answers: Record<string, string>;
  fieldMeta: Record<string, FieldExtractionMeta>;
}

// Canonical alias dictionary for mapping extracted OCR keys to form field keys
const CANONICAL_FIELD_ALIASES: Record<string, string[]> = {
  surname: ["surname", "family_name", "last_name", "applicant_surname"],
  given_names: ["given_names", "first_name", "forenames", "applicant_given_names"],
  full_name: ["applicant_name", "full_name", "name_as_in_passport", "name"],
  passport_number: ["passport_number", "passport_no", "travel_document_number", "doc_number"],
  passport_expiry_date: [
    "passport_expiry_date",
    "passport_date_of_expiry",
    "expiry_date",
    "document_expiry_date",
  ],
  passport_type: ["passport_type", "travel_document_type", "type_of_passport"],
  date_of_birth: ["date_of_birth", "dob", "birth_date"],
  gender: ["sex", "gender"],
  nid_number: ["national_id_number", "nid_number", "nid", "national_identity_number"],
  nationality: ["current_nationality", "nationality", "citizenship"],
  country_of_birth: ["country_of_birth", "birth_country"],
  present_address: ["present_address", "home_address", "residential_address", "current_address"],
  permanent_address: ["permanent_address", "permanent_residence_address"],
};

/**
 * Maps extracted document OCR data to actual form field keys present in the active visa form
 */
export function mapExtractedDataToForm(
  extracted: ExtractedDocumentData,
  availableFields: FormField[],
): MappedFormFields {
  const availableKeys = new Set(availableFields.map((f) => f.key));
  const answers: Record<string, string> = {};
  const fieldMeta: Record<string, FieldExtractionMeta> = {};

  const setMappedField = (
    canonicalKey: string,
    value: string | undefined,
    confidence: OCRConfidence,
  ) => {
    if (!value || typeof value !== "string" || !value.trim()) return;

    const aliases = CANONICAL_FIELD_ALIASES[canonicalKey] || [canonicalKey];

    // Find first matching key present in the destination country's official fields
    const matchedKey = aliases.find((alias) => availableKeys.has(alias));

    if (matchedKey) {
      answers[matchedKey] = value.trim();
      fieldMeta[matchedKey] = {
        source: "ocr",
        confidence,
      };
    } else {
      // Fallback: If canonical key directly exists in available fields, set it
      if (availableKeys.has(canonicalKey)) {
        answers[canonicalKey] = value.trim();
        fieldMeta[canonicalKey] = {
          source: "ocr",
          confidence,
        };
      }
    }
  };

  const baseConfidence = extracted.confidence;

  // 1. Names
  if (extracted.surname) {
    setMappedField("surname", extracted.surname, baseConfidence);
  }
  if (extracted.given_names) {
    setMappedField("given_names", extracted.given_names, baseConfidence);
  }
  if (extracted.full_name) {
    setMappedField("full_name", extracted.full_name, baseConfidence);
  }

  // 2. Passport Details
  if (extracted.passport_number) {
    setMappedField("passport_number", extracted.passport_number, baseConfidence);
  }
  if (extracted.passport_expiry_date) {
    setMappedField("passport_expiry_date", extracted.passport_expiry_date, baseConfidence);
  }
  if (extracted.passport_type) {
    setMappedField("passport_type", extracted.passport_type, baseConfidence);
  }

  // 3. National ID
  if (extracted.nid_number) {
    setMappedField("nid_number", extracted.nid_number, baseConfidence);
  }

  // 4. Demographics
  if (extracted.date_of_birth) {
    setMappedField("date_of_birth", extracted.date_of_birth, baseConfidence);
  }
  if (extracted.gender) {
    setMappedField("gender", extracted.gender, baseConfidence);
  }
  if (extracted.nationality) {
    setMappedField("nationality", extracted.nationality, baseConfidence);
    if (availableKeys.has("nationality_at_birth")) {
      answers["nationality_at_birth"] = extracted.nationality;
      fieldMeta["nationality_at_birth"] = { source: "ocr", confidence: baseConfidence };
    }
  }
  if (extracted.country_of_birth) {
    setMappedField("country_of_birth", extracted.country_of_birth, baseConfidence);
  }

  // 5. Addresses (Transliterated Bengali address is marked as low confidence for user verification)
  if (extracted.present_address) {
    setMappedField("present_address", extracted.present_address, "low");
  }
  if (extracted.permanent_address) {
    setMappedField("permanent_address", extracted.permanent_address, "low");
  }

  return { answers, fieldMeta };
}
