import { FormLanguage } from "@/store/language-store";
import { toBanglaDigits } from "./i18n/bangla-data";

export function toSimpleFieldName(label: string): string {
  const withoutDashNote = label.replace(/\s*—\s*repeating table\s*$/i, "");
  const withoutParens = withoutDashNote
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const cleaned = (withoutParens || label).replace(/^applicant's\s+/i, "").trim();
  return cleaned.toLowerCase();
}

export const ERROR_MESSAGES = {
  requiredField: (label: string): string =>
    `Please write your ${toSimpleFieldName(label)}.`,
  requiredFile: (label: string): string =>
    `Please give your ${toSimpleFieldName(label)}.`,
  wrongEmail: "This email does not look right. Please check and write again.",
  emailTooLong: "Email address must be 70 characters or fewer.",
  wrongPhone: "Please write a correct phone number.",
  invalidBdPhone: "Enter a valid Bangladeshi mobile number (01XXXXXXXXX).",
  passportLength: "Passport number must be exactly 9 characters.",
  passportFormat: "Passport number must be 9 letters and numbers (e.g. A01234567).",
  previousPassportsInvalid:
    "Previous passport numbers can only contain letters, numbers, commas, slashes, or hyphens.",
  tuitionInvalid: "Tuition fee can contain numbers only, maximum 8 digits.",
  nidInvalid: "NID number must be 10, 13 or 17 digits.",
  tinInvalid: "TIN number must be exactly 12 digits.",
  tradeLicenceInvalid: "Enter a valid Trade Licence number (must include digits).",
  numbersNotAllowed: "Numbers are not allowed in this field.",
  mustContainLetter: "Please enter valid text (letters are required).",
  maxLengthExceeded: (max: number): string => `Must be ${max} characters or fewer.`,
  minLengthRequired: (min: number): string => `Please write at least ${min} characters.`,
  wholeNumber: "Please enter a whole number.",
  durationRange: "Duration of stay must be between 1 and 365 days.",
  childrenRange: "Number of children must be between 0 and 20.",
  numberOutOfRange: "Please enter a realistic positive number.",
  pastDate: "This date has already passed. Please choose a future date.",
  pastOrTodayDate: "Please choose a date on or before today.",
  invalidDateRange: "Please choose a valid date between 1900 and 2100.",
  dobPast: "Date of birth must be in the past.",
  dobAgeRange: "Applicant age at travel must be between 0 and 100 years.",
  parentDobAfterApplicant:
    "Parent's date of birth must be before the applicant's date of birth.",
  passportIssueBeforeDob: "Passport issue date cannot be before your date of birth.",
  dateAfterDob: "This date must be after your date of birth.",
  passportIssueBeforeToday: "Passport issue date must be before today.",
  passportIssueBeforeExpiry: "Passport issue date must be before the expiry date.",
  passportBeforeTravel:
    "Your passport will expire before your travel date. Please check the dates.",
  passportSixMonthsAfterDeparture:
    "Your passport must be valid for at least 6 months after your departure date.",
  departureAfterArrival: "Departure date must be after your arrival date.",
  courseEndBeforeStart: "Course end date cannot be before the start date.",
  expectedCompletionBeforeStart:
    "Expected completion date cannot be before your study start date.",
  yearsInvalid: "Please enter valid years (e.g. 2018 - 2022).",
  fileTooBig: "This file is too big. Please give a file smaller than 10 MB.",
  wrongFileType: "Only PDF or photo (JPG/PNG) files are allowed here.",
  uploadFailed:
    "Your file could not be sent. Please check your internet and try again.",
  loginWrong: "Email or password is wrong. Please try again.",
  loginTooManyTries: "Too many tries. Please wait 15 minutes and try again.",
  sessionExpired: "You have been logged out. Please log in again.",
  serverError:
    "Something went wrong on our side. Please try again in a few minutes.",
  formNotFound:
    "This link is not correct. Please contact the IGL Visa Help office.",
  genericValidation: "Please check the marked boxes and try again.",
  otpRequired: "Please verify your mobile number with an OTP code before submitting.",
  otpWrong: "Code is wrong. Please check the 6-digit code and try again.",
  otpExpired: "Code expired — tap Resend for a new one.",
  otpTooManyAttempts:
    "Too many wrong tries. This code is no longer valid — tap Resend for a new one.",
  otpTooManySends:
    "You have asked for too many codes. Please wait 15 minutes and try again.",
  otpUnavailable:
    "Phone verification is not available right now. Please contact the IGL Visa Help office.",
  otpSmsFailed:
    "We could not send the code right now. Please try again in a few minutes.",
  otpPhoneMismatch:
    "Your verified phone number does not match the primary mobile number on the form. Please verify again.",
  otpAlreadyUsed:
    "This verification code has already been used. Please request a new code.",
  otpRateLimit: "Too many verification tries. Please wait 15 minutes and try again.",
  otpPhoneBlocked:
    "This number cannot receive a verification code. Please contact our office.",
  phoneAlreadyBlocked: "This mobile number is already blocked.",
} as const;

const EXACT_BANGLA_ERRORS: Record<string, string> = {
  [ERROR_MESSAGES.wrongEmail]: "ইমেইল ঠিকানাটি সঠিক নয়। দয়া করে আবার যাচাই করুন।",
  [ERROR_MESSAGES.emailTooLong]: "ইমেইল ঠিকানা সর্বোচ্চ ৭০ অক্ষরের মধ্যে হতে হবে।",
  [ERROR_MESSAGES.wrongPhone]: "সঠিক ফোন নম্বর লিখুন।",
  [ERROR_MESSAGES.invalidBdPhone]:
    "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01 দিয়ে শুরু ১১ ডিজিট)।",
  [ERROR_MESSAGES.passportLength]: "পাসপোর্ট নম্বর ঠিক ৯ অক্ষরের হতে হবে।",
  [ERROR_MESSAGES.passportFormat]:
    "পাসপোর্ট নম্বর ৯ অক্ষরের হতে হবে এবং এতে ইংরেজি অক্ষর ও সংখ্যা থাকতে হবে (যেমন: A01234567)।",
  [ERROR_MESSAGES.previousPassportsInvalid]:
    "পূর্ববর্তী পাসপোর্ট নম্বরে শুধুমাত্র অক্ষর, সংখ্যা, কমা, স্ল্যাশ বা হাইফেন ব্যবহার করা যাবে।",
  [ERROR_MESSAGES.tuitionInvalid]:
    "টিউশন ফি শুধু সংখ্যায় হতে হবে (সর্বোচ্চ ৮ ডিজিট)।",
  [ERROR_MESSAGES.nidInvalid]: "এনআইডি (NID) নম্বর ১০, ১৩ অথবা ১৭ ডিজিটের হতে হবে।",
  [ERROR_MESSAGES.tinInvalid]: "টিআইএন (TIN) নম্বর ঠিক ১২ ডিজিটের হতে হবে।",
  [ERROR_MESSAGES.tradeLicenceInvalid]:
    "সঠিক ট্রেড লাইসেন্স নম্বর লিখুন (সংখ্যা থাকতে হবে)।",
  [ERROR_MESSAGES.numbersNotAllowed]: "এই ঘরে কোনো সংখ্যা লেখা যাবে না।",
  [ERROR_MESSAGES.mustContainLetter]:
    "অনুগ্রহ করে সঠিক তথ্য লিখুন (অক্ষর থাকতে হবে)।",
  [ERROR_MESSAGES.wholeNumber]: "অনুগ্রহ করে পূর্ণ সংখ্যা লিখুন।",
  [ERROR_MESSAGES.durationRange]:
    "অবস্থানের সময়কাল ১ থেকে ৩৬৫ দিনের মধ্যে হতে হবে।",
  [ERROR_MESSAGES.childrenRange]: "সন্তানের সংখ্যা ০ থেকে ২০-এর মধ্যে হতে হবে।",
  [ERROR_MESSAGES.numberOutOfRange]: "অনুগ্রহ করে একটি সঠিক ধনাত্মক সংখ্যা লিখুন।",
  [ERROR_MESSAGES.pastDate]:
    "এই তারিখটি পার হয়ে গেছে। অনুগ্রহ করে সামনের কোনো তারিখ দিন।",
  [ERROR_MESSAGES.pastOrTodayDate]: "আজকের বা তার আগের কোনো তারিখ বেছে নিন।",
  [ERROR_MESSAGES.invalidDateRange]:
    "অনুগ্রহ করে ১৯০০ থেকে ২১০০ সালের মধ্যে সঠিক তারিখ বেছে নিন।",
  [ERROR_MESSAGES.dobPast]: "জন্মতারিখ অবশ্যই আজকের আগের হতে হবে।",
  [ERROR_MESSAGES.dobAgeRange]: "ভ্রমণের সময় আবেদনকারীর বয়স ০ থেকে ১০০ বছরের মধ্যে হতে হবে।",
  [ERROR_MESSAGES.parentDobAfterApplicant]:
    "পিতা/মাতার জন্মতারিখ অবশ্যই আবেদনকারীর জন্মতারিখের আগে হতে হবে।",
  [ERROR_MESSAGES.passportIssueBeforeDob]:
    "পাসপোর্ট ইস্যুর তারিখ জন্মতারিখের আগে হতে পারবে না।",
  [ERROR_MESSAGES.dateAfterDob]:
    "এই তারিখটি অবশ্যই আপনার জন্মতারিখের পরের হতে হবে।",
  [ERROR_MESSAGES.passportIssueBeforeToday]:
    "পাসপোর্ট ইস্যুর তারিখ আজকের আগের হতে হবে।",
  [ERROR_MESSAGES.passportIssueBeforeExpiry]:
    "পাসপোর্ট ইস্যুর তারিখ মেয়াদ শেষ হওয়ার তারিখের আগে হতে হবে।",
  [ERROR_MESSAGES.passportBeforeTravel]:
    "ভ্রমণের তারিখের আগেই পাসপোর্টের মেয়াদ শেষ হয়ে যাচ্ছে। তারিখ যাচাই করুন।",
  [ERROR_MESSAGES.passportSixMonthsAfterDeparture]:
    "ফেরার তারিখের পরও পাসপোর্টের মেয়াদ কমপক্ষে ৬ মাস থাকতে হবে।",
  [ERROR_MESSAGES.departureAfterArrival]:
    "ফেরার তারিখ অবশ্যই পৌঁছানোর তারিখের পরের হতে হবে।",
  [ERROR_MESSAGES.courseEndBeforeStart]:
    "কোর্স শেষ হওয়ার তারিখ শুরুর তারিখের আগে হতে পারবে না।",
  [ERROR_MESSAGES.expectedCompletionBeforeStart]:
    "পড়াশোনা শেষ হওয়ার সম্ভাব্য তারিখ শুরুর তারিখের আগে হতে পারবে না।",
  [ERROR_MESSAGES.yearsInvalid]:
    "সঠিক শিক্ষাবর্ষ লিখুন (যেমন: 2018 - 2022)।",
  [ERROR_MESSAGES.fileTooBig]: "ফাইলের আকার ১০ মেগাবাইটের বেশি। ছোট ফাইল দিন।",
  [ERROR_MESSAGES.wrongFileType]: "শুধুমাত্র PDF, JPG বা PNG ফাইল আপলোড করা যাবে।",
  [ERROR_MESSAGES.uploadFailed]:
    "ফাইল পাঠানো যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
  [ERROR_MESSAGES.genericValidation]:
    "লাল চিহ্নিত ঘরগুলো সঠিকভাবে পূরণ করে আবার চেষ্টা করুন।",
  [ERROR_MESSAGES.otpRequired]:
    "আবেদন পাঠানোর আগে মোবাইল নম্বরে আসা OTP কোড দিয়ে যাচাই করুন।",
  [ERROR_MESSAGES.otpWrong]:
    "কোডটি ভুল হয়েছে। ৬ ডিজিটের কোডটি মিলিয়ে আবার লিখুন।",
  [ERROR_MESSAGES.otpExpired]:
    'কোডের মেয়াদ শেষ হয়েছে — নতুন কোড পেতে "পুনরায় কোড পাঠান" চাপুন।',
  [ERROR_MESSAGES.otpTooManyAttempts]:
    'অনেকবার ভুল কোড দেওয়া হয়েছে। নতুন কোড পেতে "পুনরায় কোড পাঠান" চাপুন।',
  [ERROR_MESSAGES.otpTooManySends]:
    "বারবার কোড চাওয়া হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।",
  [ERROR_MESSAGES.otpUnavailable]:
    "এই মুহূর্তে ফোন যাচাই সেবা চালু নেই। আইজিএল ভিসা হেল্প অফিসে যোগাযোগ করুন।",
  [ERROR_MESSAGES.otpSmsFailed]:
    "কোড পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
  [ERROR_MESSAGES.otpPhoneMismatch]:
    "যাচাই করা নম্বরটি ফর্মের মূল মোবাইল নম্বরের সাথে মিলছে না। আবার যাচাই করুন।",
  [ERROR_MESSAGES.otpAlreadyUsed]:
    "এই কোডটি আগে ব্যবহার করা হয়েছে। নতুন কোড নিয়ে চেষ্টা করুন।",
  [ERROR_MESSAGES.otpRateLimit]:
    "অনেকবার চেষ্টা করা হয়েছে। ১৫ মিনিট অপেক্ষা করে আবার চেষ্টা করুন।",
  [ERROR_MESSAGES.otpPhoneBlocked]:
    "এই নম্বরে যাচাই কোড পাঠানো যাবে না। অনুগ্রহ করে আমাদের অফিসে যোগাযোগ করুন।",
  [ERROR_MESSAGES.phoneAlreadyBlocked]:
    "এই মোবাইল নম্বরটি ইতোমধ্যেই ব্লক করা আছে।",
  [ERROR_MESSAGES.serverError]:
    "আমাদের সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
  [ERROR_MESSAGES.formNotFound]:
    "এই লিংকটি সঠিক নয়। অনুগ্রহ করে আইজিএল ভিসা হেল্প অফিসে যোগাযোগ করুন।",
  [ERROR_MESSAGES.loginTooManyTries]:
    "অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে ১৫ মিনিট পর আবার চেষ্টা করুন।",
  [ERROR_MESSAGES.sessionExpired]:
    "আপনার সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।",
  "Please write a valid number.": "অনুগ্রহ করে একটি সঠিক সংখ্যা লিখুন।",
  "Please choose a valid date.": "অনুগ্রহ করে একটি সঠিক তারিখ বেছে নিন।",
  "Please choose your destination country first.":
    "অনুগ্রহ করে প্রথমে আপনার গন্তব্য দেশ নির্বাচন করুন।",
  "Please choose your profession to continue.":
    "পরবর্তী ধাপে যেতে অনুগ্রহ করে আপনার পেশা নির্বাচন করুন।",
  "Please fix the marked boxes before saving.":
    "সংরক্ষণ করার আগে লাল চিহ্নিত ঘরগুলো ঠিক করুন।",
  "Could not load form details for this country.":
    "এই দেশের ফর্মের তথ্য লোড করা যায়নি।",
};

export function getBanglaError(
  message: string | null | undefined,
  localizedItemLabel?: string,
): string | null {
  if (!message) return null;
  if (EXACT_BANGLA_ERRORS[message]) {
    return EXACT_BANGLA_ERRORS[message];
  }
  const maxLenMatch = /^Must be (\d+) characters or fewer\.$/.exec(message);
  if (maxLenMatch?.[1]) {
    return `সর্বোচ্চ ${toBanglaDigits(maxLenMatch[1])} অক্ষরের মধ্যে লিখুন।`;
  }
  const minLenMatch = /^Please write at least (\d+) characters\.$/.exec(message);
  if (minLenMatch?.[1]) {
    return `কমপক্ষে ${toBanglaDigits(minLenMatch[1])} অক্ষর লিখুন।`;
  }
  if (message.startsWith("Please write your ")) {
    if (localizedItemLabel) {
      return `অনুগ্রহ করে "${localizedItemLabel}" সঠিকভাবে লিখুন।`;
    }
    return "অনুগ্রহ করে এই তথ্যটি সঠিকভাবে লিখুন।";
  }
  if (message.startsWith("Please give your ")) {
    if (localizedItemLabel) {
      return `অনুগ্রহ করে "${localizedItemLabel}" আপলোড করুন।`;
    }
    return "অনুগ্রহ করে এই কাগজটি আপলোড করুন।";
  }
  return null;
}

export function localizeErrorMessage(
  message: string | null | undefined,
  language: FormLanguage,
  localizedItemLabel?: string,
): string {
  if (!message) return "";
  if (language === "bn") {
    return getBanglaError(message, localizedItemLabel) ?? message;
  }
  return message;
}
