"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Plus,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseYmdToLocalDate } from "@/components/ui/date-picker";
import { DynamicField } from "@/components/form/DynamicField";
import {
  addDaysToYmd,
  diffYmdInDays,
  getLocalizedSubgroupName,
} from "@/lib/field-helpers";
import { toBanglaDigits } from "@/lib/i18n/bangla-data";
import { AnswerValue, FormAnswers, FormField, ProfessionKey } from "@/lib/types";
import { useLanguageStore } from "@/store/language-store";

interface SectionFieldsViewProps {
  fields: FormField[];
  answers: FormAnswers;
  fieldErrors: Record<string, string>;
  onChange: (field: FormField, value: AnswerValue) => void;
  onBlurValidate: (field: FormField) => void;
  profession?: ProfessionKey | null;
}

interface FieldSubgroupBucket {
  subgroup: string;
  fields: FormField[];
  hasRequired: boolean;
}

const FULL_WIDTH_KEYS = new Set([
  "applicant_name",
  "present_address",
  "employer_name",
  "employer_address",
  "institution_name",
  "institution_address",
  "approved_leave_dates",
  "destination_city",
  "high_school_institution",
  "college_institution",
  "last_education_degree",
  "last_education_institution",
  "fathers_name",
  "mothers_name",
  "spouse_name",
  "child_1_name",
  "child_2_name",
  "sponsor_name",
]);

const COLLAPSIBLE_OPTIONAL_SUBGROUPS = new Set<string>([]);

function hasAnyFieldValue(fields: FormField[], answers: FormAnswers): boolean {
  return fields.some((f) => {
    const val = answers[f.key];
    if (typeof val === "number") return Number.isFinite(val);
    if (typeof val === "string") return val.trim().length > 0;
    return false;
  });
}

function hasAnyFieldError(
  fields: FormField[],
  errors: Record<string, string>,
): boolean {
  return fields.some((f) => Boolean(errors[f.key]));
}

function calculateTravelDays(arrivalYmd: string, departureYmd: string): number | null {
  const arr = parseYmdToLocalDate(arrivalYmd);
  const dep = parseYmdToLocalDate(departureYmd);
  if (!arr || !dep) return null;
  const diffMs = dep.getTime() - arr.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0 || diffDays > 365) return null;
  return diffDays;
}

