import { ProfessionKey } from "@/lib/types";

export const BANGLA_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)] ?? d);
}

export function normalizeBengaliDigits(value: string): string {
  return value.replace(/[\u09E6-\u09EF]/g, (ch) =>
    String(ch.charCodeAt(0) - 0x09e6),
  );
}

export const BANGLA_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
] as const;

export const COUNTRY_NAMES_BN: Record<string, string> = {
  IN: "ভারত",
  MY: "মালয়েশিয়া",
  SG: "সিঙ্গাপুর",
  TH: "থাইল্যান্ড",
  ID: "ইন্দোনেশিয়া",
  VN: "ভিয়েতনাম",
  PH: "ফিলিপাইন",
  NP: "নেপাল",
  LK: "শ্রীলঙ্কা",
  MV: "মালদ্বীপ",
  CN: "চীন",
  JP: "জাপান",
  KR: "দক্ষিণ কোরিয়া",
  SA: "সৌদি আরব",
  AE: "সংযুক্ত আরব আমিরাত",
  QA: "কাতার",
  OM: "ওমান",
  KW: "কুয়েত",
  BH: "বাহরাইন",
  TR: "তুরস্ক",
  EG: "মিশর",
  US: "যুক্তরাষ্ট্র",
  CA: "কানাডা",
  GB: "যুক্তরাজ্য",
  IE: "আয়ারল্যান্ড",
  AU: "অস্ট্রেলিয়া",
  NZ: "নিউজিল্যান্ড",
  DE: "জার্মানি",
  FR: "ফ্রান্স",
  IT: "ইতালি",
  ES: "স্পেন",
  PT: "পর্তুগাল",
  NL: "নেদারল্যান্ডস",
  SE: "সুইডেন",
  DK: "ডেনমার্ক",
  NO: "নরওয়ে",
  PL: "পোল্যান্ড",
  RO: "রোমানিয়া",
  HU: "হাঙ্গেরি",
  MT: "মাল্টা",
  GR: "গ্রিস",
  CH: "সুইজারল্যান্ড",
  HR: "ক্রোয়েশিয়া",
  CY: "সাইপ্রাস",
  RS: "সার্বিয়া",
  GE: "জর্জিয়া",
  RU: "রাশিয়া",
  UZ: "উজবেকিস্তান",
  KZ: "কাজাখস্তান",
  ZA: "দক্ষিণ আফ্রিকা",
  AT: "অস্ট্রিয়া",
  BE: "বেলজিয়াম",
  CZ: "চেক প্রজাতন্ত্র",
  FI: "ফিনল্যান্ড",
  IS: "আইসল্যান্ড",
  LU: "লুক্সেমবার্গ",
  SK: "স্লোভাকিয়া",
  SI: "স্লোভেনিয়া",
  EE: "এস্তোনিয়া",
  LV: "লাটভিয়া",
  LT: "লিথুয়ানিয়া",
  BG: "বুলগেরিয়া",
  AL: "আলবেনিয়া",
  BA: "বসনিয়া ও হার্জেগোভিনা",
  ME: "মন্টিনিগ্রো",
  MK: "উত্তর মেসিডোনিয়া",
  MD: "মলদোভা",
  UA: "ইউক্রেন",
  BY: "বেলারুশ",
  AZ: "আজারবাইজান",
  AM: "আর্মেনিয়া",
  PK: "পাকিস্তান",
  BT: "ভুটান",
  KH: "কম্বোডিয়া",
  MM: "মিয়ানমার",
  LA: "লাওস",
  BN: "ব্রুনাই",
  MN: "মঙ্গোলিয়া",
  TW: "তাইওয়ান",
  KG: "কিরগিজস্তান",
  TJ: "তাজিকিস্তান",
  IR: "ইরান",
  IQ: "ইরাক",
  JO: "জর্ডান",
  LB: "লেবানন",
  IL: "ইসরায়েল",
  KE: "কেনিয়া",
  ET: "ইথিওপিয়া",
  NG: "নাইজেরিয়া",
  GH: "ঘানা",
  MA: "মরক্কো",
  TN: "তিউনিসিয়া",
  DZ: "আলজেরিয়া",
  TZ: "তানজানিয়া",
  MX: "মেক্সিকো",
  BR: "ব্রাজিল",
  AR: "আর্জেন্টিনা",
  CL: "চিলি",
  PE: "পেরু",
  CO: "কলম্বিয়া",
};

export const REGION_NAMES_BN: Record<string, string> = {
  "South Asia": "দক্ষিণ এশিয়া",
  "Southeast Asia": "দক্ষিণ-পূর্ব এশিয়া",
  "East Asia": "পূর্ব এশিয়া",
  "Middle East (Gulf)": "মধ্যপ্রাচ্য (উপসাগরীয় অঞ্চল)",
  "Middle East / Europe": "মধ্যপ্রাচ্য / ইউরোপ",
  "Middle East / Africa": "মধ্যপ্রাচ্য / আফ্রিকা",
  "North America": "উত্তর আমেরিকা",
  Europe: "ইউরোপ",
  Oceania: "ওশেনিয়া",
  "Europe (Schengen)": "ইউরোপ (সেনজেন)",
  Caucasus: "ককেশাস অঞ্চল",
  "Europe / Asia": "ইউরোপ / এশিয়া",
  "Central Asia": "মধ্য এশিয়া",
  Africa: "আফ্রিকা",
  "Europe (Balkans)": "ইউরোপ (বলকান অঞ্চল)",
  "Middle East": "মধ্যপ্রাচ্য",
  "South America": "দক্ষিণ আমেরিকা",
};

export const VISA_NAMES_BN: Record<string, string> = {
  "Tourist Visa (T Visa)": "ট্যুরিস্ট ভিসা (টি ভিসা)",
  "Tourist Visa (Single Entry Visa / eVISA)": "ট্যুরিস্ট ভিসা (সিঙ্গেল এন্ট্রি / ই-ভিসা)",
  "Tourist / Social Visit Visa": "ট্যুরিস্ট / সামাজিক ভিজিট ভিসা",
  "Tourist Visa (TR)": "ট্যুরিস্ট ভিসা (টিআর)",
  "Visit Visa — B211A (Tourism)": "ভিজিট ভিসা — B211A (পর্যটন)",
  "Tourist / Visit Visa": "ট্যুরিস্ট / ভিজিট ভিসা",
  "Tourist Visa — L Visa": "ট্যুরিস্ট ভিসা — এল ভিসা",
  "Short-Term Stay Visa — Tourism": "স্বল্পমেয়াদী অবস্থান ভিসা — পর্যটন",
  "Short-Term Visit Visa (C-3-9) — Tourism": "স্বল্পমেয়াদী ভিজিট ভিসা (C-3-9) — পর্যটন",
  "B-1/B-2 Visitor Visa": "বি-১ / বি-২ ভিজিটর ভিসা",
  "Visitor Visa — Temporary Resident Visa (TRV)":
    "ভিজিটর ভিসা — অস্থায়ী আবাসিক ভিসা (TRV)",
  "Standard Visitor Visa": "স্ট্যান্ডার্ড ভিজিটর ভিসা",
  "Visitor Visa (Subclass 600) — Tourist Stream":
    "ভিজিটর ভিসা (সাবক্লাস ৬০০) — পর্যটন ধারা",
  "Schengen Short-Stay Visa (Type C) — Tourism":
    "সেনজেন স্বল্পমেয়াদী ভিসা (টাইপ সি) — পর্যটন",
};

