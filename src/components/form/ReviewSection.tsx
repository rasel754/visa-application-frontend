"use client";

import { CheckCircle2, Edit3, FileText, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorItem, FriendlyError } from "@/components/form/FriendlyError";
import { getCategoryDisplayInfo, getTableColumns } from "@/lib/field-helpers";
import { isTableRowNonEmpty } from "@/lib/form-validation";
import {
  CategoryForm,
  FormAnswers,
  SectionGroup,
  TableRowValue,
  UploadedDocumentEntry,
} from "@/lib/types";

interface ReviewSectionProps {
  form: CategoryForm;
  category: string;
  sections: SectionGroup[];
  answers: FormAnswers;
  files: Record<string, UploadedDocumentEntry>;
  errorItems: ErrorItem[];
  documentsStepIndex: number;
  sectionStartIndex: number;
  onJumpToStep: (stepIndex: number, fieldKey?: string) => void;
}

export function ReviewSection({
  form,
  category,
  sections,
  answers,
  files,
  errorItems,
  documentsStepIndex,
  sectionStartIndex,
  onJumpToStep,
}: ReviewSectionProps) {
  const catInfo = getCategoryDisplayInfo(category);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">
          Check your answers before sending
        </h2>
        <p className="text-base text-slate-600">
          Look through everything carefully. Tap &ldquo;Change&rdquo; if you want to fix any part.
        </p>
        <p className="text-sm font-medium text-blue-800">
          পাঠানোর আগে আপনার সব তথ্য ও কাগজপত্র ভালোভাবে মিলিয়ে নিন। কিছু ঠিক করতে চাইলে &ldquo;Change&rdquo; বাটনে চাপ দিন।
        </p>
      </div>

      {errorItems.length > 0 && (
        <FriendlyError
          title="Some boxes or papers still need your attention before you can send:"
          banglaHint="নিচের বাকি থাকা বা ভুল তথ্যগুলো ঠিক করে তারপর আবার পাঠান।"
          items={errorItems}
          onJumpToItem={(item) => {
            if (typeof item.stepIndex === "number") {
              onJumpToStep(item.stepIndex, item.key);
            }
          }}
        />
      )}

      {/* Selected Country & Visa Type */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Selected Application
            </p>
            <p className="text-lg font-bold text-slate-900">
              {form.country} — {catInfo.title}
            </p>
            <p className="text-sm text-slate-600">{form.official_visa_name}</p>
          </div>
        </div>
      </div>

      {/* Section summaries */}
      <div className="space-y-4">
        {sections.map((group, idx) => {
          const stepIdx = sectionStartIndex + idx;
          return (
            <div
              key={group.section}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h3 className="text-base font-bold text-slate-900">
                  {group.section}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onJumpToStep(stepIdx)}
                  className="h-9 border-blue-200 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                >
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Change
                </Button>
              </div>

              <div className="divide-y divide-slate-100 px-4">
                {group.fields.map((field) => {
                  const val = answers[field.key];
                  const hasError = errorItems.some((e) => e.key === field.key);

                  if (field.type === "table") {
                    const columns = getTableColumns(field.key);
                    const rows = Array.isArray(val)
                      ? (val as TableRowValue[]).filter(isTableRowNonEmpty)
                      : [];

                    return (
                      <div key={field.key} className="py-3">
                        <p className="text-sm font-semibold text-slate-700">
                          {field.label}
                        </p>
                        {rows.length === 0 ? (
                          <p
                            className={`mt-1 text-sm ${
                              hasError
                                ? "font-semibold text-red-600"
                                : "text-slate-400"
                            }`}
                          >
                            {hasError ? "Missing — please add at least one row" : "Not given"}
                          </p>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {rows.map((r, rIdx) => (
                              <div
                                key={`${field.key}-rev-${rIdx}`}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm"
                              >
                                {columns.map((c) => (
                                  <p key={c.key} className="text-slate-800">
                                    <span className="font-medium text-slate-600">
                                      {c.label}:{" "}
                                    </span>
                                    {r[c.key]?.trim() || "—"}
                                  </p>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const displayStr =
                    typeof val === "number"
                      ? String(val)
                      : typeof val === "string"
                        ? val.trim()
                        : "";

                  return (
                    <div
                      key={field.key}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                    >
                      <span className="text-sm font-medium text-slate-600 sm:w-1/2">
                        {field.label}
                      </span>
                      <span
                        className={`text-base sm:w-1/2 sm:text-right ${
                          hasError
                            ? "font-semibold text-red-600"
                            : displayStr
                              ? "font-medium text-slate-900"
                              : "text-slate-400"
                        }`}
                      >
                        {displayStr || (hasError ? "Missing / needs fix" : "Not written (Optional)")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Documents summary */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FileText className="h-4 w-4 text-blue-700" aria-hidden="true" />
              Documents
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onJumpToStep(documentsStepIndex)}
              className="h-9 border-blue-200 text-sm font-semibold text-blue-800 hover:bg-blue-50"
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Change
            </Button>
          </div>

          <div className="divide-y divide-slate-100 px-4">
            {form.documents.map((doc) => {
              const attached = files[doc.key];
              return (
                <div
                  key={doc.key}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {doc.label}
                      {!doc.required && (
                        <span className="ml-1 text-xs text-slate-500">
                          (Optional)
                        </span>
                      )}
                    </p>
                    {attached && (
                      <p className="truncate text-xs text-slate-500">
                        File: {attached.file.name}
                      </p>
                    )}
                  </div>

                  {attached ? (
                    <Badge className="w-fit shrink-0 bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      Uploaded
                    </Badge>
                  ) : doc.required ? (
                    <Badge className="w-fit shrink-0 bg-red-100 text-red-900 hover:bg-red-100">
                      <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      Missing (Must give)
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="w-fit shrink-0 border-slate-200 text-slate-500"
                    >
                      Not given (Optional)
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

