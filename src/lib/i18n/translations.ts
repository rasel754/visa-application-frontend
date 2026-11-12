import { FormLanguage } from "@/store/language-store";
import { toBanglaDigits } from "./bangla-data";

export interface UiStrings {
  brandName: string;
  brandSubtitle: string;
  navHome: string;
  navAdminLogin: string;
  navPersonalFormLink: string;
  languageLabel: string;
  optionalTag: string;
  requiredAria: string;
  backButton: string;
  continueButton: string;
  chooseOptionPlaceholder: string;
  searchOptionsPlaceholder: string;
  noOptionsFound: string;
  clearDateAria: string;
  selectDatePlaceholder: string;
  fixThisButton: string;
  home: {
    heroTitle: string;
    heroSubtitle: string;
    startApplication: string;
    howItWorksTitle: string;
    steps: Array<{
      number: string;
      title: string;
      subtitle: string;
    }>;
    afterSendTitle: string;
    afterSendBody: string;
    countriesSupported: string;
    autoSaves: string;
    footerSubtitle: string;
  };
  progress: {
    stepOf: (current: number, total: number, name: string) => string;
    percent: (pct: number) => string;
    stepCountry: string;
    stepProfession: string;
    stepDocuments: string;
    stepReview: string;
  };
  countrySelect: {
    title: string;
    subtitle: string;
    placeholder: string;
    searchPlaceholder: string;
    emptyText: string;
    selectedLabel: string;
    visitVisaLabel: string;
    availableHint: string;
  };
  professionSelect: {
    loadingForCountry: (countryName: string) => string;
    loadFailedFallback: string;
    bannerPrefix: string;
    officialFormPrefix: string;
    title: string;
    subtitle: string;
  };
  wizard: {
    loadingForm: string;
    loadingQuestions: string;
    backToHome: string;
    resumeTitle: string;
    resumeBody: string;
    resumeContinue: string;
    resumeStartAgain: string;
    requiredLegendBeforeStar: string;
    requiredLegendMiddle: string;
    requiredLegendAfterOptional: string;
    docsTitle: string;
    docsSubtitle: string;
    docsRuleNoticeBeforeBadge: string;
    docsRuleBadge: string;
    docsRuleNoticeAfterBadge: string;
    commonDocsHeading: string;
    additionalDocsHeading: (professionDisplay: string) => string;
    sendingOtp: string;
    sendOtpAndSubmit: string;
    chooseCountryFirst: string;
    chooseProfessionFirst: string;
    finishEditingSectionFirst: (sectionName: string) => string;
    otpSentToast: string;
    otpResentToast: string;
    applicationSentToast: string;
  };
  dynamicField: {
    rowTitle: (rowNum: number) => string;
    removeRow: string;
    addRow: string;
  };
  documentCard: {
    mustGiveBadge: string;
    optionalBadge: string;
    readyToSend: string;
    replace: string;
    remove: string;
    chooseFileButton: string;
    dragAndDropHint: string;
  };
  review: {
    title: string;
    subtitle: string;
    fixAttentionTitle: string;
    selectedApplication: string;
    country: string;
    visaType: string;
    visitVisaValue: string;
    profession: string;
    edit: string;
    cancel: string;
    save: string;
    fixMarkedBeforeSaveToast: string;
    sectionUpdatedToast: (sectionName: string) => string;
    documentUpdatedToast: string;
    missingRow: string;
    notGiven: string;
    missingOrNeedsFix: string;
    notWrittenOptional: string;
    documentsTitle: string;
    fileFormatHint: string;
    commonDocsLabel: string;
    additionalDocsLabel: (professionDisplay: string) => string;
    uploadedBadge: string;
    missingMustGiveBadge: string;
    notGivenOptionalBadge: string;
    filePrefix: string;
    uploadButton: string;
  };
  otp: {
    title: string;
    sentToPrompt: string;
    devModeLabel: string;
    enterCodeLabel: string;
    expiredBadge: string;
    validInfo: string;
    expiredAlert: string;
    verifyingAndSubmitting: string;
    verifyAndSubmit: string;
    sendingNewCode: string;
    resendIn: (seconds: number) => string;
    resendCode: string;
    backToReview: string;
  };
  success: {
    title: string;
    submissionNumberLabel: string;
    saveNumberHint: string;
    officeFollowup: string;
    downloadPdf: string;
    backToHome: string;
    emptyTitle: string;
    emptyBody: string;
    goToForm: string;
  };
}