export const OFFICIAL_FORMS_BN: Record<string, string> = {
  "Indian Visa Online application form (regular visa via IVAC in Bangladesh)":
    "ইন্ডিয়ান ভিসা অনলাইন আবেদন ফর্ম (বাংলাদেশে IVAC-এর মাধ্যমে সাধারণ ভিসা)",
  "Malaysia eVISA online application — Immigration Department of Malaysia":
    "মালয়েশিয়া ই-ভিসা অনলাইন আবেদন — মালয়েশিয়া ইমিগ্রেশন বিভাগ",
  "Form 14A — Application for Entry Visa (via ICA SAVE / authorised agent)":
    "ফর্ম ১৪এ — এন্ট্রি ভিসা আবেদন (ICA SAVE / অনুমোদিত এজেন্টের মাধ্যমে)",
  "Thai e-Visa online application (Tourist Visa TR)":
    "থাই ই-ভিসা অনলাইন আবেদন (ট্যুরিস্ট ভিসা TR)",
  "Indonesian e-Visa application (Directorate General of Immigration)":
    "ইন্দোনেশিয়া ই-ভিসা আবেদন (ইমিগ্রেশন মহাপরিদপ্তর)",
  "COVA online application form — China Visa Application Service Center":
    "COVA অনলাইন আবেদন ফর্ম — চায়না ভিসা অ্যাপ্লিকেশন সার্ভিস সেন্টার",
  "Visa Application Form to Enter Japan (short-term stay)":
    "জাপান প্রবেশের ভিসা আবেদন ফর্ম (স্বল্পমেয়াদী অবস্থান)",
  "Visa application via Korea Visa Portal / KVAC":
    "কোরিয়া ভিসা পোর্টাল / KVAC-এর মাধ্যমে ভিসা আবেদন",
  "Form DS-160 — Online Nonimmigrant Visa Application (CEAC)":
    "ফর্ম DS-160 — অনলাইন নন-ইমিগ্র্যান্ট ভিসা আবেদন (CEAC)",
  "Form IMM 5257 — Application for Visitor Visa (TRV)":
    "ফর্ম IMM 5257 — ভিজিটর ভিসা আবেদন (TRV)",
  "Standard Visitor visa online application (Access UK)":
    "স্ট্যান্ডার্ড ভিজিটর ভিসা অনলাইন আবেদন (Access UK)",
  "Visitor visa (subclass 600) application via ImmiAccount":
    "ImmiAccount-এর মাধ্যমে ভিজিটর ভিসা (সাবক্লাস ৬০০) আবেদন",
  "Schengen harmonised visa application form — Visa Code Reg. (EC) No 810/2009, Annex I":
    "সেনজেন সমন্বিত ভিসা আবেদন ফর্ম — ভিসা কোড রেগুলেশন (EC) নং ৮১০/২০০৯, পরিশিষ্ট-১",
};

export function localizeOfficialForm(raw: string): string {
  if (!raw) return "";
  if (OFFICIAL_FORMS_BN[raw]) return OFFICIAL_FORMS_BN[raw];
  if (raw.startsWith("National visit visa application — ")) {
    const rest = raw.slice("National visit visa application — ".length);
    return `জাতীয় ভিজিট ভিসা আবেদন — ${rest}`;
  }
  return raw;
}

export const SECTION_NAMES_BN: Record<string, string> = {
  "General Information": "সাধারণ তথ্য",
  "Work Information": "কর্মসংস্থান / কাজের তথ্য",
  "Work/Study Information": "পড়াশোনা / প্রতিষ্ঠানের তথ্য",
  "Educational Information": "শিক্ষাগত তথ্য",
  "Family Information": "পারিবারিক তথ্য",
  "Travel Information": "ভ্রমণ সংক্রান্ত তথ্য",
  "Personal Information": "ব্যক্তিগত তথ্য",
  Passport: "পাসপোর্ট সংক্রান্ত তথ্য",
  Contact: "যোগাযোগের তথ্য",
  "Travel Plan": "ভ্রমণ পরিকল্পনা",
  "Host / Invitation": "আমন্ত্রণকারী / হোস্টের তথ্য",
  Financial: "আর্থিক তথ্য",
  "Travel History": "পূর্ববর্তী ভ্রমণ ইতিহাস",
  "Education (Student)": "শিক্ষাগত তথ্য (শিক্ষার্থী)",
  "Sponsor (Student)": "স্পন্সর / খরচ বহনকারীর তথ্য (শিক্ষার্থী)",
  "Business (Businessman)": "ব্যবসায়িক তথ্য (ব্যবসায়ী)",
  "Employment (Employee)": "চাকরি সংক্রান্ত তথ্য (চাকরিজীবী)",
};

export const SUBGROUP_NAMES_BN: Record<string, string> = {
  "High School": "হাই স্কুল (এসএসসি / সমমান)",
  College: "কলেজ (এইচএসসি / সমমান)",
  "Last Education": "সর্বশেষ শিক্ষাগত যোগ্যতা",
  Father: "পিতার তথ্য",
  Mother: "মাতার তথ্য",
  Spouse: "স্বামী / স্ত্রীর তথ্য (শুধুমাত্র বিবাহিত হলে)",
  "Child 1": "সন্তান ১",
  "Child 2": "সন্তান ২",
};

export const PROFESSION_LABELS_BN: Record<ProfessionKey, string> = {
  student: "শিক্ষার্থী",
  businessman: "ব্যবসায়ী",
  employee: "চাকরিজীবী",
};

export const PROFESSION_DESCRIPTIONS_BN: Record<ProfessionKey, string> = {
  student: "আবেদনকারী বর্তমানে কোনো স্কুল, কলেজ বা বিশ্ববিদ্যালয়ে অধ্যয়নরত।",
  businessman:
    "আবেদনকারী কোনো ব্যবসার মালিক বা অংশীদার (স্বত্বাধিকারী, অংশীদার বা কোম্পানি পরিচালক)।",
  employee: "আবেদনকারী কোনো সরকারি বা বেসরকারি প্রতিষ্ঠানে কর্মরত।",
};

export interface FieldTranslationBn {
  label: string;
  placeholder: string;
  helpText?: string;
}

