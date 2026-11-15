export type DocumentScanMode = "passport" | "nid";

export type OCRConfidence = "high" | "low";

export interface FieldExtractionMeta {
  source: "ocr" | "manual";
  confidence: OCRConfidence;
}

export interface ExtractedDocumentData {
  documentType: DocumentScanMode;
  confidence: OCRConfidence;
  surname?: string;
  given_names?: string;
  full_name?: string;
  passport_number?: string;
  nid_number?: string;
  date_of_birth?: string; // YYYY-MM-DD
  gender?: "Male" | "Female";
  passport_expiry_date?: string; // YYYY-MM-DD
  nationality?: string;
  country_of_birth?: string;
  passport_type?: string;
  present_address?: string;
  permanent_address?: string;
  rawDetails?: Record<string, string>;
  warnings?: string[];
}

export type OCRStage =
  | "idle"
  | "preprocessing"
  | "loading"
  | "recognizing"
  | "parsing"
  | "done"
  | "error";

export interface OCRProgress {
  status: string;
  progress: number; // 0 to 1
  percentage: number; // 0 to 100
  stage: OCRStage;
  message: string;
}

export interface PreprocessedImageResult {
  cleanFile: File;
  previewUrl: string;
  fullCanvas: HTMLCanvasElement;
  mrzCropCanvas?: HTMLCanvasElement;
}