const EN_STRINGS: UiStrings = {
  brandName: "IGL Visa Help",
  brandSubtitle: "Visa Application Center",
  navHome: "Home",
  navAdminLogin: "Admin Login",
  navPersonalFormLink: "Personal Form Link",
  languageLabel: "Language",
  optionalTag: "(Optional)",
  requiredAria: "required",
  backButton: "Back",
  continueButton: "Continue",
  chooseOptionPlaceholder: "Choose an option",
  searchOptionsPlaceholder: "Type to search options...",
  noOptionsFound: "No matching result found.",
  clearDateAria: "Clear date",
  selectDatePlaceholder: "Select date",
  fixThisButton: "Fix this",
  home: {
    heroTitle: "Apply for your visa in a few easy steps",
    heroSubtitle:
      "Fill out your visa form online on your phone or computer and download your PDF copy right away.",
    startApplication: "Start Application",
    howItWorksTitle: "How it works",
    steps: [
      {
        number: "1",
        title: "Choose Country",
        subtitle: "Pick the country you want to visit.",
      },
      {
        number: "2",
        title: "Choose Your Profession",
        subtitle: "Visit Visa — Student, Businessman, or Employee.",
      },
      {
        number: "3",
        title: "Fill Out the Form",
        subtitle: "Enter your general, work, education, family, and travel details.",
      },
      {
        number: "4",
        title: "Verify Mobile & Download PDF",
        subtitle: "Confirm via OTP and get your form number right away.",
      },
    ],
    afterSendTitle: "What happens after you send?",
    afterSendBody:
      "Our office will check your information and contact you by phone.",
    countriesSupported: "100 Countries Supported",
    autoSaves: "Saves Automatically on Your Device",
    footerSubtitle: "Bangladesh Visa Application Assistance",
  },
  progress: {
    stepOf: (current, total, name) => `Step ${current} of ${total}: ${name}`,
    percent: (pct) => `${pct}%`,
    stepCountry: "Country",
    stepProfession: "Profession",
    stepDocuments: "Documents",
    stepReview: "Check & Send",
  },
  countrySelect: {
    title: "Which country do you want to visit?",
    subtitle: "Tap the box below and type the country name to search and select.",
    placeholder: "Select your destination country",
    searchPlaceholder: "Type country name (e.g. Malaysia, India, UAE)...",
    emptyText: "No country found. Please check the spelling.",
    selectedLabel: "Selected Destination",
    visitVisaLabel: "Visit / Tourist Visa",
    availableHint:
      "100 countries available. Tap above and start typing the country name.",
  },
  professionSelect: {
    loadingForCountry: (countryName) =>
      `Loading ${countryName} visit visa requirements...`,
    loadFailedFallback: "Could not load form details for this country.",
    bannerPrefix: "Visit / Tourist Visa",
    officialFormPrefix: "Official form:",
    title: "What is your current profession?",
    subtitle: "Tap the card that matches what you currently do.",
  },
  wizard: {
    loadingForm: "Loading your application form...",
    loadingQuestions: "Loading form questions...",
    backToHome: "Back to Home",
    resumeTitle: "Continue your saved form?",
    resumeBody:
      "We found answers you wrote earlier on this device. Would you like to continue where you stopped, or start a new form?",
    resumeContinue: "Continue",
    resumeStartAgain: "Start again",
    requiredLegendBeforeStar: "Boxes with",
    requiredLegendMiddle: "must be filled. Boxes marked",
    requiredLegendAfterOptional: "can be left blank if not needed.",
    docsTitle: "Upload Your Documents",
    docsSubtitle: "Give a photo or PDF of your papers.",
    docsRuleNoticeBeforeBadge:
      "Only PDF, JPG, or PNG files are allowed (max 10 MB per file). Boxes marked",
    docsRuleBadge: "Must give",
    docsRuleNoticeAfterBadge: "are required before sending.",
    commonDocsHeading: "Common Documents (For All Applicants)",
    additionalDocsHeading: (prof) => `Additional Documents for ${prof}`,
    sendingOtp: "Sending OTP…",
    sendOtpAndSubmit: "Send OTP & Submit",
    chooseCountryFirst: "Please choose your destination country first.",
    chooseProfessionFirst: "Please choose your profession to continue.",
    finishEditingSectionFirst: (sec) =>
      `Please tap Save or Cancel on "${sec}" before submitting.`,
    otpSentToast: "Verification code sent to your mobile number.",
    otpResentToast: "New verification code sent.",
    applicationSentToast: "Application sent successfully!",
  },
  dynamicField: {
    rowTitle: (n) => `Row ${n}`,
    removeRow: "Remove Row",
    addRow: "Add Row",
  },
  documentCard: {
    mustGiveBadge: "Must give",
    optionalBadge: "Optional",
    readyToSend: "Ready to send",
    replace: "Replace",
    remove: "Remove",
    chooseFileButton: "Choose File (Photo or PDF)",
    dragAndDropHint: "Or drag and drop here. Only PDF, JPG, or PNG — max 10 MB.",
  },
  review: {
    title: "Check your answers before sending",
    subtitle:
      'Look through everything carefully. Tap "Edit" on any box to fix it right here, then tap "Send OTP & Submit".',
    fixAttentionTitle:
      "Some boxes still need your attention before you can send:",
    selectedApplication: "Selected Application",
    country: "Country",
    visaType: "Visa Type",
    visitVisaValue: "Visit Visa",
    profession: "Profession",
    edit: "Edit",
    cancel: "Cancel",
    save: "Save",
    fixMarkedBeforeSaveToast: "Please fix the marked boxes before saving.",
    sectionUpdatedToast: (sec) => `${sec} updated.`,
    documentUpdatedToast: "Document file updated.",
    missingRow: "Missing — please add at least one row",
    notGiven: "Not given",
    missingOrNeedsFix: "Missing / needs fix",
    notWrittenOptional: "Not written (Optional)",
    documentsTitle: "Documents",
    fileFormatHint: "PDF, JPG, or PNG (max 10 MB)",
    commonDocsLabel: "Common Documents",
    additionalDocsLabel: (prof) => `Additional Documents (${prof})`,
    uploadedBadge: "Uploaded",
    missingMustGiveBadge: "Missing (Must give)",
    notGivenOptionalBadge: "Not given (Optional)",
    filePrefix: "File:",
    uploadButton: "Upload",
  },
  otp: {
    title: "Verify Your Mobile Number",
    sentToPrompt: "We sent a 6-digit verification code to:",
    devModeLabel: "Local Test Mode OTP:",
    enterCodeLabel: "Enter 6-Digit Code",
    expiredBadge: "Expired",
    validInfo: "Code is valid for 5 minutes. Maximum 5 wrong tries allowed.",
    expiredAlert: "Code expired — tap Resend for a new one.",
    verifyingAndSubmitting: "Verifying & Submitting...",
    verifyAndSubmit: "Verify & Submit Application",
    sendingNewCode: "Sending new code...",
    resendIn: (s) => `Resend in ${s}s`,
    resendCode: "Resend Code",
    backToReview: "Back to Review",
  },
  success: {
    title: "Your application has been sent!",
    submissionNumberLabel: "Your Submission Number",
    saveNumberHint:
      "Save this number. Give it if you call or visit the IGL Visa Help office.",
    officeFollowup: "Our office will check your information and call you.",
    downloadPdf: "Download Your PDF",
    backToHome: "Back to Home",
    emptyTitle: "No recent submission found",
    emptyBody:
      "If you have not sent your form yet, you can start or continue your application below.",
    goToForm: "Go to Application Form",
  },
};

