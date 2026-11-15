declare module "mrz" {
  export interface ParsedMRZRange {
    line: number;
    start: number;
    end: number;
    raw?: string;
  }

  export interface ParsedMRZFieldDetail {
    label: string;
    field: string;
    value: string | null;
    valid: boolean;
    ranges: ParsedMRZRange[];
    line: number;
    start: number;
    end: number;
    error?: string;
  }

  export interface ParsedMRZFields {
    documentCode?: string | null;
    issuingState?: string | null;
    lastName?: string | null;
    firstName?: string | null;
    documentNumber?: string | null;
    documentNumberCheckDigit?: string | null;
    nationality?: string | null;
    birthDate?: string | null;
    birthDateCheckDigit?: string | null;
    sex?: "male" | "female" | "unspecified" | string | null;
    expirationDate?: string | null;
    expirationDateCheckDigit?: string | null;
    personalNumber?: string | null;
    personalNumberCheckDigit?: string | null;
    compositeCheckDigit?: string | null;
    [key: string]: unknown;
  }

  export interface ParsedMRZ {
    format: string;
    valid: boolean;
    fields: ParsedMRZFields;
    details: ParsedMRZFieldDetail[];
  }

  export function parse(lines: string[] | string): ParsedMRZ;
}
