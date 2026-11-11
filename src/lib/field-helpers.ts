import { FormField, SectionGroup } from "./types";

export function groupFieldsBySection(fields: FormField[]): SectionGroup[] {
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
    fields: sectionFields,
  }));
}

const SELECT_OPTIONS_MAP: Record<string, string[]> = {
  sex: ["Male", "Female", "Other"],
  marital_status: ["Single", "Married", "Divorced", "Widowed"],
  number_of_entries: ["Single", "Two", "Multiple"],
  cost_covered_by: ["Myself (self)", "Sponsor", "Employer", "Inviting company"],
  means_of_support: ["Myself (self)", "Sponsor", "Employer", "Inviting company"],
  course_level: ["Diploma", "Bachelor", "Master", "PhD", "Language Course", "Other"],
  travel_document_type: [
    "Ordinary Passport",
    "Diplomatic Passport",
    "Official Passport",
    "Other",
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

  if (key.includes("passport_number")) {
    return "Example: A01234567";
  }
  if (key === "surname" || key === "given_names" || key === "surname_at_birth") {
    return "Write your full name as in your passport";
  }
  if (key === "phone") {
    return "Example: 01XXXXXXXXX";
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
  if (key === "home_address") {
    return "Write your full home address (house, road, area, district)";
  }
  if (key.includes("address")) {
    return "Write your full home address (house, road, area, district)";
  }
  if (
    key.includes("bank") ||
    key.includes("account") ||
    key === "national_id_number" ||
    key === "sponsor_reference"
  ) {
    return "Write the number shown on your document";
  }
  if (
    key.includes("institution_name") ||
    key.includes("employer") ||
    key.includes("company_name") ||
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

  if (field.type === "date") {
    if (key === "date_of_birth") {
      return "Must match the date of birth written on your passport.";
    }
    if (key === "passport_expiry_date") {
      return "Tap and choose the date. Your passport must be valid past your travel date.";
    }
    return "Tap and choose the date.";
  }

  if (key === "surname" || key === "given_names") {
    return "Copy the exact English spelling from your passport.";
  }
  if (key === "national_id_number") {
    return "Write your 10, 13, or 17 digit NID number.";
  }
  if (key === "phone") {
    return "Our office will call you on this number.";
  }
  if (key === "email") {
    return "We write this email on your visa form.";
  }
  if (key === "education_history") {
    return "Add your schools, colleges, or universities (SSC, HSC, Bachelor, etc.).";
  }
  if (key === "work_experience_history") {
    return "Add your previous or current jobs, one row for each job.";
  }
  if (key === "financial_guarantor") {
    return "Example: Md. Karim (Father, Business) — or write Self if paying yourself.";
  }
  if (key === "guarantor_address_phone") {
    return "Write the sponsor's full address and mobile number.";
  }
  if (key === "tuition_fee_amount" || key === "salary_destination" || key === "monthly_income") {
    return "Include the money amount and currency (example: 15,000 MYR or 50,000 BDT).";
  }
  if (key === "duration_of_stay_days") {
    return "Write the total number of days (example: 14 or 365).";
  }

  return null;
}

export interface CategoryDisplayInfo {
  title: string;
  description: string;
  bangla: string;
}

export function getCategoryDisplayInfo(categoryKey: string): CategoryDisplayInfo {
  const normalized = categoryKey.toLowerCase();
  if (normalized === "student") {
    return {
      title: "Student Visa",
      description: "For study in another country",
      bangla: "বিদেশে পড়াশোনার জন্য",
    };
  }
  if (normalized === "business") {
    return {
      title: "Business Visa",
      description: "For business meetings and work visits",
      bangla: "ব্যবসায়িক মিটিং বা সফরের জন্য",
    };
  }
  if (normalized === "employee") {
    return {
      title: "Employee / Work Visa",
      description: "For a job in another country",
      bangla: "বিদেশে চাকরির জন্য",
    };
  }

  const titleCase =
    categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).toLowerCase();
  return {
    title: `${titleCase} Visa`,
    description: `For ${categoryKey.toLowerCase()} travel`,
    bangla: "ভিসা আবেদন",
  };
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
    english: "Write your parents' names and spouse name (if married).",
    bangla: "আপনার বাবা-মায়ের নাম এবং বিবাহিত হলে স্বামী/স্ত্রীর নাম লিখুন।",
  },
  Passport: {
    english: "Open your passport and copy the numbers and dates carefully.",
    bangla: "আপনার পাসপোর্ট দেখে নম্বর ও তারিখ সঠিকভাবে লিখুন।",
  },
  Contact: {
    english: "Give your home address, email, and an active mobile number.",
    bangla: "আপনার বর্তমান ঠিকানা, ইমেইল এবং চালু মোবাইল নম্বর দিন।",
  },
  Travel: {
    english: "Tell us when you plan to travel and where you will stay.",
    bangla: "কবে যাবেন, কতদিন থাকবেন এবং কোথায় থাকবেন তা লিখুন।",
  },
  "Travel History": {
    english: "Share past visas or fingerprints if you have them (optional).",
    bangla: "আগে কোনো ভিসা বা ফিঙ্গারপ্রিন্ট দেওয়া থাকলে লিখুন (ঐচ্ছিক)।",
  },
  Financial: {
    english: "Tell us who will pay for your travel and stay.",
    bangla: "আপনার ভ্রমণ ও থাকার খরচ কে বহন করবে তা জানান।",
  },
  "Current Status": {
    english: "Tell us about your current study, job, or business in Bangladesh.",
    bangla: "বাংলাদেশে আপনার বর্তমান পড়াশোনা, চাকরি বা ব্যবসার তথ্য দিন।",
  },
  "Education Background": {
    english: "Add your past education details.",
    bangla: "আপনার পূর্বের পড়াশোনার তথ্য যোগ করুন।",
  },
  "Study Plan": {
    english: "Write the university and course details from your offer letter.",
    bangla: "অফার লেটার দেখে বিশ্ববিদ্যালয় ও কোর্সের তথ্য লিখুন।",
  },
  Invitation: {
    english: "Write details about the company inviting you and your meeting plan.",
    bangla: "যে কোম্পানি আপনাকে আমন্ত্রণ জানিয়েছে তার তথ্য ও কাজের বিবরণ দিন।",
  },
  "Work Background": {
    english: "Add your past jobs and work skills.",
    bangla: "আপনার আগের কাজের অভিজ্ঞতা ও যোগ্যতার তথ্য দিন।",
  },
  "Employment in Destination": {
    english: "Write your new employer, job title, and salary details.",
    bangla: "বিদেশের নিয়োগকর্তা, পদবি ও বেতনের তথ্য লিখুন।",
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

