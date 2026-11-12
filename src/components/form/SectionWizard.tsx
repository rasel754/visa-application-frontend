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
import { OtpVerificationCard } from "@/components/form/OtpVerificationCard";
import { ProfessionSelect } from "@/components/form/ProfessionSelect";
import { ReviewSection } from "@/components/form/ReviewSection";
import { useCountries } from "@/hooks/useCountries";
import { useVisitForm } from "@/hooks/useVisitForm";
import { ApiRequestError, api } from "@/lib/api";
import { normalizeBdMobileInput } from "@/lib/bd-validation";
import { ERROR_MESSAGES, localizeErrorMessage } from "@/lib/error-messages";
import {
  formatProfessionLabel,
  getLocalizedCountryName,
  getLocalizedDocumentLabel,
  getLocalizedFieldLabel,
  getLocalizedSectionIntro,
  getLocalizedSectionName,
  getLocalizedVisaName,
  groupFieldsBySection,
} from "@/lib/field-helpers";
import {
  validateDocumentsMap,
  validateFieldValue,
  validateFullApplication,
  validateSectionFields,
} from "@/lib/form-validation";
import { getUiStrings } from "@/lib/i18n/translations";
import {
  AnswerValue,
  CountrySummary,
  FormAnswers,
  FormField,
  ProfessionKey,
  UploadedDocumentEntry,
} from "@/lib/types";
import { useIntakeStore } from "@/store/intake-store";
import { useLanguageStore } from "@/store/language-store";

interface SectionWizardProps {
  intakeToken?: string;
}

