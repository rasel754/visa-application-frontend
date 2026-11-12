import { format } from "date-fns";
import { parseYmdToLocalDate } from "@/components/ui/date-picker";
import { FormLanguage } from "@/store/language-store";
import { isBdMobileKey, isTuitionKey } from "./bd-validation";
import {
  BANGLA_MONTHS,
  COUNTRY_NAMES_BN,
  DOCUMENT_TRANSLATIONS_BN,
  FIELD_TRANSLATIONS_BN,
  PROFESSION_DESCRIPTIONS_BN,
  PROFESSION_LABELS_BN,
  REGION_NAMES_BN,
  SECTION_INTROS_BN,
  SECTION_NAMES_BN,
  SELECT_OPTION_LABELS_BN,
  VISA_NAMES_BN,
  localizeOfficialForm,
  toBanglaDigits,
} from "./i18n/bangla-data";
import {
  FormDocument,
  FormField,
  ProfessionEnum,
  ProfessionKey,
  SectionGroup,
} from "./types";

export function groupFieldsBySection(
  fields: FormField[],
  group: "common" | ProfessionKey = "common",
): SectionGroup[] {
  const groups = new Map<string, FormField[]>();
  for (const field of fields) {
    const existing = groups.get(field.section);
    if (existing) {
      existing.push(field);
    } else {
      groups.set(field.section, [field]);
    }
  }
  return Array.from(groups.entries()).map(([section, sectionFields]) => ({
    section,
    group,
    fields: sectionFields,
  }));
}

export function formatDateYmdDisplay(
  ymd: string,
  language: FormLanguage = "en",
): string {
  const parsed = parseYmdToLocalDate(ymd);
  if (!parsed) return ymd;
  if (language === "bn") {
    const day = toBanglaDigits(String(parsed.getDate()).padStart(2, "0"));
    const month = BANGLA_MONTHS[parsed.getMonth()] ?? "";
    const year = toBanglaDigits(parsed.getFullYear());
    return `${day} ${month} ${year}`;
  }
  return format(parsed, "dd MMM yyyy");
}

const SELECT_OPTIONS_MAP: Record<string, string[]> = {
  sex: ["Male", "Female", "Other"],
  marital_status: ["Single", "Married", "Divorced", "Widowed"],
  passport_type: ["Ordinary", "Official", "Diplomatic", "Other"],
  main_purpose_of_visit: ["Tourism", "Visiting family", "Visiting friends", "Other"],
  number_of_entries_requested: ["Single", "Double", "Multiple"],
  accommodation_type: [
    "Hotel",
    "Family or friend's home",
    "Rented apartment",
    "Other",
  ],
  has_invitation: ["Yes", "No"],
  who_pays_for_trip: ["Myself", "Family member", "Inviting person", "Employer"],
  means_of_support: [
    "Bank account",
    "Cash",
    "Credit / Debit cards",
    "Host provides",
    "Multiple / Combined",
  ],
  has_travel_insurance: ["Yes", "No"],
  fingerprints_collected_before: ["Yes", "No", "Unknown"],
  visa_refusal_any_country: ["Yes", "No"],
  overstay_or_deportation: ["Yes", "No"],
  trip_funded_by: ["Father", "Mother", "Self", "Other"],
  business_type: ["Proprietorship", "Partnership", "Limited Company"],
  position_in_business: [
    "Proprietor",
    "Partner",
    "Director",
    "Chairman",
    "Managing Director",
  ],
};

export function getSelectOptions(fieldKey: string): string[] | null {
  return SELECT_OPTIONS_MAP[fieldKey] ?? null;
}

export interface LocalizedSelectOption {
  value: string;
  label: string;
  keywords?: string[];
}

export function getLocalizedSelectOptions(
  fieldKey: string,
  language: FormLanguage = "en",
): LocalizedSelectOption[] | null {
  const options = SELECT_OPTIONS_MAP[fieldKey];
  if (!options) return null;
  const bnMap = SELECT_OPTION_LABELS_BN[fieldKey];
  return options.map((opt) => {
    const bnLabel = bnMap?.[opt];
    return {
      value: opt,
      label: language === "bn" && bnLabel ? bnLabel : opt,
      keywords: bnLabel ? [opt, bnLabel] : [opt],
    };
  });
}

