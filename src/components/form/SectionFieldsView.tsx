"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseYmdToLocalDate } from "@/components/ui/date-picker";
import { DynamicField } from "@/components/form/DynamicField";
import { getLocalizedSubgroupName } from "@/lib/field-helpers";
import { toBanglaDigits } from "@/lib/i18n/bangla-data";
import { AnswerValue, FormAnswers, FormField } from "@/lib/types";
import { useLanguageStore } from "@/store/language-store";

interface SectionFieldsViewProps {
  fields: FormField[];
  answers: FormAnswers;
  fieldErrors: Record<string, string>;
  onChange: (field: FormField, value: AnswerValue) => void;
  onBlurValidate: (field: FormField) => void;
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
  "last_education_institution",
  "fathers_name",
  "mothers_name",
  "spouse_name",
  "child_1_name",
  "child_2_name",
]);

const COLLAPSIBLE_OPTIONAL_SUBGROUPS = new Set(["Spouse", "Child 1", "Child 2"]);

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
  const suggestedDays = calculateTravelDays(arrivalStr, departureStr);

  const renderFlatGrid = (gridFields: FormField[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {gridFields.map((field) => {
        const isFullWidth =
          field.type === "textarea" ||
          field.type === "table" ||
          FULL_WIDTH_KEYS.has(field.key);

        const isDurationField = field.key === "duration_of_stay_days";
        const currentDuration = answers[field.key];
        const showDurationSuggestion =
          isDurationField &&
          suggestedDays !== null &&
          String(currentDuration ?? "").trim() !== String(suggestedDays);

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
              onChange={(val) => onChange(field, val)}
              onBlurValidate={() => onBlurValidate(field)}
            />
            {showDurationSuggestion && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange(field, String(suggestedDays))}
                  className="h-8 border-blue-200 bg-blue-50/70 px-3 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                >
                  <CalendarClock className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {language === "bn"
                    ? `তারিখ অনুযায়ী ${toBanglaDigits(suggestedDays)} দিন ব্যবহার করুন`
                    : `Use ${suggestedDays} days from travel dates`}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

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
