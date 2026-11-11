"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "@/components/form/CountrySelect";
import { DocumentUploadCard } from "@/components/form/DocumentUploadCard";
import { DynamicField } from "@/components/form/DynamicField";
import { FormProgress } from "@/components/form/FormProgress";
import { ErrorItem, FriendlyError } from "@/components/form/FriendlyError";
import { ReviewSection } from "@/components/form/ReviewSection";
import { VisaTypeSelect } from "@/components/form/VisaTypeSelect";
import { useCategoryForm } from "@/hooks/useCategoryForm";
import { useCountries } from "@/hooks/useCountries";
import { ApiRequestError, api } from "@/lib/api";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { getSectionIntro, groupFieldsBySection } from "@/lib/field-helpers";
import {
  validateDocumentsMap,
  validateFullApplication,
  validateSectionFields,
} from "@/lib/form-validation";
import {
  AnswerValue,
  CountrySummary,
  FormAnswers,
  UploadedDocumentEntry,
} from "@/lib/types";
import { useIntakeStore } from "@/store/intake-store";

interface SectionWizardProps {
  intakeToken?: string;
}

export function SectionWizard({ intakeToken }: SectionWizardProps) {
  const router = useRouter();

  const {
    countryCode,
    category,
    answers,
    currentStepIndex,
    savedAt,
    hasHydrated,
    setCountry,
    setCategory,
    setAnswer,
    setStepIndex,
    setLastSubmission,
    resetDraft,
  } = useIntakeStore();

  const { reset: resetRhf } = useForm<FormAnswers>({
    defaultValues: answers,
  });

  const [files, setFiles] = useState<Record<string, UploadedDocumentEntry>>({});
  const filesRef = useRef(files);
  filesRef.current = files;

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [topErrorTitle, setTopErrorTitle] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resume prompt state for standard /apply
  const [resumePromptDismissed, setResumePromptDismissed] = useState(false);
  const [hadSavedDraftOnMount, setHadSavedDraftOnMount] = useState(false);
  const checkedDraftRef = useRef(false);

  // Unique intake link state
  const [linkLoading, setLinkLoading] = useState(Boolean(intakeToken));
  const [linkError, setLinkError] = useState<string | null>(null);
  const [lockedCountryCode, setLockedCountryCode] = useState<string | null>(null);
  const [lockedCategory, setLockedCategory] = useState<string | null>(null);
  const linkInitializedRef = useRef(false);

  const {
    data: countries = [],
    isLoading: countriesLoading,
    error: countriesError,
  } = useCountries();

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(filesRef.current).forEach((entry) => {
        if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      });
    };
  }, []);

  // Check saved draft once after hydration (public /apply only)
  useEffect(() => {
    if (intakeToken || !hasHydrated || checkedDraftRef.current) return;
    checkedDraftRef.current = true;
    const hasProgress =
      Boolean(countryCode) || Object.keys(answers).length > 0;
    if (hasProgress && savedAt) {
      setHadSavedDraftOnMount(true);
    } else {
      setResumePromptDismissed(true);
    }
  }, [intakeToken, hasHydrated, countryCode, answers, savedAt]);

  // Resolve unique intake link
  useEffect(() => {
    if (!intakeToken || linkInitializedRef.current) return;
    linkInitializedRef.current = true;

    let cancelled = false;
    setLinkLoading(true);
    setLinkError(null);

    api
      .resolveIntakeLink(intakeToken)
      .then((res) => {
        if (cancelled) return;
        if (!res.valid) {
          setLinkError(ERROR_MESSAGES.formNotFound);
          return;
        }
        if (res.country_code) {
          setLockedCountryCode(res.country_code);
          setCountry(res.country_code);
        }
        if (res.category) {
          setLockedCategory(res.category);
          setCategory(res.category);
        } else if (res.country_code) {
          setCategory(null);
        }

        if (res.country_code && res.category) {
          setStepIndex(2);
        } else if (res.country_code) {
          setStepIndex(1);
        } else {
          setStepIndex(0);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          err instanceof ApiRequestError
            ? err.message
            : ERROR_MESSAGES.formNotFound;
        setLinkError(msg);
      })
      .finally(() => {
        if (!cancelled) setLinkLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [intakeToken, setCategory, setCountry, setStepIndex]);

  const selectedCountry: CountrySummary | null = useMemo(() => {
    if (!countryCode) return null;
    return (
      countries.find(
        (c) => c.country_code.toUpperCase() === countryCode.toUpperCase(),
      ) ?? null
    );
  }, [countries, countryCode]);

  const {
    data: categoryForm,
    isLoading: formLoading,
    error: formError,
  } = useCategoryForm(countryCode, category);

  const sections = useMemo(() => {
    if (!categoryForm) return [];
    return groupFieldsBySection(categoryForm.fields);
  }, [categoryForm]);

  const stepNames = useMemo(() => {
    if (!categoryForm) {
      return ["Country", "Visa Type"];
    }
    return [
      "Country",
      "Visa Type",
      ...sections.map((s) => s.section),
      "Documents",
      "Check & Send",
    ];
  }, [categoryForm, sections]);

  const sectionStartIndex = 2;
  const documentsStepIndex = sectionStartIndex + sections.length;
  const reviewStepIndex = documentsStepIndex + 1;

  const safeStepIndex = Math.min(
    Math.max(0, currentStepIndex),
    Math.max(0, stepNames.length - 1),
  );

  // Sync RHF when draft resets
  useEffect(() => {
    resetRhf(answers);
  }, [answers, resetRhf]);

  const scrollToField = (key: string) => {
    window.requestAnimationFrame(() => {
      const el = document.getElementById(`field-${key}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFieldChange = (key: string, value: AnswerValue) => {
    setAnswer(key, value);
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    setTopErrorTitle(null);
  };

  const handleSelectFile = (docKey: string, entry: UploadedDocumentEntry) => {
    setFiles((prev) => {
      const old = prev[docKey];
      if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);
      return { ...prev, [docKey]: entry };
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[docKey];
      return next;
    });
    setTopErrorTitle(null);
  };

  const handleRemoveFile = (docKey: string) => {
    setFiles((prev) => {
      const old = prev[docKey];
      if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);
      const next = { ...prev };
      delete next[docKey];
      return next;
    });
  };

  const handleLocalDocError = (docKey: string, msg: string | null) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (msg) {
        next[docKey] = msg;
      } else {
        delete next[docKey];
      }
      return next;
    });
  };

  const findStepIndexForKey = (key: string): number => {
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (sec?.fields.some((f) => f.key === key)) {
        return sectionStartIndex + i;
      }
    }
    if (categoryForm?.documents.some((d) => d.key === key)) {
      return documentsStepIndex;
    }
    return reviewStepIndex;
  };

  const getLabelForKey = (key: string): string => {
    const field = categoryForm?.fields.find((f) => f.key === key);
    if (field) return field.label;
    const doc = categoryForm?.documents.find((d) => d.key === key);
    if (doc) return doc.label;
    return key;
  };

  const buildErrorItems = (errorsMap: Record<string, string>): ErrorItem[] => {
    return Object.entries(errorsMap).map(([key, message]) => ({
      key,
      label: getLabelForKey(key),
      message,
      stepIndex: findStepIndexForKey(key),
    }));
  };

  const handleJumpToStep = (stepIdx: number, focusKey?: string) => {
    setTopErrorTitle(null);
    setStepIndex(stepIdx);
    if (focusKey) {
      setTimeout(() => scrollToField(focusKey), 120);
    } else {
      scrollToTop();
    }
  };

  const handleContinue = () => {
    setTopErrorTitle(null);

    if (safeStepIndex === 0) {
      if (!selectedCountry) {
        const msg = "Please choose your destination country first.";
        setTopErrorTitle(msg);
        toast.error(msg);
        scrollToTop();
        return;
      }
      setStepIndex(1);
      scrollToTop();
      return;
    }

    if (safeStepIndex === 1) {
      if (!category || !categoryForm) {
        const msg = "Please choose a visa type to continue.";
        setTopErrorTitle(msg);
        toast.error(msg);
        scrollToTop();
        return;
      }
      setStepIndex(2);
      scrollToTop();
      return;
    }

    if (
      safeStepIndex >= sectionStartIndex &&
      safeStepIndex < documentsStepIndex
    ) {
      const sectionGroup = sections[safeStepIndex - sectionStartIndex];
      if (sectionGroup) {
        const errors = validateSectionFields(sectionGroup.fields, answers);
        if (Object.keys(errors).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...errors }));
          setTopErrorTitle(ERROR_MESSAGES.genericValidation);
          toast.error(ERROR_MESSAGES.genericValidation);
          const firstKey = Object.keys(errors)[0];
          if (firstKey) scrollToField(firstKey);
          return;
        }
      }
      setStepIndex(safeStepIndex + 1);
      scrollToTop();
      return;
    }

    if (safeStepIndex === documentsStepIndex && categoryForm) {
      const docErrors = validateDocumentsMap(categoryForm.documents, files);
      if (Object.keys(docErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...docErrors }));
        setTopErrorTitle(ERROR_MESSAGES.genericValidation);
        toast.error(ERROR_MESSAGES.genericValidation);
        const firstKey = Object.keys(docErrors)[0];
        if (firstKey) scrollToField(firstKey);
        return;
      }
      setStepIndex(reviewStepIndex);
      scrollToTop();
    }
  };

  const handleBack = () => {
    setTopErrorTitle(null);
    if (safeStepIndex <= 0) return;

    // Respect locked pre-selections from unique links
    if (safeStepIndex === 1 && lockedCountryCode) {
      return;
    }
    if (safeStepIndex === 2 && lockedCountryCode && lockedCategory) {
      return;
    }

    setStepIndex(safeStepIndex - 1);
    scrollToTop();
  };

  const handleSubmitFinal = async () => {
    if (!categoryForm || !countryCode || !category) return;

    const allErrors = validateFullApplication(categoryForm, answers, files);
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      setTopErrorTitle(ERROR_MESSAGES.genericValidation);
      toast.error(ERROR_MESSAGES.genericValidation);
      scrollToTop();
      return;
    }

    setIsSubmitting(true);
    setTopErrorTitle(null);

    try {
      const result = await api.submitApplication({
        countryCode,
        category,
        answers,
        intakeToken,
        files,
      });

      setLastSubmission(result);
      resetDraft();
      toast.success("Application sent successfully!");
      router.push("/apply/success");
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        if (Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        }
        setTopErrorTitle(err.message);
        toast.error(err.message);
        scrollToTop();
      } else {
        setTopErrorTitle(ERROR_MESSAGES.serverError);
        toast.error(ERROR_MESSAGES.serverError);
        scrollToTop();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAgain = () => {
    Object.values(files).forEach((entry) => {
      if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
    });
    setFiles({});
    setFieldErrors({});
    setTopErrorTitle(null);
    resetDraft();
    setResumePromptDismissed(true);
  };

  if (linkLoading || countriesLoading || !hasHydrated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-9 w-9 animate-spin text-blue-700" />
        <p className="text-base font-medium text-slate-700">
          Loading your application form...
        </p>
      </div>
    );
  }

  if (linkError || countriesError) {
    const errorMsg =
      linkError ??
      (countriesError instanceof ApiRequestError
        ? countriesError.message
        : ERROR_MESSAGES.serverError);
    return (
      <div className="mx-auto max-w-xl py-8">
        <FriendlyError title={errorMsg} />
        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="h-12 px-6 text-base"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Resume saved draft banner
  if (!intakeToken && hadSavedDraftOnMount && !resumePromptDismissed) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border-2 border-blue-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Continue your saved form?
        </h2>
        <p className="mt-2 text-base text-slate-600">
          We found answers you wrote earlier on this device. Would you like to continue where you stopped, or start a new form?
        </p>
        <p className="mt-2 text-sm font-medium text-blue-800">
          এই ফোনে/কম্পিউটারে আপনার আগের লেখা তথ্য সংরক্ষিত আছে। আপনি কি সেখান থেকেই শুরু করতে চান, নাকি নতুন করে শুরু করবেন?
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => setResumePromptDismissed(true)}
            className="h-12 flex-1 bg-blue-700 text-base font-semibold hover:bg-blue-800"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" aria-hidden="true" />
            Continue
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleStartAgain}
            className="h-12 flex-1 border-slate-300 text-base font-semibold"
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Start again
          </Button>
        </div>
      </div>
    );
  }

  const currentSectionGroup =
    safeStepIndex >= sectionStartIndex && safeStepIndex < documentsStepIndex
      ? sections[safeStepIndex - sectionStartIndex]
      : null;

  const reviewValidationErrors =
    safeStepIndex === reviewStepIndex && categoryForm
      ? {
          ...validateFullApplication(categoryForm, answers, files),
          ...fieldErrors,
        }
      : {};

  const currentStepErrorItems =
    safeStepIndex === reviewStepIndex
      ? buildErrorItems(reviewValidationErrors)
      : currentSectionGroup
        ? buildErrorItems(
            Object.fromEntries(
              currentSectionGroup.fields
                .map((f) => [f.key, fieldErrors[f.key]])
                .filter((pair): pair is [string, string] => Boolean(pair[1])),
            ),
          )
        : safeStepIndex === documentsStepIndex && categoryForm
          ? buildErrorItems(
              Object.fromEntries(
                categoryForm.documents
                  .map((d) => [d.key, fieldErrors[d.key]])
                  .filter((pair): pair is [string, string] => Boolean(pair[1])),
              ),
            )
          : [];

  const canGoBack =
    safeStepIndex > 0 &&
    !(safeStepIndex === 1 && Boolean(lockedCountryCode)) &&
    !(safeStepIndex === 2 && Boolean(lockedCountryCode && lockedCategory));

  return (
    <div className="space-y-6 pb-24 md:pb-10">
      <FormProgress
        steps={stepNames}
        currentIndex={safeStepIndex}
        maxReachableIndex={safeStepIndex}
        onSelectStep={(idx) => {
          if (idx === 0 && lockedCountryCode) return;
          if (idx <= 1 && lockedCountryCode && lockedCategory) return;
          handleJumpToStep(idx);
        }}
      />

      {topErrorTitle && safeStepIndex !== reviewStepIndex && (
        <FriendlyError
          title={topErrorTitle}
          items={currentStepErrorItems}
          onJumpToItem={(item) => scrollToField(item.key)}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {safeStepIndex === 0 && (
          <CountrySelect
            countries={countries}
            selectedCountryCode={countryCode}
            locked={Boolean(lockedCountryCode)}
            onSelectCountry={(country) => {
              setCountry(country.country_code);
              setTopErrorTitle(null);
            }}
          />
        )}

        {safeStepIndex === 1 && selectedCountry && (
          <VisaTypeSelect
            country={selectedCountry}
            selectedCategory={category}
            locked={Boolean(lockedCategory)}
            onSelectCategory={(cat) => {
              setCategory(cat);
              setTopErrorTitle(null);
            }}
          />
        )}

        {safeStepIndex >= 2 && formLoading && (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
            <p className="text-base text-slate-600">Loading form questions...</p>
          </div>
        )}

        {safeStepIndex >= 2 && formError && (
          <FriendlyError
            title={
              formError instanceof ApiRequestError
                ? formError.message
                : ERROR_MESSAGES.formNotFound
            }
          />
        )}

        {currentSectionGroup && categoryForm && (
          <div className="space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {categoryForm.country} — {categoryForm.official_visa_name}
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                {currentSectionGroup.section}
              </h2>
              <p className="text-base text-slate-600">
                {getSectionIntro(currentSectionGroup.section).english}
              </p>
              <p className="text-sm font-medium text-blue-800">
                {getSectionIntro(currentSectionGroup.section).bangla}
              </p>
              <p className="pt-1 text-xs text-slate-500">
                Boxes with <span className="font-bold text-red-600">*</span> must be filled. Boxes marked (Optional) can be left blank if not needed.
              </p>
            </div>

            <div className="space-y-6">
              {currentSectionGroup.fields.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={answers[field.key]}
                  error={fieldErrors[field.key]}
                  onChange={(val) => handleFieldChange(field.key, val)}
                />
              ))}
            </div>
          </div>
        )}

        {safeStepIndex === documentsStepIndex && categoryForm && (
          <div className="space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {categoryForm.country} — {categoryForm.official_visa_name}
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                Upload Your Documents
              </h2>
              <p className="text-base text-slate-600">
                Give a photo or PDF of your papers.
              </p>
              <p className="text-sm font-medium text-blue-800">
                আপনার কাগজপত্রের পরিষ্কার ছবি বা PDF দিন।
              </p>
            </div>

            {Object.keys(files).length === 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Only PDF, JPG, or PNG files are allowed (max 10 MB per file). Boxes marked{" "}
                <span className="font-semibold">Must give</span> are required before sending.
              </div>
            )}

            <div className="space-y-4">
              {categoryForm.documents.map((doc) => (
                <DocumentUploadCard
                  key={doc.key}
                  document={doc}
                  entry={files[doc.key]}
                  error={fieldErrors[doc.key]}
                  onSelectFile={handleSelectFile}
                  onRemoveFile={handleRemoveFile}
                  onLocalError={handleLocalDocError}
                />
              ))}
            </div>
          </div>
        )}

        {safeStepIndex === reviewStepIndex && categoryForm && category && (
          <ReviewSection
            form={categoryForm}
            category={category}
            sections={sections}
            answers={answers}
            files={files}
            errorItems={currentStepErrorItems}
            documentsStepIndex={documentsStepIndex}
            sectionStartIndex={sectionStartIndex}
            onJumpToStep={handleJumpToStep}
          />
        )}
      </div>

      {/* Bottom Navigation Bar (sticky on mobile, normal on desktop) */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-[800px] items-center justify-between gap-3">
          {canGoBack ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              className="h-12 min-w-28 border-slate-300 bg-white px-5 text-base font-semibold text-slate-800"
            >
              <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {safeStepIndex < reviewStepIndex ? (
            <Button
              type="button"
              onClick={handleContinue}
              disabled={
                (safeStepIndex === 0 && !selectedCountry) ||
                (safeStepIndex === 1 && (!category || formLoading))
              }
              className="h-12 flex-1 bg-blue-700 px-6 text-base font-semibold text-white hover:bg-blue-800 sm:flex-initial sm:min-w-44"
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmitFinal}
              disabled={isSubmitting}
              className="h-12 flex-1 bg-emerald-700 px-7 text-base font-semibold text-white hover:bg-emerald-800 sm:flex-initial sm:min-w-52"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Sending… please wait
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" aria-hidden="true" />
                  Check &amp; Send
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
