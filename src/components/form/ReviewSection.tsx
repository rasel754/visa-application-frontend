"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileText,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicField } from "@/components/form/DynamicField";
import { ErrorItem, FriendlyError } from "@/components/form/FriendlyError";
import { getBanglaError } from "@/lib/error-messages";
import {
  formatDateYmdDisplay,
  formatProfessionLabel,
  getTableColumns,
} from "@/lib/field-helpers";
import {
  isTableRowNonEmpty,
  validateClientPickedFile,
  validateFieldValue,
  validateSectionFields,
} from "@/lib/form-validation";
import {
  AnswerValue,
  FormAnswers,
  FormDocument,
  FormField,
  ProfessionKey,
  SectionGroup,
  TableRowValue,
  UploadedDocumentEntry,
  VisitForm,
} from "@/lib/types";

interface ReviewSectionProps {
  visitForm: VisitForm;
  profession: ProfessionKey;
  sections: SectionGroup[];
  commonDocuments: FormDocument[];
  additionalDocuments: FormDocument[];
  answers: FormAnswers;
  files: Record<string, UploadedDocumentEntry>;
  errorItems: ErrorItem[];
  editingSection: string | null;
  onEditingSectionChange: (sectionName: string | null) => void;
  onSaveSection: (fields: FormField[], updates: FormAnswers) => void;
  onSelectFile: (docKey: string, entry: UploadedDocumentEntry) => void;
  onRemoveFile: (docKey: string) => void;
  onJumpToStep: (stepIndex: number, fieldKey?: string) => void;
}

