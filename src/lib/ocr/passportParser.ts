import { createWorker } from "tesseract.js";
import { parse as parseMrz, ParsedMRZ } from "mrz";
import { ExtractedDocumentData, OCRProgress } from "./types";

/**
 * Normalizes MRZ 2-digit year to 4-digit year (YYYY-MM-DD).
 */
export function formatMrzDate(yymmdd: string, isExpiry = false): string | undefined {
  if (!yymmdd || yymmdd.length !== 6) return undefined;
  const yyStr = yymmdd.slice(0, 2);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);

  const yy = parseInt(yyStr, 10);
  if (isNaN(yy)) return undefined;

  const currentYear = new Date().getFullYear();
  const currentCenturyBase = Math.floor(currentYear / 100) * 100;
  const currentYY = currentYear % 100;

  let yyyy: number;
  if (isExpiry) {
    // Expiration dates are usually in future or recent past (last ~10 years)
    if (yy < 80) {
      yyyy = currentCenturyBase + yy;
    } else {
      yyyy = currentCenturyBase - 100 + yy;
    }
  } else {
    // Birth dates
    if (yy > currentYY) {
      yyyy = currentCenturyBase - 100 + yy;
    } else {
      yyyy = currentCenturyBase + yy;
    }
  }

  // Validate month and day
  const mNum = parseInt(mm, 10);
  const dNum = parseInt(dd, 10);
  if (mNum < 1 || mNum > 12 || dNum < 1 || dNum > 31) {
    return undefined;
  }

  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

/**
 * Clean OCR noise from potential MRZ lines
 */
function cleanMrzLine(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[«‹]/g, "<")
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9<]/g, "");
}

/**
 * Finds two TD3 MRZ lines from raw OCR text
 */
function extractTd3Lines(ocrText: string): [string, string] | null {
  const lines = ocrText
    .split(/\r?\n/)
    .map((l) => cleanMrzLine(l))
    .filter((l) => l.length >= 30); // candidate MRZ lines

  // TD3 Line 1 starts with 'P<' or 'P' followed by 3-letter country code (e.g. 'BGD')
  for (let i = 0; i < lines.length; i++) {
    const l1 = lines[i]!;
    if (l1.startsWith("P<") || (l1.startsWith("P") && l1.includes("<"))) {
      // Find following candidate for line 2
      for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
        const l2 = lines[j]!;
        // Line 2 should have digits (passport number, dates) and typically 'BGD'
        const hasDigits = /\d{5,}/.test(l2);
        if (hasDigits) {
          // Normalize both lines to exactly 44 characters for TD3
          const line1 = l1.slice(0, 44).padEnd(44, "<");
          const line2 = l2.slice(0, 44).padEnd(44, "<");
          return [line1, line2];
        }
      }
    }
  }

  return null;
}

/**
 * Client-Side Bangladeshi Passport Parser using Tesseract.js and MRZ parser
 */