const BN_STRINGS: UiStrings = {
  brandName: "আইজিএল ভিসা হেল্প",
  brandSubtitle: "ভিসা আবেদন সহায়তা কেন্দ্র",
  navHome: "হোম",
  navAdminLogin: "অ্যাডমিন লগইন",
  navPersonalFormLink: "ব্যক্তিগত ফর্ম লিংক",
  languageLabel: "ভাষা",
  optionalTag: "(ঐচ্ছিক)",
  requiredAria: "অবশ্যই পূরণীয়",
  backButton: "পূর্ববর্তী",
  continueButton: "পরবর্তী ধাপ",
  chooseOptionPlaceholder: "একটি বিকল্প নির্বাচন করুন",
  searchOptionsPlaceholder: "খুঁজতে এখানে লিখুন...",
  noOptionsFound: "কোনো মিল পাওয়া যায়নি।",
  clearDateAria: "তারিখ মুছুন",
  selectDatePlaceholder: "তারিখ নির্বাচন করুন",
  fixThisButton: "ঠিক করুন",
  home: {
    heroTitle: "কয়েকটি সহজ ধাপে আপনার ভিসার আবেদন করুন",
    heroSubtitle:
      "আপনার মোবাইল বা কম্পিউটার থেকে অনলাইনে ভিসা ফর্ম পূরণ করুন এবং সাথে সাথেই পিডিএফ (PDF) কপি ডাউনলোড করুন।",
    startApplication: "আবেদন শুরু করুন",
    howItWorksTitle: "কীভাবে আবেদন করবেন",
    steps: [
      {
        number: "১",
        title: "দেশ নির্বাচন করুন",
        subtitle: "আপনি যে দেশে ভ্রমণ করতে চান সেই দেশটি বেছে নিন।",
      },
      {
        number: "২",
        title: "আপনার পেশা নির্বাচন করুন",
        subtitle: "ভিজিট ভিসা — শিক্ষার্থী, ব্যবসায়ী অথবা চাকরিজীবী।",
      },
      {
        number: "৩",
        title: "আবেদন ফর্ম পূরণ করুন",
        subtitle: "সাধারণ, কর্মসংস্থান, শিক্ষা, পরিবার ও ভ্রমণের তথ্য লিখুন।",
      },
      {
        number: "৪",
        title: "মোবাইল যাচাই ও PDF ডাউনলোড",
        subtitle: "OTP কোড দিয়ে নিশ্চিত করুন এবং তাৎক্ষণিক আবেদন নম্বর ও PDF নিন।",
      },
    ],
    afterSendTitle: "আবেদন পাঠানোর পর কী হবে?",
    afterSendBody:
      "ফর্ম পাঠানোর পর আমাদের অফিস আপনার তথ্য যাচাই করে ফোনে যোগাযোগ করবে।",
    countriesSupported: "১০০টি দেশের ভিসা সহায়তা",
    autoSaves: "আপনার ডিভাইসে স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়",
    footerSubtitle: "বাংলাদেশ ভিসা আবেদন সহায়তা সেবা",
  },
  progress: {
    stepOf: (current, total, name) =>
      `ধাপ ${toBanglaDigits(current)} / ${toBanglaDigits(total)}: ${name}`,
    percent: (pct) => `${toBanglaDigits(pct)}%`,
    stepCountry: "দেশ নির্বাচন",
    stepProfession: "পেশা নির্বাচন",
    stepDocuments: "কাগজপত্র আপলোড",
    stepReview: "যাচাই ও জমা",
  },
  countrySelect: {
    title: "আপনি কোন দেশে ভ্রমণ করতে চান?",
    subtitle: "নিচের বক্সে ট্যাপ করে দেশের নাম বাংলা বা ইংরেজিতে লিখে বেছে নিন।",
    placeholder: "আপনার গন্তব্য দেশ নির্বাচন করুন",
    searchPlaceholder: "দেশের নাম লিখুন (যেমন: মালয়েশিয়া, ভারত, সংযুক্ত আরব আমিরাত)...",
    emptyText: "কোনো দেশ পাওয়া যায়নি। অনুগ্রহ করে বানান যাচাই করুন।",
    selectedLabel: "নির্বাচিত গন্তব্য দেশ",
    visitVisaLabel: "ভিজিট / ট্যুরিস্ট ভিসা",
    availableHint: "১০০টি দেশ উপলব্ধ রয়েছে। উপরে ট্যাপ করে দেশের নাম লিখুন।",
  },
  professionSelect: {
    loadingForCountry: (countryName) =>
      `${countryName}-এর ভিজিট ভিসার তথ্য ও শর্তাবলি লোড হচ্ছে...`,
    loadFailedFallback: "এই দেশের ফর্মের তথ্য লোড করা যায়নি।",
    bannerPrefix: "ভিজিট / ট্যুরিস্ট ভিসা",
    officialFormPrefix: "অফিসিয়াল ফর্ম:",
    title: "আপনার বর্তমান পেশা কী?",
    subtitle: "আপনি বর্তমানে কী করেন তা নিচের কার্ড থেকে বেছে নিন।",
  },
  wizard: {
    loadingForm: "আপনার আবেদন ফর্ম লোড হচ্ছে...",
    loadingQuestions: "ফর্মের প্রশ্নগুলো লোড হচ্ছে...",
    backToHome: "হোমে ফিরে যান",
    resumeTitle: "আগের সংরক্ষিত ফর্মটি থেকেই শুরু করবেন?",
    resumeBody:
      "এই ডিভাইসে আপনার পূর্বে লেখা তথ্য সংরক্ষিত আছে। আপনি কি আগের জায়গা থেকে চালিয়ে যেতে চান, নাকি নতুন করে শুরু করবেন?",
    resumeContinue: "আগেরটি চালিয়ে যান",
    resumeStartAgain: "নতুন করে শুরু করুন",
    requiredLegendBeforeStar: "যে ঘরগুলোতে",
    requiredLegendMiddle: "চিহ্ন রয়েছে সেগুলো অবশ্যই পূরণ করতে হবে।",
    requiredLegendAfterOptional: "লেখা ঘরগুলো প্রয়োজন না হলে খালি রাখতে পারেন।",
    docsTitle: "প্রয়োজনীয় কাগজপত্র আপলোড করুন",
    docsSubtitle: "আপনার কাগজপত্রের পরিষ্কার ছবি বা পিডিএফ (PDF) ফাইল দিন।",
    docsRuleNoticeBeforeBadge:
      "শুধুমাত্র PDF, JPG বা PNG ফাইল আপলোড করা যাবে (প্রতি ফাইলের সর্বোচ্চ আকার ১০ মেগাবাইট)। যেগুলোতে",
    docsRuleBadge: "অবশ্যই দিতে হবে",
    docsRuleNoticeAfterBadge: "লেখা আছে, জমা দেওয়ার আগে সেগুলো অবশ্যই আপলোড করতে হবে।",
    commonDocsHeading: "সাধারণ কাগজপত্র (সকল আবেদনকারীর জন্য)",
    additionalDocsHeading: (prof) => `অতিরিক্ত কাগজপত্র (${prof})`,
    sendingOtp: "OTP পাঠানো হচ্ছে…",
    sendOtpAndSubmit: "OTP পাঠান ও আবেদন জমা দিন",
    chooseCountryFirst: "অনুগ্রহ করে প্রথমে আপনার গন্তব্য দেশ নির্বাচন করুন।",
    chooseProfessionFirst: "পরবর্তী ধাপে যেতে অনুগ্রহ করে আপনার পেশা নির্বাচন করুন।",
    finishEditingSectionFirst: (sec) =>
      `জমা দেওয়ার আগে অনুগ্রহ করে "${sec}" অংশের সংরক্ষণ করুন বা বাতিল করুন বাটনে চাপুন।`,
    otpSentToast: "আপনার মোবাইল নম্বরে যাচাইকরণ কোড (OTP) পাঠানো হয়েছে।",
    otpResentToast: "নতুন যাচাইকরণ কোড পাঠানো হয়েছে।",
    applicationSentToast: "আপনার আবেদন সফলভাবে জমা হয়েছে!",
  },
  dynamicField: {
    rowTitle: (n) => `সারি ${toBanglaDigits(n)}`,
    removeRow: "সারি মুছুন",
    addRow: "নতুন সারি যোগ করুন",
  },
  documentCard: {
    mustGiveBadge: "অবশ্যই দিতে হবে",
    optionalBadge: "ঐচ্ছিক",
    readyToSend: "পাঠানোর জন্য প্রস্তুত",
    replace: "পরিবর্তন করুন",
    remove: "মুছে ফেলুন",
    chooseFileButton: "ফাইল বেছে নিন (ছবি বা PDF)",
    dragAndDropHint:
      "অথবা এখানে ফাইল টেনে এনে ছাড়ুন। শুধুমাত্র PDF, JPG বা PNG — সর্বোচ্চ ১০ মেগাবাইট।",
  },
  review: {
    title: "জমা দেওয়ার আগে আপনার সব তথ্য যাচাই করুন",
    subtitle:
      'সব তথ্য ভালোভাবে মিলিয়ে নিন। কোনো অংশ ঠিক করতে চাইলে সেই অংশের "সম্পাদনা করুন" বাটনে চাপ দিয়ে এখানেই সংশোধন করুন, এরপর "OTP পাঠান ও আবেদন জমা দিন" চাপুন।',
    fixAttentionTitle:
      "আবেদন জমা দেওয়ার আগে নিচের ঘরগুলো ঠিক করা প্রয়োজন:",
    selectedApplication: "নির্বাচিত আবেদনের বিবরণ",
    country: "গন্তব্য দেশ",
    visaType: "ভিসার ধরন",
    visitVisaValue: "ভিজিট ভিসা",
    profession: "পেশা",
    edit: "সম্পাদনা করুন",
    cancel: "বাতিল করুন",
    save: "সংরক্ষণ করুন",
    fixMarkedBeforeSaveToast: "সংরক্ষণ করার আগে লাল চিহ্নিত ঘরগুলো ঠিক করুন।",
    sectionUpdatedToast: (sec) => `${sec} হালনাগাদ করা হয়েছে।`,
    documentUpdatedToast: "কাগজপত্রের ফাইল হালনাগাদ করা হয়েছে।",
    missingRow: "তথ্য বাকি আছে — অনুগ্রহ করে কমপক্ষে একটি সারি যোগ করুন",
    notGiven: "দেওয়া হয়নি",
    missingOrNeedsFix: "তথ্য বাকি / সংশোধন প্রয়োজন",
    notWrittenOptional: "লেখা হয়নি (ঐচ্ছিক)",
    documentsTitle: "আপলোডকৃত কাগজপত্র",
    fileFormatHint: "PDF, JPG বা PNG (সর্বোচ্চ ১০ মেগাবাইট)",
    commonDocsLabel: "সাধারণ কাগজপত্র",
    additionalDocsLabel: (prof) => `অতিরিক্ত কাগজপত্র (${prof})`,
    uploadedBadge: "আপলোড সম্পন্ন",
    missingMustGiveBadge: "বাকি আছে (অবশ্যই দিতে হবে)",
    notGivenOptionalBadge: "দেওয়া হয়নি (ঐচ্ছিক)",
    filePrefix: "ফাইল:",
    uploadButton: "আপলোড করুন",
  },
  otp: {
    title: "আপনার মোবাইল নম্বর যাচাই করুন",
    sentToPrompt: "আমরা নিচের মোবাইল নম্বরে ৬ ডিজিটের একটি যাচাইকরণ কোড পাঠিয়েছি:",
    devModeLabel: "স্থানীয় টেস্ট মোড OTP:",
    enterCodeLabel: "৬ ডিজিটের কোড লিখুন",
    expiredBadge: "মেয়াদ শেষ",
    validInfo: "কোডটি ৫ মিনিট পর্যন্ত কার্যকর থাকবে। সর্বোচ্চ ৫ বার ভুল চেষ্টা করা যাবে।",
    expiredAlert:
      'কোডের মেয়াদ শেষ হয়ে গেছে — নতুন কোড পেতে "পুনরায় কোড পাঠান" বাটনে চাপুন।',
    verifyingAndSubmitting: "যাচাই ও আবেদন জমা হচ্ছে...",
    verifyAndSubmit: "যাচাই করে আবেদন জমা দিন",
    sendingNewCode: "নতুন কোড পাঠানো হচ্ছে...",
    resendIn: (s) => `পুনরায় পাঠান (${toBanglaDigits(s)} সে.)`,
    resendCode: "পুনরায় কোড পাঠান",
    backToReview: "তথ্য যাচাইয়ে ফিরে যান",
  },
  success: {
    title: "আপনার আবেদন সফলভাবে পাঠানো হয়েছে!",
    submissionNumberLabel: "আপনার আবেদন নম্বর",
    saveNumberHint:
      "এই নম্বরটি সংরক্ষণ করে রাখুন। আইজিএল ভিসা হেল্প অফিসে ফোন করলে বা সরাসরি এলে এই নম্বরটি জানাবেন।",
    officeFollowup: "আমাদের অফিস আপনার তথ্য যাচাই করে আপনাকে কল করবে।",
    downloadPdf: "আপনার PDF কপি ডাউনলোড করুন",
    backToHome: "হোমে ফিরে যান",
    emptyTitle: "সাম্প্রতিক কোনো জমা দেওয়া আবেদন পাওয়া যায়নি",
    emptyBody:
      "আপনি যদি এখনো ফর্ম পাঠিয়ে না থাকেন, তবে নিচে থেকে আবেদন শুরু বা চালিয়ে যেতে পারেন।",
    goToForm: "আবেদন ফর্মে যান",
  },
};

export function getUiStrings(language: FormLanguage): UiStrings {
  return language === "bn" ? BN_STRINGS : EN_STRINGS;
}