export function getLocalizedSelectOptionLabel(
  fieldKey: string,
  rawValue: string,
  language: FormLanguage = "en",
): string {
  if (!rawValue || language !== "bn") return rawValue;
  return SELECT_OPTION_LABELS_BN[fieldKey]?.[rawValue] ?? rawValue;
}

export interface TableColumnSpec {
  key: string;
  label: string;
  placeholder: string;
}

export function getTableColumns(
  fieldKey: string,
  language: FormLanguage = "en",
): TableColumnSpec[] {
  if (fieldKey === "education_history") {
    if (language === "bn") {
      return [
        {
          key: "institution",
          label: "শিক্ষা প্রতিষ্ঠানের নাম",
          placeholder: "স্কুল, কলেজ বা বিশ্ববিদ্যালয়ের নাম লিখুন",
        },
        {
          key: "years",
          label: "সময়কাল (সাল থেকে সাল)",
          placeholder: "উদাহরণ: 2018-2022",
        },
        {
          key: "qualification",
          label: "যোগ্যতা / ডিগ্রি",
          placeholder: "উদাহরণ: SSC / HSC / Bachelor",
        },
        {
          key: "major",
          label: "বিষয় / বিভাগ",
          placeholder: "উদাহরণ: Science / Business",
        },
      ];
    }
    return [
      {
        key: "institution",
        label: "Institution",
        placeholder: "Write the school or university name",
      },
      {
        key: "years",
        label: "Years From–To",
        placeholder: "Example: 2018-2022",
      },
      {
        key: "qualification",
        label: "Qualification",
        placeholder: "Example: SSC / HSC / Bachelor",
      },
      {
        key: "major",
        label: "Major",
        placeholder: "Example: Science / Business",
      },
    ];
  }

  if (fieldKey === "work_experience_history") {
    if (language === "bn") {
      return [
        {
          key: "employer",
          label: "প্রতিষ্ঠানের নাম",
          placeholder: "কোম্পানি বা প্রতিষ্ঠানের নাম লিখুন",
        },
        {
          key: "position",
          label: "পদবি",
          placeholder: "উদাহরণ: Sales Officer / Technician",
        },
        {
          key: "years",
          label: "সময়কাল (সাল থেকে সাল)",
          placeholder: "উদাহরণ: 2021-2025",
        },
      ];
    }
    return [
      {
        key: "employer",
        label: "Employer",
        placeholder: "Write the company name",
      },
      {
        key: "position",
        label: "Position",
        placeholder: "Example: Sales Officer / Technician",
      },
      {
        key: "years",
        label: "Years From–To",
        placeholder: "Example: 2021-2025",
      },
    ];
  }

  if (language === "bn") {
    return [
      { key: "col1", label: "নাম", placeholder: "এখানে লিখুন..." },
      { key: "col2", label: "বিস্তারিত", placeholder: "এখানে লিখুন..." },
    ];
  }

  return [
    { key: "col1", label: "Name", placeholder: "Write here..." },
    { key: "col2", label: "Details", placeholder: "Write here..." },
  ];
}

