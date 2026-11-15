"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit2,
  Loader2,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BD_MOBILE_FULL_REGEX,
  extractBdMobileLocalPart,
  normalizeBdMobileInput,
} from "@/lib/bd-validation";
import { localizeErrorMessage } from "@/lib/error-messages";
import { normalizeBengaliDigits, toBanglaDigits } from "@/lib/i18n/bangla-data";
import { getUiStrings } from "@/lib/i18n/translations";
import { FormLanguage, useLanguageStore } from "@/store/language-store";

interface OtpVerificationCardProps {
  phone: string;
  initialExpiresSeconds: number;
  devOtp?: string | null;
  errorMessage: string | null;
  isVerifying: boolean;
  isResending: boolean;
  dailyRemaining?: number;
  onVerifyAndSubmit: (code: string) => void;
  onResendOtp: () => void;
  onBackToReview: () => void;
  onUpdatePhoneAndSendOtp?: (newPhone: string) => Promise<boolean>;
}

export function formatBangladeshiPhoneForDisplay(phone: string): string {
  const trimmed = phone.trim();
  const local = trimmed.startsWith("+88") ? trimmed.slice(3) : trimmed;
  if (local.length === 11) {
    return `+88 ${local.slice(0, 5)}-${local.slice(5)}`;
  }
  return trimmed;
}

function formatCountdown(seconds: number, language: FormLanguage): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  const formatted = `${mins}:${String(secs).padStart(2, "0")}`;
  return language === "bn" ? toBanglaDigits(formatted) : formatted;
}