export function SectionFieldsView({
  fields,
  answers,
  fieldErrors,
  onChange,
  onBlurValidate,
  profession,
}: SectionFieldsViewProps) {
  const language = useLanguageStore((s) => s.language);
  const hasSubgroups = fields.some((f) => Boolean(f.subgroup));

  const [expandedSubgroups, setExpandedSubgroups] = useState<
    Record<string, boolean>
  >({});

  const subgroupBuckets = useMemo<FieldSubgroupBucket[]>(() => {
    if (!hasSubgroups) return [];
    const buckets: FieldSubgroupBucket[] = [];
    for (const field of fields) {
      const subgroupName = field.subgroup ?? "Other";
      const last = buckets[buckets.length - 1];
      if (last && last.subgroup === subgroupName) {
        last.fields.push(field);
        if (field.required) last.hasRequired = true;
      } else {
        buckets.push({
          subgroup: subgroupName,
          fields: [field],
          hasRequired: field.required,
        });
      }
    }
    return buckets;
  }, [fields, hasSubgroups]);

  const arrivalStr =
    typeof answers["intended_arrival_date"] === "string"
      ? answers["intended_arrival_date"]
      : "";
  const departureStr =
    typeof answers["intended_departure_date"] === "string"
      ? answers["intended_departure_date"]
      : "";
  const currentDurationNumber = Number(answers["duration_of_stay_days"]);
  const suggestedDays = calculateTravelDays(arrivalStr, departureStr);

  const handleFieldValueChange = (field: FormField, val: AnswerValue) => {
    onChange(field, val);

    // Requirement 8: Automatic bidirectional calculation between arrival date, departure date, and stay duration
    if (field.key === "intended_arrival_date") {
      const arrivalYmd = typeof val === "string" ? val : "";
      const currentDuration = Number(answers["duration_of_stay_days"]);
      const currentDep =
        typeof answers["intended_departure_date"] === "string"
          ? answers["intended_departure_date"]
          : "";

      if (arrivalYmd && currentDuration > 0 && currentDuration <= 365) {
        const calculatedDep = addDaysToYmd(arrivalYmd, currentDuration);
        if (calculatedDep && calculatedDep !== currentDep) {
          const depField = fields.find((f) => f.key === "intended_departure_date") ?? {
            key: "intended_departure_date",
            label: "Date of Departure",
            type: "date",
            required: false,
            section: field.section,
          };
          onChange(depField, calculatedDep);
        }
      } else if (arrivalYmd && currentDep) {
        const calculatedDays = diffYmdInDays(arrivalYmd, currentDep);
        if (calculatedDays && calculatedDays > 0 && calculatedDays !== currentDuration) {
          const durField = fields.find((f) => f.key === "duration_of_stay_days") ?? {
            key: "duration_of_stay_days",
            label: "Max Days to Stay",
            type: "number",
            required: true,
            section: field.section,
          };
          onChange(durField, calculatedDays);
        }
      }
    } else if (field.key === "duration_of_stay_days") {
      const numDays = typeof val === "number" ? val : Number(val);
      const arrivalYmd =
        typeof answers["intended_arrival_date"] === "string"
          ? answers["intended_arrival_date"]
          : "";
      if (arrivalYmd && Number.isFinite(numDays) && numDays > 0 && numDays <= 365) {
        const calculatedDep = addDaysToYmd(arrivalYmd, numDays);
        if (calculatedDep && calculatedDep !== answers["intended_departure_date"]) {
          const depField = fields.find((f) => f.key === "intended_departure_date") ?? {
            key: "intended_departure_date",
            label: "Date of Departure",
            type: "date",
            required: false,
            section: field.section,
          };
          onChange(depField, calculatedDep);
        }
      }
    } else if (field.key === "intended_departure_date") {
      const depYmd = typeof val === "string" ? val : "";
      const arrivalYmd =
        typeof answers["intended_arrival_date"] === "string"
          ? answers["intended_arrival_date"]
          : "";
      if (arrivalYmd && depYmd) {
        const calculatedDays = diffYmdInDays(arrivalYmd, depYmd);
        if (
          calculatedDays &&
          calculatedDays > 0 &&
          calculatedDays !== Number(answers["duration_of_stay_days"])
        ) {
          const durField = fields.find((f) => f.key === "duration_of_stay_days") ?? {
            key: "duration_of_stay_days",
            label: "Max Days to Stay",
            type: "number",
            required: true,
            section: field.section,
          };
          onChange(durField, calculatedDays);
        }
      }
    }
  };

  const renderFlatGrid = (gridFields: FormField[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {gridFields.map((field) => {
        const isFullWidth =
          field.type === "textarea" ||
          field.type === "table" ||
          FULL_WIDTH_KEYS.has(field.key);

        const isDurationField = field.key === "duration_of_stay_days";
        const isDepartureField = field.key === "intended_departure_date";
        const currentDuration = answers[field.key];
        const isDurationSynced =
          isDurationField &&
          suggestedDays !== null &&
          String(currentDuration ?? "").trim() === String(suggestedDays);
        const isDepartureSynced =
          isDepartureField &&
          Boolean(arrivalStr) &&
          currentDurationNumber > 0 &&
          Boolean(departureStr);

        return (
          <div
            key={field.key}
            className={isFullWidth ? "sm:col-span-2" : undefined}
          >
            <DynamicField
              field={field}
              value={answers[field.key]}
              allAnswers={answers}
              error={fieldErrors[field.key]}
              onChange={(val) => handleFieldValueChange(field, val)}
              onBlurValidate={() => onBlurValidate(field)}
            />
            {isDurationSynced && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>
                  {language === "bn"
                    ? `তারিখ অনুযায়ী ${toBanglaDigits(suggestedDays)} দিন স্বয়ংক্রিয়ভাবে হিসাব করা হয়েছে`
                    : `Auto-calculated: ${suggestedDays} days from travel dates`}
                </span>
              </div>
            )}
            {isDepartureSynced && !isDurationSynced && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>
                  {language === "bn"
                    ? "ভ্রমণের দিন অনুযায়ী প্রস্থানের তারিখ স্বয়ংক্রিয়ভাবে হিসাব করা হয়েছে"
                    : "Departure date auto-calculated from stay duration"}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const isStudent = profession === "student";

  const isEducationalSection = useMemo(() => {
    return fields.some(
      (f) =>
        f.key === "has_no_education" ||
        f.key === "last_education_degree",
    );
  }, [fields]);

  const hasNoEducation =
    !isStudent &&
    (String(answers["has_no_education"] ?? "") === "yes" ||
      String(answers["has_no_education"] ?? "") === "true" ||
      (answers["has_no_education"] as unknown) === true ||
      String(answers["no_education"] ?? "") === "yes" ||
      (answers["no_education"] as unknown) === true);

  // If profession is student and has_no_education was previously selected, clear it
  useEffect(() => {
    if (isStudent && answers["has_no_education"]) {
      const hasNoEduField = fields.find((f) => f.key === "has_no_education") ?? {
        key: "has_no_education",
        label: "No Formal Education",
        type: "text",
        required: false,
        section: "Educational Information",
      };
      onChange(hasNoEduField, "");
    }
  }, [isStudent, answers, fields, onChange]);

  const handleToggleNoEducation = (noEdu: boolean) => {
    if (isStudent && noEdu) {
      return;
    }
    const hasNoEduField = fields.find((f) => f.key === "has_no_education") ?? {
      key: "has_no_education",
      label: "No Formal Education",
      type: "text",
      required: false,
      section: "Educational Information",
    };
    const lastDegreeField = fields.find((f) => f.key === "last_education_degree") ?? {
      key: "last_education_degree",
      label: "Degree Name",
      type: "text",
      required: true,
      section: "Educational Information",
      subgroup: "Last Education",
    };
    const lastInstField = fields.find((f) => f.key === "last_education_institution") ?? {
      key: "last_education_institution",
      label: "Institution Name",
      type: "text",
      required: false,
      section: "Educational Information",
      subgroup: "Last Education",
    };
    const otherEduField = fields.find((f) => f.key === "other_education") ?? {
      key: "other_education",
      label: "Other Education",
      type: "table",
      required: false,
      section: "Educational Information",
      subgroup: "Other Education",
    };

    if (noEdu) {
      onChange(hasNoEduField, "yes");
      onChange(lastDegreeField, "");
      onChange(lastInstField, "");
      onChange(otherEduField, []);
    } else {
      onChange(hasNoEduField, "");
    }
  };

  if (isEducationalSection) {
    const lastEduFields = fields.filter(
      (f) =>
        f.key === "last_education_degree" ||
        f.key === "last_education_institution",
    );
    const otherEduField = fields.find((f) => f.key === "other_education");
    const extraEduFields = fields.filter(
      (f) =>
        f.key !== "has_no_education" &&
        f.key !== "last_education_degree" &&
        f.key !== "last_education_institution" &&
        f.key !== "other_education",
    );

    return (
      <div className="space-y-6">
        {/* Education Qualification Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/90 via-white to-blue-50/30 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm">
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === "bn"
                      ? "শিক্ষাগত যোগ্যতা সংক্রান্ত তথ্য"
                      : "Educational Background Status"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === "bn"
                      ? "আপনার প্রাতিষ্ঠানিক শিক্ষাগত যোগ্যতা আছে কি না তা নির্বাচন করুন"
                      : "Select whether you have formal educational credentials to declare"}
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleToggleNoEducation(false)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                    !hasNoEducation
                      ? "bg-white text-blue-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🎓</span>
                  <span>
                    {language === "bn" ? "শিক্ষাগত যোগ্যতা আছে" : "I Have Education"}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={isStudent}
                  onClick={() => {
                    if (isStudent) return;
                    handleToggleNoEducation(true);
                  }}
                  title={
                    isStudent
                      ? language === "bn"
                        ? "শিক্ষার্থীদের জন্য প্রাতিষ্ঠানিক শিক্ষা থাকা আবশ্যক"
                        : "Students cannot select 'No Formal Education'"
                      : undefined
                  }
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                    isStudent
                      ? "cursor-not-allowed opacity-40 text-slate-400"
                      : hasNoEducation
                        ? "bg-white text-emerald-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🚫</span>
                  <span>
                    {language === "bn" ? "কোনো শিক্ষা নেই" : "No Formal Education"}
                  </span>
                </button>
              </div>
              {isStudent && (
                <p className="text-[11px] font-semibold text-amber-700">
                  {language === "bn"
                    ? "ছাত্র/ছাত্রীদের প্রাতিষ্ঠানিক শিক্ষার তথ্য প্রদান আবশ্যক"
                    : "Students must have formal education"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Branching based on Education Status */}
        {hasNoEducation ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-950 shadow-sm">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-base font-bold text-emerald-900">
                  {language === "bn"
                    ? "কোনো প্রাতিষ্ঠানিক শিক্ষা নেই (নির্বাচিত)"
                    : "No Formal Education Declared"}
                </p>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  {language === "bn"
                    ? "এই ভিসা আবেদনের জন্য ডিগ্রি বা শিক্ষাপ্রতিষ্ঠানের তথ্য দেওয়ার কোনো প্রয়োজন নেই। আপনি সরাসরি 'পরবর্তী' বাটনে ক্লিক করে এগিয়ে যেতে পারেন।"
                    : "No degree or institution information is required for this visa application. You can proceed directly to the next step."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Last Education Card */}
            <div className="rounded-2xl border border-blue-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-blue-100 bg-blue-50/70 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {language === "bn" ? "সর্বশেষ শিক্ষাগত যোগ্যতা" : "Last Education"}
                  </h3>
                  <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-100 font-semibold">
                    {language === "bn" ? "আবশ্যক" : "Required"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {language === "bn"
                    ? "আপনার সর্বোচ্চ সম্পন্ন করা ডিগ্রির তথ্য দিন"
                    : "Enter details of your highest completed qualification"}
                </p>
              </div>
              <div className="p-5">
                {renderFlatGrid(lastEduFields)}
              </div>
            </div>

            {/* Other Education Card */}
            {otherEduField && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {language === "bn" ? "অন্যান্য শিক্ষাগত যোগ্যতা" : "Other Education"}
                    </h3>
                    <Badge variant="outline" className="border-slate-300 bg-white text-slate-600 font-medium">
                      {language === "bn" ? "ঐচ্ছিক" : "Optional"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {language === "bn"
                      ? "অন্য কোনো পূর্ববর্তী ডিগ্রি বা কোর্স থাকলে এখানে যোগ করুন"
                      : "Add any additional previous degrees or qualifications"}
                  </p>
                </div>
                <div className="p-5">
                  <DynamicField
                    field={otherEduField}
                    value={answers[otherEduField.key]}
                    allAnswers={answers}
                    error={fieldErrors[otherEduField.key]}
                    onChange={(val) => handleFieldValueChange(otherEduField, val)}
                    onBlurValidate={() => onBlurValidate(otherEduField)}
                  />
                </div>
              </div>
            )}

            {extraEduFields.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {renderFlatGrid(extraEduFields)}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (!hasSubgroups) {
    return renderFlatGrid(fields);
  }

  return (
    <div className="space-y-4">
      {subgroupBuckets.map((bucket) => {
        const isCollapsible =
          !bucket.hasRequired &&
          COLLAPSIBLE_OPTIONAL_SUBGROUPS.has(bucket.subgroup);
        const hasValues = hasAnyFieldValue(bucket.fields, answers);
        const hasErrors = hasAnyFieldError(bucket.fields, fieldErrors);
        const isExpanded =
          !isCollapsible ||
          hasValues ||
          hasErrors ||
          Boolean(expandedSubgroups[bucket.subgroup]);

        const localizedTitle = getLocalizedSubgroupName(
          bucket.subgroup,
          language,
        );

        return (
          <div
            key={bucket.subgroup}
            className={`overflow-hidden rounded-xl border transition-colors ${
              hasErrors
                ? "border-red-300 bg-red-50/20"
                : bucket.hasRequired
                  ? "border-blue-200 bg-white"
                  : "border-slate-200 bg-slate-50/40"
            }`}
          >
            <div
              className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 ${
                isExpanded ? "border-b border-slate-200/80" : ""
              } ${bucket.hasRequired ? "bg-blue-50/60" : "bg-slate-50"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {localizedTitle}
                </h3>
                {bucket.hasRequired ? (
                  <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-100">
                    {language === "bn" ? "আবশ্যক" : "Required"}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-slate-300 bg-white text-slate-600"
                  >
                    {language === "bn" ? "ঐচ্ছিক" : "Optional"}
                  </Badge>
                )}
              </div>

              {isCollapsible && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpandedSubgroups((prev) => ({
                      ...prev,
                      [bucket.subgroup]: !isExpanded,
                    }))
                  }
                  className="h-8 px-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  {isExpanded ? (
                    <>
                      <ChevronDown className="mr-1 h-4 w-4" aria-hidden="true" />
                      {language === "bn" ? "সংকুচিত করুন" : "Hide"}
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      {language === "bn" ? "তথ্য যোগ করুন" : "Add details"}
                      <ChevronRight className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {isExpanded && (
              <div className="p-4 sm:p-5">{renderFlatGrid(bucket.fields)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