export const FIELD_TRANSLATIONS_BN: Record<string, FieldTranslationBn> = {
  // General Information
  applicant_name: {
    label: "আবেদনকারীর পূর্ণ নাম",
    placeholder: "পাসপোর্ট অনুযায়ী ইংরেজিতে আপনার পূর্ণ নাম লিখুন",
    helpText: "পাসপোর্টে থাকা ইংরেজি বানান লিখুন (সংখ্যা ছাড়া সর্বোচ্চ ৬০ অক্ষর, স্বয়ংক্রিয়ভাবে বড় হাতের হবে)।",
  },
  // Personal Information
  surname: {
    label: "বংশগত নাম / সারনেম (পাসপোর্ট অনুযায়ী)",
    placeholder: "পাসপোর্ট অনুযায়ী ইংরেজিতে বংশগত নাম লিখুন (যেমন: RAHMAN)",
    helpText: "পাসপোর্টে থাকা ইংরেজি বানান লিখুন (সংখ্যা ছাড়া সর্বোচ্চ ৪০ অক্ষর, স্বয়ংক্রিয়ভাবে বড় হাতের হবে)।",
  },
  given_names: {
    label: "প্রদত্ত নাম / নামের প্রথম অংশ (পাসপোর্ট অনুযায়ী)",
    placeholder: "পাসপোর্ট অনুযায়ী ইংরেজিতে আপনার নাম লিখুন (যেমন: MD ARIFUL)",
    helpText: "পাসপোর্টে থাকা ইংরেজি বানান লিখুন (সংখ্যা ছাড়া সর্বোচ্চ ৪০ অক্ষর, স্বয়ংক্রিয়ভাবে বড় হাতের হবে)।",
  },
  surname_at_birth: {
    label: "জন্মকালীন বংশগত নাম / পূর্বের পদবি (যদি ভিন্ন হয়)",
    placeholder: "ভিন্ন হলে পূর্বের বংশগত নাম লিখুন",
    helpText: "সংখ্যা ছাড়া সর্বোচ্চ ৪০ অক্ষরের মধ্যে লিখুন।",
  },
  date_of_birth: {
    label: "জন্মতারিখ",
    placeholder: "আপনার জন্মতারিখ নির্বাচন করুন",
    helpText: "পাসপোর্টের সাথে মিল থাকতে হবে। ক্যালেন্ডার থেকে মাস ও বছর বেছে নিন।",
  },
  place_of_birth: {
    label: "জন্মস্থান (জেলা / শহর)",
    placeholder: "উদাহরণ: DHAKA",
  },
  country_of_birth: {
    label: "জন্মদেশ",
    placeholder: "উদাহরণ: BANGLADESH",
  },
  current_nationality: {
    label: "বর্তমান জাতীয়তা",
    placeholder: "উদাহরণ: BANGLADESHI",
  },
  nationality_at_birth: {
    label: "জন্মগত জাতীয়তা (যদি ভিন্ন হয়)",
    placeholder: "ভিন্ন হলে জন্মগত জাতীয়তা লিখুন",
  },
  other_nationalities: {
    label: "অন্যান্য / পূর্ববর্তী জাতীয়তা (যদি থাকে)",
    placeholder: "অন্য কোনো দেশের নাগরিকত্ব থাকলে লিখুন",
  },
  sex: {
    label: "লিঙ্গ",
    placeholder: "লিঙ্গ নির্বাচন করুন",
  },
  marital_status: {
    label: "বৈবাহিক অবস্থা",
    placeholder: "বৈবাহিক অবস্থা নির্বাচন করুন",
  },
  national_id_number: {
    label: "জাতীয় পরিচয়পত্র নম্বর (NID)",
    placeholder: "উদাহরণ: 1234567890 (১০, ১৩ বা ১৭ ডিজিট)",
    helpText: "আপনার বাংলাদেশি জাতীয় পরিচয়পত্র (NID) নম্বর শুধু সংখ্যায় লিখুন (১০, ১৩ বা ১৭ ডিজিট)।",
  },
  religion: {
    label: "ধর্ম",
    placeholder: "উদাহরণ: ISLAM",
  },

  // Family Information
  fathers_name: {
    label: "নাম",
    placeholder: "পিতার পূর্ণ নাম লিখুন",
  },
  fathers_nationality: {
    label: "জাতীয়তা",
    placeholder: "উদাহরণ: BANGLADESHI",
  },
  fathers_date_of_birth: {
    label: "জন্মতারিখ",
    placeholder: "ট্যাপ করে জন্মতারিখ বেছে নিন",
    helpText: "ক্যালেন্ডার খুলে তারিখ নির্বাচন করুন।",
  },
  mothers_name: {
    label: "নাম",
    placeholder: "মাতার পূর্ণ নাম লিখুন",
  },
  mothers_nationality: {
    label: "জাতীয়তা",
    placeholder: "উদাহরণ: BANGLADESHI",
  },
  mothers_date_of_birth: {
    label: "জন্মতারিখ",
    placeholder: "ট্যাপ করে জন্মতারিখ বেছে নিন",
    helpText: "ক্যালেন্ডার খুলে তারিখ নির্বাচন করুন।",
  },
  spouse_name: {
    label: "নাম",
    placeholder: "বিবাহিত হলে স্বামী/স্ত্রীর পূর্ণ নাম লিখুন",
  },
  spouse_nationality: {
    label: "জাতীয়তা",
    placeholder: "উদাহরণ: BANGLADESHI",
  },
  spouse_date_of_birth: {
    label: "জন্মতারিখ",
    placeholder: "ট্যাপ করে জন্মতারিখ বেছে নিন",
    helpText: "ক্যালেন্ডার খুলে তারিখ নির্বাচন করুন।",
  },
  child_1_name: {
    label: "নাম",
    placeholder: "প্রথম সন্তানের পূর্ণ নাম লিখুন",
  },
  child_1_nationality: {
    label: "জাতীয়তা",
    placeholder: "উদাহরণ: BANGLADESHI",
  },
  child_1_date_of_birth: {
    label: "জন্মতারিখ",
    placeholder: "ট্যাপ করে জন্মতারিখ বেছে নিন",
  },
  child_2_name: {
    label: "নাম",
    placeholder: "দ্বিতীয় সন্তানের পূর্ণ নাম লিখুন",
  },
  child_2_nationality: {
    label: "জাতীয়তা",
    placeholder: "উদাহরণ: BANGLADESHI",
  },
  child_2_date_of_birth: {
    label: "জন্মতারিখ",
    placeholder: "ট্যাপ করে জন্মতারিখ বেছে নিন",
  },
  spouse_nationality_nid: {
    label: "স্বামী বা স্ত্রীর জাতীয়তা ও NID নম্বর (বিবাহিত হলে)",
    placeholder: "উদাহরণ: BANGLADESHI, NID 1234567890",
  },
  number_of_children: {
    label: "সন্তানের সংখ্যা",
    placeholder: "উদাহরণ: 0 বা 2",
  },

  // Educational Information
  high_school_years: {
    label: "সময়কাল — শুরু থেকে শেষ",
    placeholder: "উদাহরণ: 2004-2006",
    helpText: "YYYY-YYYY ফরম্যাটে লিখুন (যেমন: 2004-2006)।",
  },
  high_school_institution: {
    label: "প্রতিষ্ঠানের নাম",
    placeholder: "হাই স্কুলের নাম লিখুন",
  },
  high_school_major: {
    label: "বিভাগ / বিষয় (Major)",
    placeholder: "উদাহরণ: SCIENCE / COMMERCE / ARTS",
  },
  college_years: {
    label: "সময়কাল — শুরু থেকে শেষ",
    placeholder: "উদাহরণ: 2004-2006",
    helpText: "YYYY-YYYY ফরম্যাটে লিখুন (যেমন: 2004-2006)।",
  },
  college_institution: {
    label: "প্রতিষ্ঠানের নাম",
    placeholder: "কলেজের নাম লিখুন",
  },
  college_major: {
    label: "বিভাগ / বিষয় (Major)",
    placeholder: "উদাহরণ: SCIENCE / BUSINESS STUDIES",
  },
  last_education_years: {
    label: "সময়কাল — শুরু থেকে শেষ",
    placeholder: "উদাহরণ: 2004-2006",
    helpText: "YYYY-YYYY ফরম্যাটে লিখুন (যেমন: 2004-2006)।",
  },
  last_education_institution: {
    label: "প্রতিষ্ঠানের নাম",
    placeholder: "সর্বশেষ শিক্ষা প্রতিষ্ঠানের নাম লিখুন",
  },
  last_education_major: {
    label: "বিভাগ / বিষয় (Major)",
    placeholder: "উদাহরণ: BBA / BSC IN CSE / HONOURS",
  },

  // Passport
  passport_type: {
    label: "পাসপোর্টের ধরন (সাধারণ / অফিসিয়াল / কূটনৈতিক)",
    placeholder: "পাসপোর্টের ধরন নির্বাচন করুন",
  },
  passport_number: {
    label: "পাসপোর্ট নম্বর",
    placeholder: "উদাহরণ: A01234567",
    helpText: "৯ অক্ষরের পাসপোর্ট নম্বর লিখুন (ইংরেজি অক্ষর ও সংখ্যা, স্বয়ংক্রিয়ভাবে বড় হাতের হবে)।",
  },
  passport_issue_date: {
    label: "পাসপোর্ট প্রদানের (ইস্যুর) তারিখ",
    placeholder: "ট্যাপ করে ইস্যুর তারিখ বেছে নিন",
    helpText: "অবশ্যই আজকের তারিখের আগে এবং মেয়াদোত্তীর্ণের তারিখের আগে হতে হবে।",
  },
  passport_expiry_date: {
    label: "পাসপোর্ট মেয়াদোত্তীর্ণের তারিখ",
    placeholder: "ট্যাপ করে মেয়াদ শেষ হওয়ার তারিখ বেছে নিন",
    helpText: "ভ্রমণ শেষে ফেরার তারিখের পরও পাসপোর্টের মেয়াদ কমপক্ষে ৬ মাস থাকতে হবে।",
  },
  passport_issued_by: {
    label: "পাসপোর্ট প্রদানকারী কর্তৃপক্ষ",
    placeholder: "উদাহরণ: DIP DHAKA",
  },
  passport_place_of_issue: {
    label: "পাসপোর্ট প্রদানের স্থান",
    placeholder: "উদাহরণ: DHAKA, BANGLADESH",
  },
  previous_passport_numbers: {
    label: "পূর্ববর্তী পাসপোর্ট নম্বর (যদি থাকে)",
    placeholder: "পুরনো পাসপোর্ট থাকলে তার নম্বর লিখুন",
  },

  // Contact
  present_address: {
    label: "বর্তমান বসবাসের ঠিকানা",
    placeholder: "পূর্ণ ঠিকানা লিখুন (বাড়ি নং, সড়ক, এলাকা, থানা, জেলা)",
  },
  permanent_address: {
    label: "স্থায়ী ঠিকানা (বর্তমান ঠিকানা থেকে ভিন্ন হলে)",
    placeholder: "ভিন্ন হলে স্থায়ী ঠিকানা লিখুন (গ্রাম/বাড়ি, ডাকঘর, থানা, জেলা)",
  },
  residing_country_other: {
    label: "আপনি কি নিজ দেশ ছাড়া অন্য দেশে বসবাস করেন? (হ্যাঁ হলে দেশ ও রেসিডেন্স পারমিট নম্বর)",
    placeholder: "অন্য দেশে বসবাস করলে দেশের নাম ও পারমিট নম্বর লিখুন",
  },
  phone_primary: {
    label: "আবেদনকারীর মোবাইল নম্বর",
    placeholder: "01XXXXXXXXX",
    helpText: "শুধুমাত্র বাংলাদেশি মোবাইল নম্বর: +88 নির্ধারিত আছে; 013–019 দিয়ে শুরু ১১ ডিজিট লিখুন।",
  },
  phone_secondary: {
    label: "বিকল্প মোবাইল নম্বর",
    placeholder: "01XXXXXXXXX",
    helpText: "শুধুমাত্র বাংলাদেশি মোবাইল নম্বর: +88 নির্ধারিত আছে; 013–019 দিয়ে শুরু ১১ ডিজিট লিখুন।",
  },
  email: {
    label: "ইমেইল ঠিকানা",
    placeholder: "উদাহরণ: yourname@gmail.com",
    helpText: "আপনার সচল ইমেইল ঠিকানাটি ইংরেজিতে সঠিকভাবে লিখুন (সর্বোচ্চ ৭০ অক্ষর)।",
  },

  // Travel Plan
  main_purpose_of_visit: {
    label: "ভ্রমণের মূল উদ্দেশ্য",
    placeholder: "ভ্রমণের উদ্দেশ্য নির্বাচন করুন",
  },
  destination_city: {
    label: "যে শহরে থাকবেন",
    placeholder: "উদাহরণ: KUALA LUMPUR / LONDON",
  },
  intended_arrival_date: {
    label: "পৌঁছানোর তারিখ",
    placeholder: "ট্যাপ করে পৌঁছানোর তারিখ বেছে নিন",
    helpText: "আজ বা সামনের যেকোনো ভ্রমণের তারিখ বেছে নিন।",
  },
  intended_departure_date: {
    label: "ফেরার তারিখ",
    placeholder: "ট্যাপ করে ফেরার তারিখ বেছে নিন",
    helpText: "ঐচ্ছিক। দিলে অবশ্যই পৌঁছানোর তারিখের পরের তারিখ হতে হবে।",
  },
  duration_of_stay_days: {
    label: "সর্বোচ্চ অবস্থানের দিন",
    placeholder: "উদাহরণ: 14",
    helpText: "মোট সর্বোচ্চ কত দিন থাকবেন তা সংখ্যায় লিখুন (যেমন: 14)।",
  },
  number_of_entries_requested: {
    label: "প্রবেশের সংখ্যা (সিঙ্গেল / ডাবল / মাল্টিপল)",
    placeholder: "প্রবেশের সংখ্যা নির্বাচন করুন",
  },
  port_of_entry: {
    label: "প্রথম প্রবেশ বন্দর / বিমানবন্দর / শহর",
    placeholder: "উদাহরণ: KUALA LUMPUR AIRPORT / HEATHROW",
  },
  accommodation_type: {
    label: "কোথায় অবস্থান করবেন?",
    placeholder: "থাকার জায়গার ধরন নির্বাচন করুন",
  },
  accommodation_name_address: {
    label: "হোটেলের নাম ও ঠিকানা, অথবা আমন্ত্রণকারীর ঠিকানা",
    placeholder: "হোটেলের নাম ও পূর্ণ ঠিকানা অথবা হোস্টের ঠিকানা লিখুন",
  },
  travelling_companions: {
    label: "সহযাত্রীদের তথ্য (অন্য কারো সাথে ভ্রমণ করলে নাম ও সম্পর্ক)",
    placeholder: "সাথে কেউ থাকলে নাম ও সম্পর্ক লিখুন (একা হলে খালি রাখুন)",
  },

  // Host / Invitation
  has_invitation: {
    label: "গন্তব্য দেশের কোনো ব্যক্তি বা প্রতিষ্ঠানের কাছ থেকে আমন্ত্রণপত্র আছে কি?",
    placeholder: "হ্যাঁ বা না নির্বাচন করুন",
  },
  host_full_name: {
    label: "আমন্ত্রণকারীর পূর্ণ নাম (যদি থাকে)",
    placeholder: "আমন্ত্রণকারী ব্যক্তি বা প্রতিষ্ঠানের নাম লিখুন",
  },
  host_relationship: {
    label: "আমন্ত্রণকারীর সাথে সম্পর্ক",
    placeholder: "উদাহরণ: BROTHER / FRIEND / UNCLE",
  },
  host_address: {
    label: "গন্তব্য দেশে আমন্ত্রণকারীর ঠিকানা",
    placeholder: "আমন্ত্রণকারীর পূর্ণ ঠিকানা লিখুন",
  },
  host_phone_email: {
    label: "আমন্ত্রণকারীর ফোন নম্বর ও ইমেইল",
    placeholder: "ফোন নম্বর এবং ইমেইল ঠিকানা লিখুন",
  },
  host_residence_status: {
    label: "গন্তব্য দেশে আমন্ত্রণকারীর বসবাসের ধরন (নাগরিক / পিআর / ভিসাধারী)",
    placeholder: "উদাহরণ: CITIZEN / PR / WORK PERMIT",
  },

  // Financial
  who_pays_for_trip: {
    label: "ভ্রমণের খরচ কে বহন করবেন?",
    placeholder: "খরচ বহনকারী নির্বাচন করুন",
  },
  means_of_support: {
    label: "অবস্থানকালে খরচের মাধ্যম",
    placeholder: "খরচের মাধ্যম নির্বাচন করুন",
  },
  estimated_trip_cost: {
    label: "ভ্রমণের আনুমানিক মোট খরচ",
    placeholder: "উদাহরণ: 150000",
    helpText: "আনুমানিক খরচের পরিমাণ সংখ্যায় লিখুন।",
  },
  has_travel_insurance: {
    label: "ভ্রমণ স্বাস্থ্য বীমা (Travel Medical Insurance) নেওয়া হয়েছে বা নেওয়া হবে কি?",
    placeholder: "হ্যাঁ বা না নির্বাচন করুন",
  },

  // Travel History
  countries_visited_last_5_years: {
    label: "গত ৫ বছরে ভ্রমণকৃত দেশসমূহ",
    placeholder: "গত ৫ বছরে যেসব দেশে গিয়েছেন তার নাম ও সাল লিখুন",
  },
  previous_visas_this_country: {
    label: "পূর্বে কখনো এই দেশের ভিসার আবেদন করেছেন বা ভিসা পেয়েছেন কি? বিস্তারিত লিখুন",
    placeholder: "হ্যাঁ হলে ভিসার তারিখ ও বিস্তারিত লিখুন; না হলে NO লিখুন",
  },
  fingerprints_collected_before: {
    label: "পূর্বে কোনো ভিসা আবেদনের জন্য আঙুলের ছাপ (বায়োমেট্রিক) দিয়েছেন কি?",
    placeholder: "একটি বিকল্প নির্বাচন করুন",
  },
  visa_refusal_any_country: {
    label: "কখনো কোনো দেশের ভিসা প্রত্যাখ্যাত (রিফিউজ) হয়েছে কি?",
    placeholder: "হ্যাঁ বা না নির্বাচন করুন",
  },
  refusal_details: {
    label: "ভিসা প্রত্যাখ্যানের বিস্তারিত — দেশ, সাল ও কারণ (যদি পূর্বে হয়ে থাকে)",
    placeholder: "প্রত্যাখ্যাত হয়ে থাকলে দেশের নাম, বছর ও কারণ লিখুন",
  },
  overstay_or_deportation: {
    label: "কখনো কোনো দেশে ভিসার মেয়াদের বেশি অবস্থান করেছেন বা বহিষ্কৃত (ডিপোর্ট) হয়েছেন কি?",
    placeholder: "হ্যাঁ বা না নির্বাচন করুন",
  },

  // Education (Student)
  institution_name: {
    label: "শিক্ষা প্রতিষ্ঠানের নাম (স্কুল / কলেজ / বিশ্ববিদ্যালয়)",
    placeholder: "শিক্ষা প্রতিষ্ঠানের পূর্ণ নাম লিখুন",
  },
  institution_address: {
    label: "শিক্ষা প্রতিষ্ঠানের ঠিকানা",
    placeholder: "শিক্ষা প্রতিষ্ঠানের পূর্ণ ঠিকানা লিখুন",
  },
  institution_phone: {
    label: "শিক্ষা প্রতিষ্ঠানের যোগাযোগ নম্বর",
    placeholder: "উদাহরণ: 01XXXXXXXXX অথবা অফিস ফোন নম্বর",
  },
  course_or_class: {
    label: "কোর্স / শ্রেণি / প্রোগ্রাম",
    placeholder: "উদাহরণ: BSC IN CSE / HSC / CLASS 10",
  },
  current_semester_or_year: {
    label: "বর্তমান শ্রেণি / সেমিস্টার",
    placeholder: "উদাহরণ: 5TH SEMESTER / 2ND YEAR",
  },
  student_id_number: {
    label: "শিক্ষার্থী আইডি (Student ID) নম্বর",
    placeholder: "আপনার স্টুডেন্ট আইডি বা রোল নম্বর লিখুন",
  },
  study_start_date: {
    label: "পড়াশোনা শুরুর তারিখ",
    placeholder: "ট্যাপ করে পড়াশোনা শুরুর তারিখ বেছে নিন",
    helpText: "ক্যালেন্ডার খুলে তারিখ নির্বাচন করুন।",
  },
  expected_completion_date: {
    label: "পড়াশোনা শেষ হওয়ার সম্ভাব্য তারিখ",
    placeholder: "ট্যাপ করে সম্ভাব্য শেষ হওয়ার তারিখ বেছে নিন",
    helpText: "ক্যালেন্ডার খুলে সম্ভাব্য তারিখ নির্বাচন করুন।",
  },

  // Sponsor (Student)
  trip_funded_by: {
    label: "আপনার ভ্রমণের অর্থ কে জোগান দিচ্ছেন?",
    placeholder: "অর্থ জোগানদাতা নির্বাচন করুন",
  },
  sponsor_name: {
    label: "স্পন্সরের পূর্ণ নাম",
    placeholder: "যিনি খরচ বহন করছেন তাঁর পূর্ণ নাম লিখুন",
  },
  sponsor_relationship: {
    label: "স্পন্সরের সাথে সম্পর্ক",
    placeholder: "উদাহরণ: FATHER / MOTHER / ELDER BROTHER",
  },
  sponsor_occupation: {
    label: "স্পন্সরের পেশা",
    placeholder: "উদাহরণ: BUSINESSMAN / SERVICE HOLDER",
  },

  // Business (Businessman)
  business_name: {
    label: "ব্যবসা / প্রতিষ্ঠানের নাম",
    placeholder: "আপনার ব্যবসা প্রতিষ্ঠানের পূর্ণ নাম লিখুন",
  },
  business_type: {
    label: "ব্যবসার ধরন",
    placeholder: "ব্যবসার ধরন নির্বাচন করুন",
  },
  position_in_business: {
    label: "প্রতিষ্ঠানে আপনার পদবি",
    placeholder: "আপনার পদবি নির্বাচন করুন",
  },
  trade_licence_number: {
    label: "ট্রেড লাইসেন্স নম্বর",
    placeholder: "আপনার ট্রেড লাইসেন্স নম্বর লিখুন",
  },
  business_start_date: {
    label: "ব্যবসা শুরুর / প্রতিষ্ঠার তারিখ",
    placeholder: "ট্যাপ করে ব্যবসা শুরুর তারিখ বেছে নিন",
    helpText: "ক্যালেন্ডার খুলে ব্যবসা প্রতিষ্ঠার তারিখ বেছে নিন।",
  },
  nature_of_business: {
    label: "ব্যবসার প্রকৃতি (ব্যবসাটি কী ধরনের পণ্য বা সেবা নিয়ে কাজ করে)",
    placeholder: "উদাহরণ: GARMENTS EXPORT / IT SERVICES / TRADING",
  },
  business_address: {
    label: "ব্যবসা / অফিসের ঠিকানা",
    placeholder: "অফিস বা ব্যবসার পূর্ণ ঠিকানা লিখুন",
  },
  business_phone: {
    label: "অফিস / ব্যবসার ফোন নম্বর",
    placeholder: "উদাহরণ: 01XXXXXXXXX অথবা অফিসের নম্বর",
  },
  business_email: {
    label: "ব্যবসার ইমেইল ঠিকানা",
    placeholder: "উদাহরণ: info@company.com",
    helpText: "ব্যবসায়িক ইমেইল ঠিকানাটি ইংরেজিতে সঠিকভাবে লিখুন।",
  },
  tin_number: {
    label: "টিআইএন (TIN) / কর শনাক্তকরণ নম্বর",
    placeholder: "উদাহরণ: 123456789012 (১২ ডিজিট)",
    helpText: "আপনার ১২ ডিজিটের বাংলাদেশি ই-টিআইএন (e-TIN) নম্বর লিখুন (শুধু সংখ্যা)।",
  },
  number_of_employees: {
    label: "কর্মচারীর সংখ্যা",
    placeholder: "উদাহরণ: 15",
  },

  // Employment (Employee & Businessman)
  employer_name: {
    label: "প্রতিষ্ঠান / নিয়োগকর্তার নাম",
    placeholder: "আপনার প্রতিষ্ঠান বা কোম্পানির পূর্ণ নাম লিখুন",
    helpText: "সংখ্যা ছাড়া সর্বোচ্চ ৫০ অক্ষরের মধ্যে লিখুন।",
  },
  employer_address: {
    label: "প্রতিষ্ঠানের ঠিকানা",
    placeholder: "কর্মস্থলের পূর্ণ ঠিকানা লিখুন",
  },
  employer_phone: {
    label: "যোগাযোগের ফোন নম্বর",
    placeholder: "উদাহরণ: 01XXXXXXXXX অথবা অফিসের নম্বর",
  },
  designation: {
    label: "পদবি (Designation)",
    placeholder: "উদাহরণ: SENIOR OFFICER / MANAGING DIRECTOR",
  },
  department: {
    label: "বিভাগ (Department)",
    placeholder: "উদাহরণ: ACCOUNTS / HUMAN RESOURCES / IT",
  },
  employee_id_number: {
    label: "কর্মচারী আইডি (Employee ID) নম্বর",
    placeholder: "আপনার অফিস আইডি নম্বর লিখুন",
  },
  date_of_joining: {
    label: "যোগদানের তারিখ (শুরুর তারিখ)",
    placeholder: "ট্যাপ করে যোগদানের তারিখ বেছে নিন",
    helpText: "ক্যালেন্ডার খুলে যোগদানের তারিখ নির্বাচন করুন।",
  },
  monthly_salary: {
    label: "মাসিক বেতন",
    placeholder: "উদাহরণ: 50000",
    helpText: "আপনার মাসিক বেতনের পরিমাণ সংখ্যায় লিখুন।",
  },
  supervisor_name: {
    label: "সুপারভাইজারের নাম",
    placeholder: "সুপারভাইজার বা ঊর্ধ্বতন কর্মকর্তার নাম লিখুন",
  },
  supervisor_phone: {
    label: "সুপারভাইজারের ফোন নম্বর",
    placeholder: "উদাহরণ: 01XXXXXXXXX অথবা অফিসের নম্বর",
  },
  approved_leave_dates: {
    label: "অনুমোদিত ছুটির তারিখ (এই ভ্রমণের জন্য)",
    placeholder: "উদাহরণ: 10 DEC 2026 TO 24 DEC 2026",
  },
};