export function OtpVerificationCard({
  phone,
  initialExpiresSeconds,
  devOtp,
  errorMessage,
  isVerifying,
  isResending,
  dailyRemaining = 2,
  onVerifyAndSubmit,
  onResendOtp,
  onBackToReview,
  onUpdatePhoneAndSendOtp,
}: OtpVerificationCardProps) {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);

  // 6 separate digit slots for bigger, premium OTP input
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [expiryLeft, setExpiryLeft] = useState(initialExpiresSeconds);

  // Phone editing state at the OTP page
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhoneLocalPart, setEditPhoneLocalPart] = useState(() =>
    extractBdMobileLocalPart(phone),
  );
  const [phoneEditError, setPhoneEditError] = useState<string | null>(null);
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Reset countdown & digits whenever a new OTP is sent
  useEffect(() => {
    setExpiryLeft(initialExpiresSeconds);
    setDigits(["", "", "", "", "", ""]);
    setEditPhoneLocalPart(extractBdMobileLocalPart(phone));
    // Auto-focus first digit box
    const firstInput = inputRefs.current[0];
    if (firstInput && !isEditingPhone) {
      firstInput.focus();
    }
  }, [initialExpiresSeconds, devOtp, phone, isEditingPhone]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpiryLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isExpired = expiryLeft <= 0;
  const fullCode = digits.join("");
  const formattedPhone = formatBangladeshiPhoneForDisplay(phone);
  const localizedError = errorMessage
    ? localizeErrorMessage(errorMessage, language)
    : "";

  const handleDigitChange = (index: number, rawVal: string) => {
    if (isVerifying || isExpired) return;

    const normalized = normalizeBengaliDigits(rawVal).replace(/\D/g, "");

    // Handling pasted multi-digit text
    if (normalized.length > 1) {
      const sliceDigits = normalized.slice(0, 6).split("");
      const nextDigits = ["", "", "", "", "", ""];
      sliceDigits.forEach((ch, idx) => {
        nextDigits[idx] = ch;
      });
      setDigits(nextDigits);
      const focusTarget = Math.min(sliceDigits.length, 5);
      inputRefs.current[focusTarget]?.focus();
      return;
    }

    const singleDigit = normalized.slice(-1);
    const next = [...digits];
    next[index] = singleDigit;
    setDigits(next);

    // Auto-advance to next slot
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        e.preventDefault();
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const normalized = normalizeBengaliDigits(pasted).replace(/\D/g, "").slice(0, 6);
    if (!normalized) return;

    const next = ["", "", "", "", "", ""];
    normalized.split("").forEach((ch, idx) => {
      next[idx] = ch;
    });
    setDigits(next);

    const targetIdx = Math.min(normalized.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  const handleResendClick = () => {
    if (dailyRemaining <= 0) return;
    setExpiryLeft(initialExpiresSeconds);
    setDigits(["", "", "", "", "", ""]);
    onResendOtp();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying || isExpired || fullCode.length !== 6) return;
    onVerifyAndSubmit(fullCode);
  };

  // Requirement 5: Save new number and send OTP to this updated number
  const handleSavePhoneAndSendOtp = async () => {
    setPhoneEditError(null);
    const cleanedDigits = normalizeBengaliDigits(editPhoneLocalPart).replace(/\D/g, "");
    const candidateNormalized = normalizeBdMobileInput(cleanedDigits);

    if (!BD_MOBILE_FULL_REGEX.test(candidateNormalized)) {
      setPhoneEditError(
        language === "bn"
          ? "সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর লিখুন (০১XXXXXXXXX)।"
          : "Enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX).",
      );
      return;
    }

    if (onUpdatePhoneAndSendOtp) {
      setIsSavingPhone(true);
      const success = await onUpdatePhoneAndSendOtp(candidateNormalized);
      setIsSavingPhone(false);
      if (success) {
        setIsEditingPhone(false);
      }
    }
  };

  const dailyUsed = Math.max(0, 3 - dailyRemaining);

  return (
    <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_16px_50px_-12px_rgba(15,23,42,0.08)] sm:p-9">
      {/* Top subtle decorative accent */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700" />

      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
          <ShieldCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            {t.otp.title}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
            {language === "bn"
              ? "নিরাপদ ওটিপি যাচাইকরণের মাধ্যমে আবেদন সম্পন্ন করুন"
              : "Complete your application with secure OTP verification"}
          </p>
        </div>
      </div>

      {/* Phone Number Box / Editable Target (Requirement 5) */}
      <div className="mt-6 rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/90 to-indigo-50/50 p-4 sm:p-5">
        {!isEditingPhone ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-900/70">
                {t.otp.sentToPrompt}
              </span>
              <p className="font-mono text-xl font-extrabold text-slate-900 tracking-wide sm:text-2xl">
                {formattedPhone}
              </p>
              <div className="flex items-center gap-1.5 pt-0.5 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  {language === "bn"
                    ? "সর্বশেষ সংরক্ষিত মোবাইল নম্বর"
                    : "Last saved mobile number"}
                </span>
              </div>
            </div>

            {onUpdatePhoneAndSendOtp && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setPhoneEditError(null);
                  setEditPhoneLocalPart(extractBdMobileLocalPart(phone));
                  setIsEditingPhone(true);
                }}
                className="h-10 shrink-0 border-blue-300 bg-white px-3.5 text-xs font-bold text-blue-800 shadow-xs hover:border-blue-400 hover:bg-blue-50/80"
              >
                <Edit2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {language === "bn" ? "নম্বর পরিবর্তন করুন" : "Change Number"}
              </Button>
            )}
          </div>
        ) : (
          /* Inline Phone Editor */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="edit-phone-input"
                className="text-sm font-bold text-blue-950"
              >
                {language === "bn"
                  ? "নতুন মোবাইল নম্বর দিন"
                  : "Enter New Mobile Number"}
              </Label>
              <span className="text-xs font-medium text-slate-500">
                {editPhoneLocalPart.length}/11
              </span>
            </div>

            <div className="flex h-12 w-full overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 shadow-xs">
              <span className="flex shrink-0 items-center border-r border-slate-300 bg-slate-100 px-3.5 text-base font-bold text-slate-800 select-none">
                +88
              </span>
              <Input
                id="edit-phone-input"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                value={editPhoneLocalPart}
                onChange={(e) => {
                  let digitsOnly = normalizeBengaliDigits(e.target.value).replace(/\D/g, "");
                  if (digitsOnly.startsWith("8801") && digitsOnly.length >= 13) {
                    digitsOnly = digitsOnly.slice(2);
                  }
                  digitsOnly = digitsOnly.slice(0, 11);
                  setEditPhoneLocalPart(digitsOnly);
                }}
                placeholder="01XXXXXXXXX"
                className="h-full border-0 font-mono text-base font-bold text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <p className="text-xs text-slate-600">
              {language === "bn"
                ? "সংরক্ষণ করলে এই নম্বরে নতুন ওটিপি পাঠানো হবে এবং আবেদনের মোবাইল নম্বর আপডেট হবে।"
                : "Saving will send a new OTP to this number and update your application phone."}
            </p>

            {phoneEditError && (
              <p className="text-xs font-semibold text-red-600">{phoneEditError}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                disabled={isSavingPhone || editPhoneLocalPart.length < 11}
                onClick={handleSavePhoneAndSendOtp}
                className="h-10 bg-blue-700 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-800"
              >
                {isSavingPhone ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    {language === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving & Sending..."}
                  </>
                ) : (
                  <>
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    {language === "bn" ? "সংরক্ষণ করুন ও ওটিপি পাঠান" : "Save & Send OTP"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSavingPhone}
                onClick={() => {
                  setPhoneEditError(null);
                  setIsEditingPhone(false);
                }}
                className="h-10 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Requirement 6: Daily Quota Notice */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-700">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="h-4 w-4 text-blue-600" />
          {language === "bn" ? "দৈনিক ওটিপি কোটা:" : "Daily OTP Quota:"}
        </span>
        <span className="font-bold text-slate-900">
          {language === "bn"
            ? `${toBanglaDigits(dailyUsed)}/৩ বার ব্যবহৃত (${toBanglaDigits(dailyRemaining)} বার বাকি)`
            : `${dailyUsed} of 3 used (${dailyRemaining} remaining today)`}
        </span>
      </div>

      {devOtp && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-xs">
          <div>
            <span className="font-bold">{t.otp.devModeLabel} </span>
            <span className="text-xs text-amber-800">
              {language === "bn" ? "(পরীক্ষামূলক ওটিপি)" : "(Testing OTP code)"}
            </span>
          </div>
          <code className="rounded-lg bg-amber-200/70 px-2.5 py-1 font-mono text-lg font-black tracking-widest text-amber-950">
            {devOtp}
          </code>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="otp-slot-0"
              className="text-base font-bold text-slate-900"
            >
              {t.otp.enterCodeLabel}
            </Label>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                isExpired
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100/80 text-blue-800"
              }`}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {isExpired
                ? t.otp.expiredBadge
                : formatCountdown(expiryLeft, language)}
            </span>
          </div>

          {/* Requirement 7: Extra Big 6-Digit OTP Input Boxes */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {digits.map((digit, idx) => {
              const isFilled = Boolean(digit);
              return (
                <input
                  key={`otp-slot-${idx}`}
                  id={`otp-slot-${idx}`}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  disabled={isVerifying || isExpired}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  onPaste={handleDigitPaste}
                  className={`h-16 w-11 sm:h-20 sm:w-16 rounded-2xl border-2 text-center font-mono text-3xl sm:text-4xl font-black text-slate-900 transition-all duration-150 outline-none select-none ${
                    isFilled
                      ? "border-slate-800 bg-white shadow-xs"
                      : "border-slate-300 bg-slate-50/60"
                  } focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50`}
                  placeholder="•"
                />
              );
            })}
          </div>

          <p className="text-center text-xs font-medium text-slate-500">
            {t.otp.validInfo}
          </p>
        </div>

        {isExpired && !errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
            <p>{t.otp.expiredAlert}</p>
          </div>
        )}

        {localizedError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
            <p>{localizedError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isVerifying || isExpired || fullCode.length !== 6}
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-lg font-extrabold text-white shadow-md shadow-emerald-700/20 transition-all duration-200 hover:from-emerald-700 hover:to-teal-800 hover:shadow-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              {t.otp.verifyingAndSubmitting}
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" aria-hidden="true" />
              {t.otp.verifyAndSubmit}
            </>
          )}
        </Button>

        {/* Action Row */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Requirement 2 & 6: Resend OTP control */}
          {isExpired ? (
            <Button
              type="button"
              variant="outline"
              disabled={isResending || isVerifying || dailyRemaining <= 0}
              onClick={handleResendClick}
              className="h-11 rounded-xl border-blue-600 bg-blue-50 text-sm font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                  {t.otp.sendingNewCode}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  {dailyRemaining <= 0
                    ? language === "bn"
                      ? "আজকের সীমা শেষ (৩/৩)"
                      : "Daily limit reached (3/3)"
                    : t.otp.resendCode}
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span>
                {language === "bn"
                  ? `ওটিপির মেয়াদ শেষ হতে বাকি: ${formatCountdown(expiryLeft, language)}`
                  : `Active OTP: ${formatCountdown(expiryLeft, language)} (Resend button appears after expire)`}
              </span>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            disabled={isVerifying}
            onClick={onBackToReview}
            className="h-11 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t.otp.backToReview}
          </Button>
        </div>
      </form>
    </div>
  );
}