export async function parsePassportImage(
  mrzCropCanvas: HTMLCanvasElement | undefined,
  fullCanvas: HTMLCanvasElement,
  onProgress?: (progress: OCRProgress) => void,
): Promise<ExtractedDocumentData> {
  onProgress?.({
    status: "Initializing OCR Engine...",
    progress: 0.05,
    percentage: 5,
    stage: "loading",
    message: "Loading client-side OCR engine...",
  });

  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        const prog = 0.1 + (m.progress || 0) * 0.75;
        onProgress?.({
          status: "Scanning Passport MRZ Zone...",
          progress: prog,
          percentage: Math.round(prog * 100),
          stage: "recognizing",
          message: `Reading passport bio-data: ${Math.round((m.progress || 0) * 100)}%`,
        });
      }
    },
  });

  try {
    let ocrText = "";

    // 1. Try bottom 30% MRZ crop canvas first
    if (mrzCropCanvas) {
      onProgress?.({
        status: "Scanning bottom MRZ zone...",
        progress: 0.15,
        percentage: 15,
        stage: "recognizing",
        message: "Scanning machine-readable zone...",
      });
      const res = await worker.recognize(mrzCropCanvas);
      ocrText = res.data.text;
    }

    let mrzLines = extractTd3Lines(ocrText);

    // 2. Fallback to full page OCR if crop didn't capture valid MRZ lines
    if (!mrzLines) {
      onProgress?.({
        status: "Scanning full page bio-data...",
        progress: 0.5,
        percentage: 50,
        stage: "recognizing",
        message: "Searching full passport page for MRZ lines...",
      });
      const fullRes = await worker.recognize(fullCanvas);
      ocrText = fullRes.data.text;
      mrzLines = extractTd3Lines(ocrText);
    }

    onProgress?.({
      status: "Parsing MRZ data...",
      progress: 0.9,
      percentage: 90,
      stage: "parsing",
      message: "Validating check-digits and extracting fields...",
    });

    if (!mrzLines) {
      // Best-effort regex fallback on raw text
      const passportNumMatch = ocrText.match(/\b([A-Z][0-9]{8}|[A-Z]{2}[0-9]{7})\b/);
      return {
        documentType: "passport",
        confidence: "low",
        passport_number: passportNumMatch?.[1],
        nationality: "Bangladesh",
        country_of_birth: "Bangladesh",
        passport_type: "Ordinary",
        warnings: [
          "Could not detect standard 2-line MRZ zone. Please verify scanned values manually.",
        ],
      };
    }

    // Parse MRZ lines with mrz package
    let parsed: ParsedMRZ;
    try {
      parsed = parseMrz(mrzLines);
    } catch {
      // In case mrz parse throws on malformed syntax
      return {
        documentType: "passport",
        confidence: "low",
        nationality: "Bangladesh",
        country_of_birth: "Bangladesh",
        passport_type: "Ordinary",
        warnings: [
          "MRZ syntax could not be fully verified. Please check all extracted fields.",
        ],
      };
    }

    const { fields, valid } = parsed;

    const surname = (fields.lastName || "").replace(/</g, " ").trim();
    const givenNames = (fields.firstName || "").replace(/</g, " ").trim();
    const fullName = [givenNames, surname].filter(Boolean).join(" ");

    const passportNumber = (fields.documentNumber || "").replace(/</g, "").trim();
    const dob = fields.birthDate ? formatMrzDate(fields.birthDate, false) : undefined;
    const expiry = fields.expirationDate
      ? formatMrzDate(fields.expirationDate, true)
      : undefined;

    let gender: "Male" | "Female" | undefined;
    if (fields.sex === "male" || fields.sex === "M") {
      gender = "Male";
    } else if (fields.sex === "female" || fields.sex === "F") {
      gender = "Female";
    }

    // Optional field often holds National ID number or personal number
    let nidNumber: string | undefined;
    if (fields.personalNumber) {
      const cleanPersonal = fields.personalNumber.replace(/</g, "").trim();
      if (/^\d{10}$|^\d{13}$|^\d{17}$/.test(cleanPersonal)) {
        nidNumber = cleanPersonal;
      }
    }

    onProgress?.({
      status: "Extraction Complete!",
      progress: 1,
      percentage: 100,
      stage: "done",
      message: valid ? "Passport MRZ verified successfully!" : "Passport extracted (low confidence check).",
    });

    return {
      documentType: "passport",
      confidence: valid ? "high" : "low",
      surname: surname || undefined,
      given_names: givenNames || undefined,
      full_name: fullName || undefined,
      passport_number: passportNumber || undefined,
      nid_number: nidNumber,
      date_of_birth: dob,
      gender,
      passport_expiry_date: expiry,
      nationality: "Bangladesh",
      country_of_birth: "Bangladesh",
      passport_type: "Ordinary",
      rawDetails: {
        mrzLine1: mrzLines[0],
        mrzLine2: mrzLines[1],
        mrzValid: String(valid),
      },
      warnings: valid
        ? undefined
        : ["Some check-digits did not match. Please verify the extracted values."],
    };
  } finally {
    await worker.terminate();
  }
}