export const SELECT_OPTION_LABELS_BN: Record<string, Record<string, string>> = {
  sex: {
    Male: "পুরুষ",
    Female: "মহিলা",
    Other: "অন্যান্য",
  },
  marital_status: {
    Single: "অবিবাহিত",
    Married: "বিবাহিত",
    Divorced: "তালাকপ্রাপ্ত",
    Widowed: "বিধবা / বিপত্নীক",
  },
  passport_type: {
    Ordinary: "সাধারণ (অর্ডিনারি)",
    Official: "অফিসিয়াল",
    Diplomatic: "কূটনৈতিক (ডিপ্লোম্যাটিক)",
    Other: "অন্যান্য",
  },
  main_purpose_of_visit: {
    Tourism: "পর্যটন / ভ্রমণ",
    "Visiting family": "পরিবারের সাথে সাক্ষাৎ",
    "Visiting friends": "বন্ধুদের সাথে সাক্ষাৎ",
    Other: "অন্যান্য",
  },
  number_of_entries_requested: {
    Single: "একবার (সিঙ্গেল)",
    Double: "দুইবার (ডাবল)",
    Multiple: "একাধিকবার (মাল্টিপল)",
  },
  accommodation_type: {
    Hotel: "হোটেল",
    "Family or friend's home": "পরিবার বা বন্ধুর বাসা",
    "Rented apartment": "ভাড়া বাসা / অ্যাপার্টমেন্ট",
    Other: "অন্যান্য",
  },
  has_invitation: {
    Yes: "হ্যাঁ",
    No: "না",
  },
  who_pays_for_trip: {
    Myself: "নিজে",
    "Family member": "পরিবারের সদস্য",
    "Inviting person": "আমন্ত্রণকারী ব্যক্তি",
    Employer: "নিয়োগকর্তা / প্রতিষ্ঠান",
  },
  means_of_support: {
    "Bank account": "ব্যাংক হিসাব",
    Cash: "নগদ অর্থ",
    "Credit / Debit cards": "ক্রেডিট / ডেবিট কার্ড",
    "Host provides": "আমন্ত্রণকারী / হোস্ট বহন করবেন",
    "Multiple / Combined": "একাধিক / সম্মিলিত মাধ্যম",
  },
  has_travel_insurance: {
    Yes: "হ্যাঁ",
    No: "না",
  },
  fingerprints_collected_before: {
    Yes: "হ্যাঁ",
    No: "না",
    Unknown: "জানা নেই",
  },
  visa_refusal_any_country: {
    Yes: "হ্যাঁ",
    No: "না",
  },
  overstay_or_deportation: {
    Yes: "হ্যাঁ",
    No: "না",
  },
  trip_funded_by: {
    Father: "পিতা",
    Mother: "মাতা",
    Self: "নিজে",
    Other: "অন্যান্য",
  },
  business_type: {
    Proprietorship: "একক মালিকানাধীন (প্রোপ্রাইটরশিপ)",
    Partnership: "অংশীদারি ব্যবসা (পার্টনারশিপ)",
    "Limited Company": "লিমিটেড কোম্পানি",
  },
  position_in_business: {
    Proprietor: "স্বত্বাধিকারী (প্রোপ্রাইটর)",
    Partner: "অংশীদার (পার্টনার)",
    Director: "পরিচালক (ডিরেক্টর)",
    Chairman: "চেয়ারম্যান",
    "Managing Director": "ব্যবস্থাপনা পরিচালক (এমডি)",
  },
};

