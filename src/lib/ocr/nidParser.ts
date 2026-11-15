import { createWorker } from "tesseract.js";
import { transliterateBengaliAddress } from "./bdAddressTransliterator";
import { ExtractedDocumentData, OCRProgress } from "./types";

const MONTH_NAME_MAP: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

/**
 * Normalizes NID date of birth strings (e.g. "15 Aug 1998", "15-08-1998", "15/08/1998") to "YYYY-MM-DD"
 */
export function normalizeNidDateOfBirth(raw: string): string | undefined {
  if (!raw) return undefined;

  // 1. "15 Aug 1998" or "15-Aug-1998" or "15 August 1998"
  const mmmMatch = raw.match(/(\b\d{1,2})[\s\-]+([A-Za-z]{3,9})[\s,.\-]+(\d{4})\b/);
  if (mmmMatch) {
    const day = mmmMatch[1]!.padStart(2, "0");
    const monKey = mmmMatch[2]!.toLowerCase().slice(0, 3);
    const year = mmmMatch[3]!;
    const mon = MONTH_NAME_MAP[monKey];
    if (mon && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) {
      return `${year}-${mon}-${day}`;
    }
  }

  // 2. "15/08/1998" or "15-08-1998" or "15.08.1998" (DD/MM/YYYY)
  const numMatch = raw.match(/(\b\d{1,2})[\/\-. ]+(\d{1,2})[\/\-. ]+(\d{4})\b/);
  if (numMatch) {
    const day = numMatch[1]!.padStart(2, "0");
    const mon = numMatch[2]!.padStart(2, "0");
    const year = numMatch[3]!;
    const dNum = parseInt(day, 10);
    const mNum = parseInt(mon, 10);
    if (dNum >= 1 && dNum <= 31 && mNum >= 1 && mNum <= 12) {
      return `${year}-${mon}-${day}`;
    }
  }

  return undefined;
}

/**
 * Parses Bangladeshi National ID Front Image (and optional Back Image)
 */