export function ReviewSection({
  visitForm,
  profession,
  sections,
  commonDocuments,
  additionalDocuments,
  answers,
  files,
  errorItems,
  editingSection,
  onEditingSectionChange,
  onSaveSection,
  onSelectFile,
  onRemoveFile,
  onJumpToStep,
}: ReviewSectionProps) {
  const [draftAnswers, setDraftAnswers] = useState<FormAnswers>({});
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingDocKeyRef = useRef<string | null>(null);

  const professionLabel =
    visitForm.applicant_profiles[profession]?.label ??
    formatProfessionLabel(profession);

  const startEditingSection = (group: SectionGroup) => {
    const initialDraft: FormAnswers = {};
    for (const field of group.fields) {
      if (answers[field.key] !== undefined) {
        initialDraft[field.key] = answers[field.key]!;
      }
    }
    setDraftAnswers(initialDraft);
    setDraftErrors({});
    onEditingSectionChange(group.section);
  };

  const handleCancelSection = () => {
    setDraftAnswers({});
    setDraftErrors({});
    onEditingSectionChange(null);
  };

  const handleDraftFieldChange = (
    group: SectionGroup,
    field: FormField,
    value: AnswerValue,
  ) => {
    const nextDraft: FormAnswers = { ...draftAnswers, [field.key]: value };
    setDraftAnswers(nextDraft);

    if (draftErrors[field.key]) {
      const merged = { ...answers, ...nextDraft };
      const err = validateFieldValue(field, value, merged);
      setDraftErrors((prev) => {
        const next = { ...prev };
        if (err) {
          next[field.key] = err;
        } else {
          delete next[field.key];
        }
        return next;
      });
    }
    void group;
  };

  const handleDraftFieldBlur = (field: FormField) => {
    const merged = { ...answers, ...draftAnswers };
    const err = validateFieldValue(field, merged[field.key], merged);
    setDraftErrors((prev) => {
      const next = { ...prev };
      if (err) {
        next[field.key] = err;
      } else {
        delete next[field.key];
      }
      return next;
    });
  };

  const handleSaveSection = (group: SectionGroup) => {
    const merged = { ...answers, ...draftAnswers };
    const errors = validateSectionFields(group.fields, merged);
    if (Object.keys(errors).length > 0) {
      setDraftErrors(errors);
      toast.error("Please fix the marked boxes before saving.");
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        window.requestAnimationFrame(() => {
          const el = document.getElementById(`field-${firstKey}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus({ preventScroll: true });
          }
        });
      }
      return;
    }

    onSaveSection(group.fields, draftAnswers);
    setDraftAnswers({});
    setDraftErrors({});
    onEditingSectionChange(null);
    toast.success(`${group.section} updated.`);
  };

  const openDocumentPicker = (docKey: string) => {
    pendingDocKeyRef.current = docKey;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docKey = pendingDocKeyRef.current;
    pendingDocKeyRef.current = null;
    if (!file || !docKey) return;

    const validationErr = validateClientPickedFile(file);
    if (validationErr) {
      setDocErrors((prev) => ({ ...prev, [docKey]: validationErr }));
      toast.error(validationErr);
      return;
    }

    setDocErrors((prev) => {
      const next = { ...prev };
      delete next[docKey];
      return next;
    });
    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
    onSelectFile(docKey, { file, previewUrl });
    toast.success("Document file updated.");
  };

  const renderDocRows = (docs: FormDocument[]) =>
    docs.map((doc) => {
      const attached = files[doc.key];
      const inlineDocErr = docErrors[doc.key];
      const banglaDocErr = getBanglaError(inlineDocErr);

      return (
        <div key={doc.key} className="space-y-2 py-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-900">
                  {doc.label}
                  {!doc.required && (
                    <span className="ml-1 text-xs text-slate-500">(Optional)</span>
                  )}
                </p>
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
              {attached && (
                <p className="truncate text-xs text-slate-500">
                  File: {attached.file.name}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {attached ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openDocumentPicker(doc.key)}
                    className="h-10 min-w-24 border-slate-300 text-sm font-medium"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Replace
                  </Button>
                  {!doc.required && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onRemoveFile(doc.key);
                        setDocErrors((prev) => {
                          const next = { ...prev };
                          delete next[doc.key];
                          return next;
                        });
                      }}
                      className="h-10 min-w-24 border-red-200 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openDocumentPicker(doc.key)}
                  className="h-10 min-w-24 border-blue-300 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Upload
                </Button>
              )}
            </div>
          </div>

          {inlineDocErr && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p>{inlineDocErr}</p>
                {banglaDocErr && (
                  <p className="font-normal text-red-800">{banglaDocErr}</p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">
          Check your answers before sending
        </h2>
        <p className="text-base text-slate-600">
          Look through everything carefully. Tap &ldquo;Edit&rdquo; on any box to fix it right here, then tap &ldquo;Send OTP &amp; Submit&rdquo;.
        </p>
        <p className="text-sm font-medium text-blue-800">
          পাঠানোর আগে আপনার সব তথ্য ও কাগজপত্র ভালোভাবে মিলিয়ে নিন। কোনো অংশ ঠিক করতে চাইলে সেই অংশের &ldquo;Edit&rdquo; বাটনে চাপ দিয়ে এখানেই পরিবর্তন করুন।
        </p>
      </div>

      {errorItems.length > 0 && (
        <FriendlyError
          title="Some boxes or papers still need your attention before you can send:"
          banglaHint="নিচের বাকি থাকা বা ভুল তথ্যগুলো এখানে Edit করে ঠিক করুন, তারপর আবার পাঠান।"
          items={errorItems}
          onJumpToItem={(item) => {
            const matchedSection = sections.find((s) =>
              s.fields.some((f) => f.key === item.key),
            );
            if (matchedSection) {
              startEditingSection(matchedSection);
              window.requestAnimationFrame(() => {
                const el = document.getElementById(`field-${item.key}`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  el.focus({ preventScroll: true });
                }
              });
              return;
            }
            if (typeof item.stepIndex === "number") {
              onJumpToStep(item.stepIndex, item.key);
            }
          }}
        />
      )}

      {/* Selected Country, Visit Visa & Profession */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Selected Application
        </p>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Country</p>
            <p className="text-base font-bold text-slate-900">{visitForm.country}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Visa Type</p>
            <p className="text-base font-bold text-slate-900">Visit Visa</p>
            <p className="text-xs text-slate-600">{visitForm.official_visa_name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Profession</p>
            <Badge className="mt-0.5 bg-blue-100 text-blue-900 hover:bg-blue-100">
              {professionLabel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Section summaries with inline editing */}
      <div className="space-y-4">
        {sections.map((group) => {
          const isProfileSection = group.group !== "common";
          const isEditing = editingSection === group.section;
          const mergedAnswers: FormAnswers = isEditing
            ? { ...answers, ...draftAnswers }
            : answers;

          return (
            <div
              key={group.section}
              id={`review-section-${group.section}`}
              className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
                isEditing ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {group.section}
                  </h3>
                  {isProfileSection && (
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-xs text-blue-800"
                    >
                      {professionLabel}
                    </Badge>
                  )}
                </div>

                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => startEditingSection(group)}
                    className="h-10 min-w-24 border-blue-200 px-4 text-sm font-semibold text-blue-800 hover:bg-blue-50"
                  >
                    <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-5 p-4 sm:p-5">
                  <div className="space-y-5">
                    {group.fields.map((field) => (
                      <DynamicField
                        key={field.key}
                        field={field}
                        value={mergedAnswers[field.key]}
                        allAnswers={mergedAnswers}
                        error={draftErrors[field.key]}
                        onChange={(val) => handleDraftFieldChange(group, field, val)}
                        onBlurValidate={() => handleDraftFieldBlur(field)}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelSection}
                      className="h-11 min-w-28 border-slate-300 text-base font-semibold"
                    >
                      <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleSaveSection(group)}
                      className="h-11 min-w-32 bg-blue-700 text-base font-semibold text-white hover:bg-blue-800"
                    >
                      <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
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
                              {hasError
                                ? "Missing — please add at least one row"
                                : "Not given"}
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

                    const rawStr =
                      typeof val === "number"
                        ? String(val)
                        : typeof val === "string"
                          ? val.trim()
                          : "";
                    const displayStr =
                      rawStr && field.type === "date"
                        ? formatDateYmdDisplay(rawStr)
                        : rawStr;

                    return (
                      <div
                        key={field.key}
                        className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                      >
                        <span className="text-sm font-medium text-slate-600 sm:w-1/2">
                          {field.label}
                        </span>
                        <span
                          className={`break-words text-base sm:w-1/2 sm:text-right ${
                            hasError
                              ? "font-semibold text-red-600"
                              : displayStr
                                ? "font-medium text-slate-900"
                                : "text-slate-400"
                          }`}
                        >
                          {displayStr ||
                            (hasError
                              ? "Missing / needs fix"
                              : "Not written (Optional)")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Documents summary with inline Replace / Remove / Upload */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FileText className="h-4 w-4 text-blue-700" aria-hidden="true" />
              Documents
            </h3>
            <span className="text-xs text-slate-500">
              PDF, JPG, or PNG (max 10 MB)
            </span>
          </div>

          <div className="px-4 py-2">
            <p className="py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Common Documents
            </p>
            <div className="divide-y divide-slate-100">
              {renderDocRows(commonDocuments)}
            </div>

            {additionalDocuments.length > 0 && (
              <>
                <p className="mt-3 border-t border-slate-200 pt-3 pb-2 text-xs font-bold uppercase tracking-wide text-blue-700">
                  Additional Documents ({professionLabel})
                </p>
                <div className="divide-y divide-slate-100">
                  {renderDocRows(additionalDocuments)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