export interface DocumentTranslationBn {
  label: string;
  note?: string;
}

export const DOCUMENT_TRANSLATIONS_BN: Record<string, DocumentTranslationBn> = {
  passport_original_and_copy: {
    label:
      "মূল পাসপোর্ট ও তথ্য পাতার কপি (ভ্রমণের তারিখের পর কমপক্ষে ৬ মাস মেয়াদ এবং অন্তত ২টি ফাঁকা পাতা থাকতে হবে)",
  },
  previous_passports: {
    label: "পূর্ববর্তী সকল পাসপোর্ট — মূল কপি ও ফটোকপি",
    note: "থাকলে অবশ্যই জমা দিন; এটি আপনার পূর্বের ভ্রমণ ইতিহাস প্রমাণ করে।",
  },
  recent_photographs: {
    label: "সাম্প্রতিক তোলা পাসপোর্ট সাইজের ছবি (সাদা ব্যাকগ্রাউন্ড)",
    note: "ছবির সঠিক মাপ ও সংখ্যা গন্তব্য দেশের দূতাবাসের নির্দেশনা অনুযায়ী হবে।",
  },
  visa_application_form_signed: {
    label: "পূরণকৃত ভিসা আবেদন ফর্ম — প্রিন্ট ও স্বাক্ষরিত কপি",
  },
  cover_letter: {
    label: "কভার লেটার — ভ্রমণের উদ্দেশ্য, তারিখ, দর্শনীয় স্থান ও খরচ বহনকারীর বিবরণসহ",
  },
  national_id_copy: {
    label: "জাতীয় পরিচয়পত্র (NID) কার্ডের কপি",
  },
  return_air_ticket_booking: {
    label: "নিশ্চিত বা সংরক্ষিত রিটার্ন বিমান টিকিট বুকিং",
  },
  hotel_booking_proof: {
    label: "সম্পূর্ণ ভ্রমণ সময়ের হোটেল বুকিং নিশ্চিতকরণ কপি",
    note: "পরিবার বা বন্ধুর বাসায় থাকলে এটি প্রয়োজন নেই — সেক্ষেত্রে আমন্ত্রণ সংক্রান্ত কাগজপত্র প্রযোজ্য হবে।",
  },
  travel_itinerary: {
    label: "দিনভিত্তিক ভ্রমণ সূচি (Travel Itinerary)",
  },
  travel_medical_insurance: {
    label: "ভ্রমণ স্বাস্থ্য বীমা পলিসি (Travel Medical Insurance)",
    note: "সেনজেন দেশগুলোর জন্য বাধ্যতামূলক। অন্যান্য দেশের জন্যও এটি রাখা উত্তম।",
  },
  personal_bank_statement_6_months: {
    label: "ব্যক্তিগত ব্যাংক স্টেটমেন্ট — সর্বশেষ ৬ মাসের, ব্যাংকের স্বাক্ষর ও সিলসহ",
  },
  bank_solvency_certificate: {
    label: "ব্যাংক সচ্ছলতা (Solvency) / ব্যালেন্স সনদপত্র",
  },
  birth_certificate_copy: {
    label: "জন্ম নিবন্ধন সনদের কপি",
    note: "অপ্রাপ্তবয়স্ক আবেদনকারী এবং পারিবারিক স্পন্সরের সম্পর্ক প্রমাণের জন্য প্রয়োজন।",
  },
  marriage_certificate_copy: {
    label: "বিবাহ সনদ / নিকাহনামার কপি (বিবাহিত হলে)",
  },
  invitation_letter_host: {
    label:
      "আমন্ত্রণকারীর আমন্ত্রণপত্র + আমন্ত্রণকারীর পাসপোর্ট/ভিসা/পিআর কপি ও ঠিকানার প্রমাণ",
    note: "শুধুমাত্র পরিবার বা বন্ধুর বাসায় বেড়াতে গেলে প্রযোজ্য — হোটেল বুকিংয়ের ক্ষেত্রে নয়।",
  },

  // Student
  student_id_card_copy: {
    label: "শিক্ষার্থী আইডি কার্ডের কপি (উভয় পাশ)",
  },
  enrollment_certificate: {
    label: "শিক্ষা প্রতিষ্ঠান থেকে বর্তমান অধ্যয়ন সনদ / বোনাফাইড সার্টিফিকেট",
  },
  institution_leave_approval: {
    label: "ভ্রমণের তারিখের জন্য শিক্ষা প্রতিষ্ঠান থেকে ছুটির অনুমোদন / NOC পত্র",
  },
  sponsor_bank_statement: {
    label: "স্পন্সরের ব্যাংক স্টেটমেন্ট — সর্বশেষ ৬ মাসের, ব্যাংকের স্বাক্ষর ও সিলসহ",
    note: "সাধারণত মা-বাবা খরচ বহন করলে তাঁদের ব্যাংক হিসাবের স্টেটমেন্ট দিতে হয়।",
  },
  sponsor_solvency_certificate: {
    label: "স্পন্সরের ব্যাংক সচ্ছলতা (Solvency) / ব্যালেন্স সনদপত্র",
  },
  sponsor_noc_affidavit: {
    label: "স্পন্সরের সম্মতিপত্র / অ্যাফিডেভিট অব সাপোর্ট (ভ্রমণের সকল খরচ বহনের অঙ্গীকারনামা)",
  },
  last_result_or_transcript: {
    label: "সর্বশেষ পরীক্ষার ফলাফল / ট্রান্সক্রিপ্টের কপি",
  },

  // Businessman
  trade_licence_copy: {
    label: "হালনাগাদ ট্রেড লাইসেন্সের কপি (দূতাবাসের নিয়ম অনুযায়ী ইংরেজিতে অনূদিত ও নোটারাইজড)",
  },
  business_bank_statement_6_months: {
    label: "ব্যবসায়িক ব্যাংক স্টেটমেন্ট — সর্বশেষ ৬ মাসের, ব্যাংকের স্বাক্ষর ও সিলসহ",
  },
  tin_certificate: {
    label: "টিআইএন (TIN) সার্টিফিকেটের কপি",
  },
  business_visiting_card: {
    label: "ব্যবসায়িক ভিজিটিং কার্ড",
  },
  incorporation_documents: {
    label: "সার্টিফিকেট অব ইনকরপোরেশন + মেমোরেন্ডাম ও আর্টিকেলস অব অ্যাসোসিয়েশন",
    note: "শুধুমাত্র লিমিটেড কোম্পানির ক্ষেত্রে প্রযোজ্য।",
  },
  partnership_deed: {
    label: "অংশীদারি দলিল (Partnership Deed)-এর কপি",
    note: "শুধুমাত্র অংশীদারি ব্যবসা প্রতিষ্ঠানের ক্ষেত্রে প্রযোজ্য।",
  },
  chamber_membership_certificate: {
    label: "চেম্বার অব কমার্স / ট্রেড বডি সদস্যপদ সনদপত্র",
  },

  // Employee
  employer_noc_letter: {
    label:
      "নিয়োগকর্তার NOC / ছুটি অনুমোদন পত্র — প্রতিষ্ঠানের প্যাডে (পদবি, যোগদানের তারিখ, বেতন, ছুটির তারিখ ও যাচাইয়ের জন্য অফিসের যোগাযোগ নম্বরসহ)",
  },
  salary_certificate: {
    label: "নিয়োগকর্তা কর্তৃক প্রদত্ত বেতন সনদপত্র (Salary Certificate)",
  },
  pay_slips: {
    label: "বেতনের পে-স্লিপ — সর্বশেষ ৩ থেকে ৬ মাসের",
  },
  employment_id_card_copy: {
    label: "অফিস / চাকরির আইডি কার্ডের কপি",
  },
  appointment_letter_copy: {
    label: "নিয়োগপত্র (Appointment / Joining Letter)-এর কপি",
  },
};

