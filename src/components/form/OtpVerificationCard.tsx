"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  onVerifyAndSubmit: (code: string) => void;
  onResendOtp: () => void;
  onBackToReview: () => void;
}

export function maskBangladeshiPhone(phone: string): string {
  const trimmed = phone.trim();
  const local = trimmed.startsWith("+88") ? trimmed.slice(3) : trimmed;
  if (local.length === 11) {
    return `+88 ${local.slice(0, 3)}**-***${local.slice(8)}`;
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
  onVerifyAndSubmit,
  onResendOtp,
  onBackToReview,
}: OtpVerificationCardProps) {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);

  const [code, setCode] = useState("");
  const [expiryLeft, setExpiryLeft] = useState(initialExpiresSeconds);

  // Reset timers whenever a fresh OTP send happens
  useEffect(() => {
    setExpiryLeft(initialExpiresSeconds);
    setCode("");
  }, [initialExpiresSeconds, devOtp]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpiryLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isExpired = expiryLeft <= 0;
  const maskedPhone = maskBangladeshiPhone(phone);
  const localizedError = errorMessage
    ? localizeErrorMessage(errorMessage, language)
    : "";

  const handleResendClick = () => {
    setExpiryLeft(initialExpiresSeconds);
    setCode("");
    onResendOtp();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying || isExpired || code.length !== 6) return;
    onVerifyAndSubmit(code);
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {t.otp.title}
          </h2>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
        <p className="text-sm text-slate-700">{t.otp.sentToPrompt}</p>
        <p className="mt-1 font-mono text-lg font-bold text-slate-900">
          {maskedPhone}
        </p>
      </div>

      {devOtp && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
          <span className="font-semibold">{t.otp.devModeLabel} </span>
          <code className="font-mono text-base font-bold">{devOtp}</code>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="otp-code-input"
              className="text-base font-semibold text-slate-900"
            >
              {t.otp.enterCodeLabel}
            </Label>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isExpired
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {isExpired
                ? t.otp.expiredBadge
                : formatCountdown(expiryLeft, language)}
            </span>
          </div>

          <Input
            id="otp-code-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              const digitsOnly = normalizeBengaliDigits(e.target.value)
                .replace(/\D/g, "")
                .slice(0, 6);
              setCode(digitsOnly);
            }}
            placeholder="000000"
            className="h-14 text-center font-mono text-2xl font-bold tracking-[0.4em] text-slate-900 placeholder:tracking-[0.2em] placeholder:text-slate-300"
          />

          <p className="text-xs text-slate-500">{t.otp.validInfo}</p>
        </div>

        {isExpired && !errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{t.otp.expiredAlert}</p>
          </div>
        )}

        {localizedError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{localizedError}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isVerifying || isExpired || code.length !== 6}
          className="h-13 w-full bg-emerald-700 text-base font-bold text-white hover:bg-emerald-800"
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

        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Requirement 2: User can't click resend button during existing OTP expiry time; only show resend after expire */}
          {isExpired ? (
            <Button
              type="button"
              variant="outline"
              disabled={isResending || isVerifying}
              onClick={handleResendClick}
              className="h-11 border-blue-600 bg-blue-50 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                  {t.otp.sendingNewCode}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  {t.otp.resendCode}
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span>
                {language === "bn"
                  ? `ওটিপির মেয়াদ শেষ হতে বাকি: ${formatCountdown(expiryLeft, language)} (মেয়াদ শেষ হলে পুনরায় কোড পাঠানো যাবে)`
                  : `Current OTP active: ${formatCountdown(expiryLeft, language)} (Resend button appears after expire)`}
              </span>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            disabled={isVerifying}
            onClick={onBackToReview}
            className="h-11 text-sm font-medium text-slate-600"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t.otp.backToReview}
          </Button>
        </div>
      </form>
    </div>
  );
}