export async function parseNidImages(
  frontCanvas: HTMLCanvasElement,
  backCanvas?: HTMLCanvasElement,
  onProgress?: (progress: OCRProgress) => void,
): Promise<ExtractedDocumentData> {
  onProgress?.({
    status: "Initializing NID OCR Engine...",
    progress: 0.05,
    percentage: 5,
    stage: "loading",
    message: "Loading English OCR model for NID front...",
  });

  // 1. Process Front Image (English)
  const frontWorker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        const prog = 0.1 + (m.progress || 0) * (backCanvas ? 0.4 : 0.8);
        onProgress?.({
          status: "Reading NID Front Side...",
          progress: prog,
          percentage: Math.round(prog * 100),
          stage: "recognizing",
          message: `Scanning NID front details: ${Math.round((m.progress || 0) * 100)}%`,
        });
      }
    },
  });

  let frontText = "";
  try {
    const res = await frontWorker.recognize(frontCanvas);
    frontText = res.data.text;
  } finally {
    await frontWorker.terminate();
  }

  // Extract NID Number (10-digit Smart NID, 13-digit, or 17-digit Old NID)
  // Check with spaces collapsed as well
  let nidNumber: string | undefined;
  const nidRegex = /(\b\d{10}\b|\b\d{13}\b|\b\d{17}\b)/;
  const directMatch = frontText.match(nidRegex);
  if (directMatch) {
    nidNumber = directMatch[1];
  } else {
    // Try matching spaced NID like "123 456 7890" or "1990 1234 5678 90123"
    const spacedMatch = frontText.match(/\b\d{3,4}\s+\d{3,4}\s+\d{3,4}(?:\s+\d{3,4})?\b/);
    if (spacedMatch) {
      const collapsed = spacedMatch[0].replace(/\s+/g, "");
      if (collapsed.length === 10 || collapsed.length === 13 || collapsed.length === 17) {
        nidNumber = collapsed;
      }
    }
  }

  // Extract English Name: line following "Name:" or "Name :"
  let fullName: string | undefined;
  let surname: string | undefined;
  let givenNames: string | undefined;

  const lines = frontText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    // Match "Name:" or "Name :" but ignore Bengali "নাম:"
    const nameMatch = line.match(/\bName\s*[:.\-]?\s*([A-Za-z\s.]+)/i);
    if (nameMatch && nameMatch[1]?.trim()) {
      fullName = nameMatch[1].replace(/[^A-Za-z\s.]/g, "").replace(/\s+/g, " ").trim();
      break;
    } else if (line.toUpperCase() === "NAME" || line.toUpperCase() === "NAME:") {
      // Check next line
      const nextLine = lines[i + 1];
      if (nextLine && /^[A-Za-z\s.]+$/.test(nextLine)) {
        fullName = nextLine.replace(/\s+/g, " ").trim();
        break;
      }
    }
  }

  if (fullName) {
    fullName = fullName.toUpperCase();
    const parts = fullName.split(" ").filter(Boolean);
    if (parts.length > 1) {
      surname = parts[parts.length - 1];
      givenNames = parts.slice(0, parts.length - 1).join(" ");
    } else {
      givenNames = fullName;
    }
  }

  // Extract Date of Birth
  let dateOfBirth: string | undefined;
  for (const line of lines) {
    if (/date\s*of\s*birth|dob|birth/i.test(line) || /\b\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\b/.test(line)) {
      const parsedDob = normalizeNidDateOfBirth(line);
      if (parsedDob) {
        dateOfBirth = parsedDob;
        break;
      }
    }
  }

  // Fallback scan for any DD MMM YYYY anywhere in front text
  if (!dateOfBirth) {
    dateOfBirth = normalizeNidDateOfBirth(frontText);
  }

  // 2. Process Optional Back Image (Bengali + English for Address)
  let presentAddress: string | undefined;
  let permanentAddress: string | undefined;
  let backWarnings: string[] | undefined;

  if (backCanvas) {
    onProgress?.({
      status: "Reading NID Back Side (Address)...",
      progress: 0.55,
      percentage: 55,
      stage: "loading",
      message: "Loading Bengali OCR model for NID address...",
    });

    const backWorker = await createWorker("ben+eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const prog = 0.6 + (m.progress || 0) * 0.35;
          onProgress?.({
            status: "Transliterating Address...",
            progress: prog,
            percentage: Math.round(prog * 100),
            stage: "recognizing",
            message: `Reading back side address: ${Math.round((m.progress || 0) * 100)}%`,
          });
        }
      },
    });

    try {
      const backRes = await backWorker.recognize(backCanvas);
      const backText = backRes.data.text;

      // Extract address block after "ঠিকানা:" or "ঠিকানা"
      const transliterated = transliterateBengaliAddress(backText);
      if (transliterated && transliterated.length > 5) {
        presentAddress = transliterated;
        permanentAddress = transliterated;
        backWarnings = ["Address transliterated from Bengali NID back. Please verify spelling."];
      }
    } catch {
      backWarnings = ["Could not read address from back image. Please enter address manually."];
    } finally {
      await backWorker.terminate();
    }
  }

  const confidence = nidNumber && (fullName || dateOfBirth) ? "high" : "low";

  onProgress?.({
    status: "NID Extraction Complete!",
    progress: 1,
    percentage: 100,
    stage: "done",
    message: "NID scanned successfully!",
  });

  return {
    documentType: "nid",
    confidence,
    nid_number: nidNumber,
    full_name: fullName,
    surname,
    given_names: givenNames,
    date_of_birth: dateOfBirth,
    nationality: "Bangladesh",
    country_of_birth: "Bangladesh",
    present_address: presentAddress,
    permanent_address: permanentAddress,
    warnings: backWarnings,
  };
}