export function cleanSimpleLabel(label: string): string {
  return label
    .replace(/\s*—\s*repeating table\s*$/i, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getLocalizedFieldLabel(
  field: Pick<FormField, "key" | "label">,
  language: FormLanguage = "en",
): string {
  if (language === "bn") {
    return FIELD_TRANSLATIONS_BN[field.key]?.label ?? field.label;
  }
  return field.label;
}

export function getFieldPlaceholder(
  field: FormField,
  language: FormLanguage = "en",
): string {
  if (language === "bn") {
    const bn = FIELD_TRANSLATIONS_BN[field.key];
    if (bn?.placeholder) return bn.placeholder;
    const labelBn = getLocalizedFieldLabel(field, "bn");
    return `${labelBn} লিখুন`;
  }

  const key = field.key.toLowerCase();

  if (key === "passport_number") {
    return "Example: A01234567";
  }
  if (isBdMobileKey(key)) {
    return "01XXXXXXXXX";
  }
  if (isTuitionKey(key)) {
    return "Example: 150000";
  }
  if (key === "national_id_number") {
    return "Example: 1234567890 (10, 13 or 17 digits)";
  }
  if (key === "tin_number") {
    return "Example: 123456789012 (12 digits)";
  }
  if (key === "surname" || key === "given_names" || key === "surname_at_birth") {
    return "Write your full name as in your passport";
  }
  if (field.type === "tel") {
    return "Example: 01XXXXXXXXX or office phone";
  }
  if (field.type === "email" || key.includes("email")) {
    return "Example: yourname@gmail.com";
  }
  if (key === "date_of_birth") {
    return "Choose your date of birth";
  }
  if (field.type === "date") {
    return "Tap and choose the date";
  }
  if (key.includes("address")) {
    return "Write full address (house, road, area, district)";
  }
  if (
    key.includes("institution_name") ||
    key.includes("employer_name") ||
    key.includes("business_name") ||
    key === "fathers_name" ||
    key === "mothers_name" ||
    key === "spouse_name"
  ) {
    return "Write the full name";
  }
  if (field.type === "number") {
    return "Example: 14";
  }

  const lowerLabel = cleanSimpleLabel(field.label).toLowerCase();
  return `Write your ${lowerLabel}`;
}

export function getFieldHelpText(
  field: FormField,
  language: FormLanguage = "en",
): string | null {
  if (language === "bn") {
    const bn = FIELD_TRANSLATIONS_BN[field.key];
    if (bn?.helpText) return bn.helpText;
    if (field.type === "date") {
      return "ক্যালেন্ডার খুলতে ট্যাপ করুন এবং তারিখ নির্বাচন করুন।";
    }
    return null;
  }

  const key = field.key;

  if (key === "passport_number") {
    return "Write your 9-character passport number (letters and numbers, auto-CAPITALIZED).";
  }
  if (isBdMobileKey(key)) {
    return "Bangladesh mobile number only: +88 is fixed; type the 11 digits starting with 013–019.";
  }
  if (isTuitionKey(key)) {
    return "Numbers only (no comma or decimal), maximum 8 digits.";
  }
  if (key === "national_id_number") {
    return "Write your Bangladeshi NID number (digits only: 10, 13, or 17 digits).";
  }
  if (key === "tin_number") {
    return "Write your 12-digit Bangladeshi e-TIN number (digits only).";
  }
  if (field.type === "date") {
    if (key === "date_of_birth") {
      return "Must match your passport. Choose month and year from the dropdown.";
    }
    if (key === "passport_expiry_date") {
      return "Your passport must remain valid at least 6 months after your departure date.";
    }
    if (key === "passport_issue_date") {
      return "Must be before today and before your passport expiry date.";
    }
    if (key === "intended_arrival_date") {
      return "Choose today or a future travel date.";
    }
    if (key === "intended_departure_date") {
      return "Must be after your arrival date.";
    }
    return "Tap to open calendar and choose the date.";
  }

  if (key === "surname" || key === "given_names") {
    return "Copy the exact English spelling from your passport (auto-CAPITALIZED).";
  }
  if (key === "email" || key === "business_email") {
    return "Write your email address carefully (keeps normal lowercase).";
  }
  if (key === "duration_of_stay_days") {
    return "Write the total number of days (example: 14).";
  }
  if (key === "monthly_salary" || key === "estimated_trip_cost") {
    return "Write the amount in numbers.";
  }

  return null;
}

export function formatProfessionLabel(
  profession: ProfessionKey | ProfessionEnum | string | null | undefined,
  language: FormLanguage = "en",
): string {
  if (!profession) return language === "bn" ? "নির্ধারিত নয়" : "Legacy";
  const lower = profession.toLowerCase();
  if (lower === "student" || lower === "businessman" || lower === "employee") {
    if (language === "bn") {
      return PROFESSION_LABELS_BN[lower as ProfessionKey];
    }
    if (lower === "student") return "Student";
    if (lower === "businessman") return "Businessman";
    return "Employee";
  }
  return profession;
}

export function getLocalizedProfessionDescription(
  key: ProfessionKey,
  englishDescription: string,
  language: FormLanguage = "en",
): string {
  if (language === "bn") {
    return PROFESSION_DESCRIPTIONS_BN[key];
  }
  return englishDescription;
}

export function getProfessionBanglaDescription(key: ProfessionKey): string {
  if (key === "student") {
    return "শিক্ষার্থী — স্কুল, কলেজ বা বিশ্ববিদ্যালয়ে পড়াশোনা করছেন";
  }
  if (key === "businessman") {
    return "ব্যবসায়ী — নিজস্ব ব্যবসা বা প্রতিষ্ঠানের মালিক বা পরিচালক";
  }
  return "চাকরিজীবী — সরকারি বা বেসরকারি প্রতিষ্ঠানে কর্মরত";
}

export function getLocalizedCountryName(
  countryCode: string,
  englishName: string,
  language: FormLanguage = "en",
): string {
  if (language === "bn") {
    return COUNTRY_NAMES_BN[countryCode.toUpperCase()] ?? englishName;
  }
  return englishName;
}

export function getLocalizedRegionName(
  region: string,
  language: FormLanguage = "en",
): string {
  if (language === "bn") {
    return REGION_NAMES_BN[region] ?? region;
  }
  return region;
}

export function getLocalizedVisaName(
  visaName: string,
  language: FormLanguage = "en",
): string {
  if (language === "bn") {
    return VISA_NAMES_BN[visaName] ?? visaName;
  }
  return visaName;
}

export function getLocalizedOfficialForm(
  officialForm: string,
  language: FormLanguage = "en",
): string {
  if (language === "bn") {
    return localizeOfficialForm(officialForm);
  }
  return officialForm;
}

export function getLocalizedSectionName(
  sectionName: string,
  language: FormLanguage = "en",
): string {
  if (language === "bn") {
    return SECTION_NAMES_BN[sectionName] ?? sectionName;
  }
  return sectionName;
}

export function getLocalizedDocumentLabel(
  doc: Pick<FormDocument, "key" | "label">,
  language: FormLanguage = "en",
): string {
  if (language === "bn") {
    return DOCUMENT_TRANSLATIONS_BN[doc.key]?.label ?? doc.label;
  }
  return doc.label;
}

export function getLocalizedDocumentNote(
  doc: Pick<FormDocument, "key" | "note">,
  language: FormLanguage = "en",
): string | undefined {
  if (language === "bn") {
    return DOCUMENT_TRANSLATIONS_BN[doc.key]?.note ?? doc.note;
  }
  return doc.note;
}

export interface SectionIntro {
  english: string;
  bangla: string;
}

const SECTION_INTROS: Record<string, SectionIntro> = {
  "Personal Information": {
    english: "Write your basic details carefully as shown on your passport.",
    bangla: SECTION_INTROS_BN["Personal Information"],
  },
  "Family Information": {
    english: "Write your parents' names and spouse details (if married).",
    bangla: SECTION_INTROS_BN["Family Information"],
  },
  Passport: {
    english: "Open your passport and copy the numbers and dates carefully.",
    bangla: SECTION_INTROS_BN["Passport"],
  },
  Contact: {
    english: "Give your home address, email, and active Bangladeshi mobile number.",
    bangla: SECTION_INTROS_BN["Contact"],
  },
  "Travel Plan": {
    english: "Tell us when you plan to travel and where you will stay.",
    bangla: SECTION_INTROS_BN["Travel Plan"],
  },
  "Host / Invitation": {
    english: "Tell us if someone or an organisation is inviting you (optional if hotel stay).",
    bangla: SECTION_INTROS_BN["Host / Invitation"],
  },
  Financial: {
    english: "Tell us who will pay for your travel and stay.",
    bangla: SECTION_INTROS_BN["Financial"],
  },
  "Travel History": {
    english: "Share past travels, visas, or refusals honestly.",
    bangla: SECTION_INTROS_BN["Travel History"],
  },
  "Education (Student)": {
    english: "Write details about the school, college, or university you currently attend.",
    bangla: SECTION_INTROS_BN["Education (Student)"],
  },
  "Sponsor (Student)": {
    english: "Write details about the parent or person paying for your visit.",
    bangla: SECTION_INTROS_BN["Sponsor (Student)"],
  },
  "Business (Businessman)": {
    english: "Write your company, trade licence, and TIN details.",
    bangla: SECTION_INTROS_BN["Business (Businessman)"],
  },
  "Employment (Employee)": {
    english: "Write your employer, job title, salary, and approved leave dates.",
    bangla: SECTION_INTROS_BN["Employment (Employee)"],
  },
};

export function getSectionIntro(sectionName: string): SectionIntro {
  return (
    SECTION_INTROS[sectionName] ?? {
      english: "Please fill in the boxes below.",
      bangla: "নিচের ঘরগুলো সঠিকভাবে পূরণ করুন।",
    }
  );
}

export function getLocalizedSectionIntro(
  sectionName: string,
  language: FormLanguage = "en",
): string {
  const intro = getSectionIntro(sectionName);
  return language === "bn" ? intro.bangla : intro.english;
}