export const SECTION_INTROS_BN: Record<string, string> = {
  "General Information":
    "আপনার নাম, পাসপোর্ট নম্বর, সচল মোবাইল নম্বর এবং বর্তমান ঠিকানা লিখুন।",
  "Work Information":
    "আপনার বর্তমান কর্মসংস্থান ও প্রতিষ্ঠানের বিস্তারিত তথ্য লিখুন।",
  "Work/Study Information":
    "আপনি বর্তমানে যে স্কুল, কলেজ বা বিশ্ববিদ্যালয়ে পড়াশোনা করছেন তার তথ্য লিখুন।",
  "Educational Information":
    "আপনার শিক্ষাগত যোগ্যতার তথ্য দিন (সর্বশেষ শিক্ষাগত যোগ্যতা অবশ্যই পূরণ করতে হবে)।",
  "Travel Information":
    "আপনি কোন শহরে থাকবেন, কবে যাবেন, কবে ফিরবেন এবং সর্বোচ্চ কত দিন থাকবেন তা লিখুন।",
  "Personal Information":
    "আপনার পাসপোর্ট অনুযায়ী ব্যক্তিগত তথ্যগুলো নির্ভুলভাবে লিখুন।",
  "Family Information":
    "পিতা-মাতার তথ্য অবশ্যই দিন; বিবাহিত হলে স্বামী/স্ত্রী এবং সন্তান থাকলে তাদের তথ্য দিন।",
  Passport:
    "আপনার পাসপোর্ট দেখে নম্বর ও তারিখগুলো অত্যন্ত সতর্কতার সাথে লিখুন।",
  Contact:
    "আপনার বর্তমান ঠিকানা, সচল ইমেইল এবং চালু বাংলাদেশি মোবাইল নম্বর দিন।",
  "Travel Plan":
    "আপনি কবে ভ্রমণে যাবেন, কবে ফিরবেন এবং কোথায় থাকবেন তা লিখুন।",
  "Host / Invitation":
    "গন্তব্য দেশে কেউ আপনাকে আমন্ত্রণ জানিয়ে থাকলে তাঁর তথ্য দিন (হোটেলে থাকলে খালি রাখতে পারেন)।",
  Financial: "আপনার ভ্রমণ ও অবস্থানের খরচ কে কীভাবে বহন করবেন তা জানান।",
  "Travel History": "আপনার পূর্বের ভ্রমণ, ভিসা বা ভিসা প্রত্যাখ্যানের তথ্য সততার সাথে দিন।",
  "Education (Student)":
    "আপনি বর্তমানে যে স্কুল, কলেজ বা বিশ্ববিদ্যালয়ে পড়াশোনা করছেন তার বিস্তারিত তথ্য দিন।",
  "Sponsor (Student)":
    "আপনার ভ্রমণের খরচ যিনি বহন করছেন (যেমন পিতা/মাতা বা অভিভাবক) তাঁর তথ্য দিন।",
  "Business (Businessman)":
    "আপনার ব্যবসা প্রতিষ্ঠান, ট্রেড লাইসেন্স ও টিআইএন (TIN) সংক্রান্ত তথ্য লিখুন।",
  "Employment (Employee)":
    "আপনার কর্মস্থল, পদবি, মাসিক বেতন এবং অনুমোদিত ছুটির তারিখ লিখুন।",
};

