import { format } from "date-fns";
import { parseYmdToLocalDate } from "@/components/ui/date-picker";
import { isBdMobileKey, isTuitionKey } from "./bd-validation";
import { FormField, ProfessionEnum, ProfessionKey, SectionGroup } from "./types";

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

export function formatDateYmdDisplay(ymd: string): string {
  const parsed = parseYmdToLocalDate(ymd);
  if (!parsed) return ymd;
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

export interface TableColumnSpec {
  key: string;
  label: string;
  placeholder: string;
}

export function getTableColumns(fieldKey: string): TableColumnSpec[] {
  if (fieldKey === "education_history") {
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

export function getFieldPlaceholder(field: FormField): string {
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

export function getFieldHelpText(field: FormField): string | null {
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
): string {
  if (!profession) return "Legacy";
  const lower = profession.toLowerCase();
  if (lower === "student") return "Student";
  if (lower === "businessman") return "Businessman";
  if (lower === "employee") return "Employee";
  return profession;
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

export interface SectionIntro {
  english: string;
  bangla: string;
}

const SECTION_INTROS: Record<string, SectionIntro> = {
  "Personal Information": {
    english: "Write your basic details carefully as shown on your passport.",
    bangla: "আপনার পাসপোর্ট অনুযায়ী ব্যক্তিগত তথ্য ইংরেজিতে লিখুন।",
  },
  "Family Information": {
    english: "Write your parents' names and spouse details (if married).",
    bangla: "আপনার বাবা-মায়ের নাম এবং বিবাহিত হলে স্বামী/স্ত্রীর তথ্য লিখুন।",
  },
  Passport: {
    english: "Open your passport and copy the numbers and dates carefully.",
    bangla: "আপনার পাসপোর্ট দেখে নম্বর ও তারিখ সঠিকভাবে লিখুন।",
  },
  Contact: {
    english: "Give your home address, email, and active Bangladeshi mobile number.",
    bangla: "আপনার বর্তমান ঠিকানা, ইমেইল এবং চালু বাংলাদেশি মোবাইল নম্বর দিন।",
  },
  "Travel Plan": {
    english: "Tell us when you plan to travel and where you will stay.",
    bangla: "কবে যাবেন, কবে ফিরবেন এবং কোথায় থাকবেন তা লিখুন।",
  },
  "Host / Invitation": {
    english: "Tell us if someone or an organisation is inviting you (optional if hotel stay).",
    bangla: "কেউ আমন্ত্রণ জানিয়ে থাকলে তার তথ্য দিন (না থাকলে খালি রাখতে পারেন)।",
  },
  Financial: {
    english: "Tell us who will pay for your travel and stay.",
    bangla: "আপনার ভ্রমণ ও থাকার খরচ কে বহন করবে তা জানান।",
  },
  "Travel History": {
    english: "Share past travels, visas, or refusals honestly.",
    bangla: "আগের ভ্রমণ ও ভিসার তথ্য সঠিকভাবে দিন।",
  },
  "Education (Student)": {
    english: "Write details about the school, college, or university you currently attend.",
    bangla: "আপনি বর্তমানে যে স্কুল, কলেজ বা বিশ্ববিদ্যালয়ে পড়ছেন তার তথ্য দিন।",
  },
  "Sponsor (Student)": {
    english: "Write details about the parent or person paying for your visit.",
    bangla: "আপনার ভ্রমণের খরচ যিনি বহন করছেন (যেমন বাবা/মা) তার তথ্য দিন।",
  },
  "Business (Businessman)": {
    english: "Write your company, trade licence, and TIN details.",
    bangla: "আপনার ব্যবসা প্রতিষ্ঠান, ট্রেড লাইসেন্স ও টিআইএন তথ্য লিখুন।",
  },
  "Employment (Employee)": {
    english: "Write your employer, job title, salary, and approved leave dates.",
    bangla: "আপনার অফিস, পদবি, বেতন এবং অনুমোদিত ছুটির তারিখ লিখুন।",
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