export function SectionWizard({ intakeToken }: SectionWizardProps) {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);

  const {
    countryCode,
    profession,
    answers,
    currentStepIndex,
    savedAt,
    hasHydrated,
    setCountry,
    setProfession,
    setAnswer,
    setAnswersBulk,
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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReviewSection, setEditingReviewSection] = useState<string | null>(
    null,
  );

  // OTP verification modal/step state
  const [otpStage, setOtpStage] = useState<{
    phone: string;
    expiresInSeconds: number;
    devOtp?: string | null;
    sendSeq: number;
  } | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifiedOtpToken, setVerifiedOtpToken] = useState<{
    phone: string;
    token: string;
  } | null>(null);

  // Resume prompt state for standard /apply
  const [resumePromptDismissed, setResumePromptDismissed] = useState(false);
  const [hadSavedDraftOnMount, setHadSavedDraftOnMount] = useState(false);
  const checkedDraftRef = useRef(false);

  // Unique intake link state
  const [linkLoading, setLinkLoading] = useState(Boolean(intakeToken));
  const [linkError, setLinkError] = useState<string | null>(null);
  const [lockedCountryCode, setLockedCountryCode] = useState<string | null>(null);
  const [lockedProfession, setLockedProfession] = useState<ProfessionKey | null>(
    null,
  );
  const linkInitializedRef = useRef(false);

  const {
    data: countries = [],
    isLoading: countriesLoading,
    error: countriesError,
  } = useCountries();

  useEffect(() => {
    return () => {
      Object.values(filesRef.current).forEach((entry) => {
        if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      });
    };
  }, []);

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
        if (res.profession) {
          setLockedProfession(res.profession);
          setProfession(res.profession);
        } else if (res.country_code) {
          setProfession(null);
        }

        if (res.country_code && res.profession) {
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
  }, [intakeToken, setCountry, setProfession, setStepIndex]);

  const selectedCountry: CountrySummary | null = useMemo(() => {
    if (!countryCode) return null;
    return (
      countries.find(
        (c) => c.country_code.toUpperCase() === countryCode.toUpperCase(),
      ) ?? null
    );
  }, [countries, countryCode]);

  const {
    data: visitForm,
    isLoading: formLoading,
    error: formError,
  } = useVisitForm(countryCode);

  const selectedProfile = useMemo(() => {
    if (!visitForm || !profession) return null;
    return visitForm.applicant_profiles[profession] ?? null;
  }, [visitForm, profession]);

  const sections = useMemo(() => {
    if (!visitForm || !selectedProfile || !profession) return [];
    return [
      ...groupFieldsBySection(visitForm.common_information_fields, "common"),
      ...groupFieldsBySection(
        selectedProfile.profile_information_fields,
        profession,
      ),
    ];
  }, [visitForm, selectedProfile, profession]);

  const allFields = useMemo(() => {
    if (!visitForm || !selectedProfile) return [];
    return [
      ...visitForm.common_information_fields,
      ...selectedProfile.profile_information_fields,
    ];
  }, [visitForm, selectedProfile]);

  const commonDocuments = useMemo(
    () => visitForm?.common_required_documents ?? [],
    [visitForm],
  );

  const additionalDocuments = useMemo(
    () => selectedProfile?.additional_documents ?? [],
    [selectedProfile],
  );

  const allDocuments = useMemo(
    () => [...commonDocuments, ...additionalDocuments],
    [commonDocuments, additionalDocuments],
  );

  const stepNames = useMemo(() => {
    if (!visitForm || !profession) {
      return [t.progress.stepCountry, t.progress.stepProfession];
    }
    return [
      t.progress.stepCountry,
      t.progress.stepProfession,
      ...sections.map((s) => getLocalizedSectionName(s.section, language)),
      t.progress.stepDocuments,
      t.progress.stepReview,
    ];
  }, [visitForm, profession, sections, language, t]);

  const sectionStartIndex = 2;
  const documentsStepIndex = sectionStartIndex + sections.length;
  const reviewStepIndex = documentsStepIndex + 1;

  const safeStepIndex = Math.min(
    Math.max(0, currentStepIndex),
    Math.max(0, stepNames.length - 1),
  );

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

  const handleFieldChange = (field: FormField, value: AnswerValue) => {
    setAnswer(field.key, value);

    if (field.key === "phone_primary") {
      setVerifiedOtpToken(null);
    }

    const nextAnswers: FormAnswers = { ...answers, [field.key]: value };
    if (fieldErrors[field.key]) {
      const nextErr = validateFieldValue(field, value, nextAnswers);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (nextErr) {
          next[field.key] = nextErr;
        } else {
          delete next[field.key];
        }
        return next;
      });
    }
    setTopErrorTitle(null);
  };

  const handleFieldBlur = (field: FormField) => {
    const err = validateFieldValue(field, answers[field.key], answers);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (err) {
        next[field.key] = err;
      } else {
        delete next[field.key];
      }
      return next;
    });
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
    if (allDocuments.some((d) => d.key === key)) {
      return documentsStepIndex;
    }
    return reviewStepIndex;
  };

  const getLabelForKey = (key: string): string => {
    const field = allFields.find((f) => f.key === key);
    if (field) return getLocalizedFieldLabel(field, language);
    const doc = allDocuments.find((d) => d.key === key);
    if (doc) return getLocalizedDocumentLabel(doc, language);
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
    setOtpStage(null);
    setOtpError(null);
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
        const canonicalMsg = "Please choose your destination country first.";
        setTopErrorTitle(canonicalMsg);
        toast.error(t.wizard.chooseCountryFirst);
        scrollToTop();
        return;
      }
      setStepIndex(1);
      scrollToTop();
      return;
    }

    if (safeStepIndex === 1) {
      if (!profession || !visitForm) {
        const canonicalMsg = "Please choose your profession to continue.";
        setTopErrorTitle(canonicalMsg);
        toast.error(t.wizard.chooseProfessionFirst);
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
          toast.error(
            localizeErrorMessage(ERROR_MESSAGES.genericValidation, language),
          );
          const firstKey = Object.keys(errors)[0];
          if (firstKey) scrollToField(firstKey);
          return;
        }
      }
      setStepIndex(safeStepIndex + 1);
      scrollToTop();
      return;
    }

    if (safeStepIndex === documentsStepIndex) {
      const docErrors = validateDocumentsMap(allDocuments, files);
      if (Object.keys(docErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...docErrors }));
        setTopErrorTitle(ERROR_MESSAGES.genericValidation);
        toast.error(
          localizeErrorMessage(ERROR_MESSAGES.genericValidation, language),
        );
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

    if (safeStepIndex === 1 && lockedCountryCode) {
      return;
    }
    if (safeStepIndex === 2 && lockedCountryCode && lockedProfession) {
      return;
    }

    setStepIndex(safeStepIndex - 1);
    scrollToTop();
  };

  const submitApplicationWithOtpToken = async (
    otpTokenToUse: string,
  ): Promise<boolean> => {
    if (!visitForm || !countryCode || !profession) return false;

    setIsSubmitting(true);
    try {
      const result = await api.submitApplication({
        countryCode,
        profession,
        answers,
        intakeToken,
        otpToken: otpTokenToUse,
        files,
      });

      setLastSubmission(result);
      resetDraft();
      setOtpStage(null);
      setVerifiedOtpToken(null);
      toast.success(t.wizard.applicationSentToast);
      router.push("/apply/success");
      return true;
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401 || err.message === ERROR_MESSAGES.otpAlreadyUsed) {
          setVerifiedOtpToken(null);
          setOtpError(err.message);
          toast.error(localizeErrorMessage(err.message, language));
          return false;
        }
        if (Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        }
        setOtpStage(null);
        setTopErrorTitle(err.message);
        toast.error(localizeErrorMessage(err.message, language));
        scrollToTop();
      } else {
        setOtpError(ERROR_MESSAGES.serverError);
        toast.error(localizeErrorMessage(ERROR_MESSAGES.serverError, language));
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOtpAndSubmit = async () => {
    if (!visitForm || !countryCode || !profession) return;

    if (editingReviewSection) {
      const localizedSec = getLocalizedSectionName(
        editingReviewSection,
        language,
      );
      toast.error(t.wizard.finishEditingSectionFirst(localizedSec));
      const secEl = document.getElementById(
        `review-section-${editingReviewSection}`,
      );
      if (secEl) {
        secEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const allErrors = validateFullApplication(
      allFields,
      allDocuments,
      answers,
      files,
    );
    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      setTopErrorTitle(ERROR_MESSAGES.genericValidation);
      toast.error(
        localizeErrorMessage(ERROR_MESSAGES.genericValidation, language),
      );
      scrollToTop();
      return;
    }

    const rawPhone =
      typeof answers["phone_primary"] === "string"
        ? answers["phone_primary"]
        : "";
    const normalizedPhone = normalizeBdMobileInput(rawPhone);

    // If user already holds a valid unconsumed token for this exact number, submit directly
    if (verifiedOtpToken && verifiedOtpToken.phone === normalizedPhone) {
      await submitApplicationWithOtpToken(verifiedOtpToken.token);
      return;
    }

    setIsSendingOtp(true);
    setTopErrorTitle(null);
    setOtpError(null);

    try {
      const res = await api.sendOtp(normalizedPhone);
      setOtpStage((prev) => ({
        phone: normalizedPhone,
        expiresInSeconds: res.expiresInSeconds,
        devOtp: res.devOtp ?? null,
        sendSeq: (prev?.sendSeq ?? 0) + 1,
      }));
      toast.success(t.wizard.otpSentToast);
      scrollToTop();
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      setTopErrorTitle(msg);
      toast.error(localizeErrorMessage(msg, language));
      scrollToTop();
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpStage) return;
    setIsSendingOtp(true);
    setOtpError(null);

    try {
      const res = await api.sendOtp(otpStage.phone);
      setOtpStage((prev) =>
        prev
          ? {
              ...prev,
              expiresInSeconds: res.expiresInSeconds,
              devOtp: res.devOtp ?? null,
              sendSeq: prev.sendSeq + 1,
            }
          : null,
      );
      toast.success(t.wizard.otpResentToast);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      setOtpError(msg);
      toast.error(localizeErrorMessage(msg, language));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndSubmit = async (code: string) => {
    if (!otpStage) return;
    setIsSubmitting(true);
    setOtpError(null);

    try {
      const verifyRes = await api.verifyOtp(otpStage.phone, code);
      setVerifiedOtpToken({
        phone: otpStage.phone,
        token: verifyRes.otpToken,
      });
      await submitApplicationWithOtpToken(verifyRes.otpToken);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      setOtpError(msg);
      toast.error(localizeErrorMessage(msg, language));
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
    setOtpStage(null);
    setOtpError(null);
    setVerifiedOtpToken(null);
    resetDraft();
    setResumePromptDismissed(true);
  };

  if (linkLoading || countriesLoading || !hasHydrated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-9 w-9 animate-spin text-blue-700" />
        <p className="text-base font-medium text-slate-700">
          {t.wizard.loadingForm}
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
            {t.wizard.backToHome}
          </Button>
        </div>
      </div>
    );
  }

  if (!intakeToken && hadSavedDraftOnMount && !resumePromptDismissed) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border-2 border-blue-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">
          {t.wizard.resumeTitle}
        </h2>
        <p className="mt-2 text-base text-slate-600">{t.wizard.resumeBody}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => setResumePromptDismissed(true)}
            className="h-12 flex-1 bg-blue-700 text-base font-semibold hover:bg-blue-800"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" aria-hidden="true" />
            {t.wizard.resumeContinue}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleStartAgain}
            className="h-12 flex-1 border-slate-300 text-base font-semibold"
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            {t.wizard.resumeStartAgain}
          </Button>
        </div>
      </div>
    );
  }

  if (otpStage) {
    return (
      <div className="space-y-6 pb-10">
        <OtpVerificationCard
          key={otpStage.sendSeq}
          phone={otpStage.phone}
          initialExpiresSeconds={otpStage.expiresInSeconds}
          devOtp={otpStage.devOtp}
          errorMessage={otpError}
          isVerifying={isSubmitting}
          isResending={isSendingOtp}
          onVerifyAndSubmit={handleVerifyAndSubmit}
          onResendOtp={handleResendOtp}
          onBackToReview={() => {
            setOtpStage(null);
            setOtpError(null);
            scrollToTop();
          }}
        />
      </div>
    );
  }

  const currentSectionGroup =
    safeStepIndex >= sectionStartIndex && safeStepIndex < documentsStepIndex
      ? sections[safeStepIndex - sectionStartIndex]
      : null;

  const reviewValidationErrors =
    safeStepIndex === reviewStepIndex && visitForm && profession
      ? {
          ...validateFullApplication(allFields, allDocuments, answers, files),
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
        : safeStepIndex === documentsStepIndex
          ? buildErrorItems(
              Object.fromEntries(
                allDocuments
                  .map((d) => [d.key, fieldErrors[d.key]])
                  .filter((pair): pair is [string, string] => Boolean(pair[1])),
              ),
            )
          : [];

  const canGoBack =
    safeStepIndex > 0 &&
    !(safeStepIndex === 1 && Boolean(lockedCountryCode)) &&
    !(safeStepIndex === 2 && Boolean(lockedCountryCode && lockedProfession));

  const professionDisplay = profession
    ? formatProfessionLabel(profession, language)
    : "";
  const localizedCountry = visitForm
    ? getLocalizedCountryName(visitForm.country_code, visitForm.country, language)
    : "";
  const localizedVisaName = visitForm
    ? getLocalizedVisaName(visitForm.official_visa_name, language)
    : "";

  return (
    <div className="space-y-6 pb-24 md:pb-10">
      <FormProgress
        steps={stepNames}
        currentIndex={safeStepIndex}
        maxReachableIndex={safeStepIndex}
        onSelectStep={(idx) => {
          if (idx === 0 && lockedCountryCode) return;
          if (idx <= 1 && lockedCountryCode && lockedProfession) return;
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
          <ProfessionSelect
            country={selectedCountry}
            visitForm={visitForm}
            isLoading={formLoading}
            errorMessage={
              formError
                ? formError instanceof ApiRequestError
                  ? formError.message
                  : ERROR_MESSAGES.formNotFound
                : null
            }
            selectedProfession={profession}
            locked={Boolean(lockedProfession)}
            onSelectProfession={(prof) => {
              setProfession(prof);
              setTopErrorTitle(null);
            }}
          />
        )}

        {safeStepIndex >= 2 && formLoading && (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
            <p className="text-base text-slate-600">
              {t.wizard.loadingQuestions}
            </p>
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

        {currentSectionGroup && visitForm && (
          <div className="space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {localizedCountry} — {localizedVisaName} • {professionDisplay}
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                {getLocalizedSectionName(currentSectionGroup.section, language)}
              </h2>
              <p className="text-base text-slate-600">
                {getLocalizedSectionIntro(currentSectionGroup.section, language)}
              </p>
              <p className="pt-1 text-xs text-slate-500">
                {t.wizard.requiredLegendBeforeStar}{" "}
                <span className="font-bold text-red-600">*</span>{" "}
                {t.wizard.requiredLegendMiddle}{" "}
                <span className="font-medium">{t.optionalTag}</span>{" "}
                {t.wizard.requiredLegendAfterOptional}
              </p>
            </div>

            <div className="space-y-6">
              {currentSectionGroup.fields.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={answers[field.key]}
                  allAnswers={answers}
                  error={fieldErrors[field.key]}
                  onChange={(val) => handleFieldChange(field, val)}
                  onBlurValidate={() => handleFieldBlur(field)}
                />
              ))}
            </div>
          </div>
        )}

        {safeStepIndex === documentsStepIndex && visitForm && profession && (
          <div className="space-y-6">
            <div className="space-y-1 border-b border-slate-100 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {localizedCountry} — {localizedVisaName} • {professionDisplay}
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                {t.wizard.docsTitle}
              </h2>
              <p className="text-base text-slate-600">{t.wizard.docsSubtitle}</p>
            </div>

            {Object.keys(files).length === 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                {t.wizard.docsRuleNoticeBeforeBadge}{" "}
                <span className="font-semibold">{t.wizard.docsRuleBadge}</span>{" "}
                {t.wizard.docsRuleNoticeAfterBadge}
              </div>
            )}

            {/* Common Documents Group */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {t.wizard.commonDocsHeading}
                </h3>
              </div>
              {commonDocuments.map((doc) => (
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

            {/* Profession-specific Additional Documents Group */}
            {additionalDocuments.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="border-b border-blue-200 pb-2">
                  <h3 className="text-lg font-bold text-blue-950">
                    {t.wizard.additionalDocsHeading(professionDisplay)}
                  </h3>
                </div>
                {additionalDocuments.map((doc) => (
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
            )}
          </div>
        )}

        {safeStepIndex === reviewStepIndex && visitForm && profession && (
          <ReviewSection
            visitForm={visitForm}
            profession={profession}
            sections={sections}
            commonDocuments={commonDocuments}
            additionalDocuments={additionalDocuments}
            answers={answers}
            files={files}
            errorItems={currentStepErrorItems}
            editingSection={editingReviewSection}
            onEditingSectionChange={setEditingReviewSection}
            onSaveSection={(fields, updates) => {
              setAnswersBulk(updates);
              if ("phone_primary" in updates) {
                setVerifiedOtpToken(null);
              }
              setFieldErrors((prev) => {
                const next = { ...prev };
                for (const f of fields) {
                  delete next[f.key];
                }
                return next;
              });
              setTopErrorTitle(null);
            }}
            onSelectFile={handleSelectFile}
            onRemoveFile={handleRemoveFile}
            onJumpToStep={handleJumpToStep}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-[800px] items-center justify-between gap-3">
          {canGoBack ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSendingOtp || isSubmitting}
              className="h-12 min-w-28 border-slate-300 bg-white px-5 text-base font-semibold text-slate-800"
            >
              <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
              {t.backButton}
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
                (safeStepIndex === 1 && (!profession || formLoading))
              }
              className="h-12 flex-1 bg-blue-700 px-6 text-base font-semibold text-white hover:bg-blue-800 sm:flex-initial sm:min-w-44"
            >
              {t.continueButton}
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleStartOtpAndSubmit}
              disabled={isSendingOtp || isSubmitting}
              className="h-12 flex-1 bg-emerald-700 px-7 text-base font-semibold text-white hover:bg-emerald-800 sm:flex-initial sm:min-w-52"
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  {t.wizard.sendingOtp}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" aria-hidden="true" />
                  {t.wizard.sendOtpAndSubmit}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
