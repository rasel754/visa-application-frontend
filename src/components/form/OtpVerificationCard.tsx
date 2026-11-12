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
import { getBanglaError } from "@/lib/error-messages";

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

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
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
  const [code, setCode] = useState("");
  const [expiryLeft, setExpiryLeft] = useState(initialExpiresSeconds);
  const [resendLeft, setResendLeft] = useState(60);

  // Reset timers whenever a fresh OTP send happens
  useEffect(() => {
    setExpiryLeft(initialExpiresSeconds);
    setResendLeft(60);
    setCode("");
  }, [initialExpiresSeconds, devOtp]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpiryLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isExpired = expiryLeft <= 0;
  const maskedPhone = maskBangladeshiPhone(phone);
  const banglaErr = getBanglaError(errorMessage);

  const handleResendClick = () => {
    setExpiryLeft(initialExpiresSeconds);
    setResendLeft(60);
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
            Verify Your Mobile Number
          </h2>
          <p className="text-sm font-medium text-blue-800">
            আপনার মোবাইল নম্বর যাচাই করুন
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
        <p className="text-sm text-slate-700">
          We sent a 6-digit verification code to:
        </p>
        <p className="mt-1 font-mono text-lg font-bold text-slate-900">
          {maskedPhone}
        </p>
        <p className="mt-1 text-xs font-medium text-blue-900">
          এই নম্বরে পাঠানো ৬ ডিজিটের কোডটি নিচে লিখে আবেদন জমা দিন।
        </p>
      </div>

      {devOtp && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
          <span className="font-semibold">Local Test Mode OTP: </span>
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
              Enter 6-Digit Code
            </Label>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isExpired
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {isExpired ? "Expired" : formatCountdown(expiryLeft)}
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
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(digitsOnly);
            }}
            placeholder="000000"
            className="h-14 text-center font-mono text-2xl font-bold tracking-[0.4em] text-slate-900 placeholder:tracking-[0.2em] placeholder:text-slate-300"
          />

          <p className="text-xs text-slate-500">
            Code is valid for 5 minutes. Maximum 5 wrong tries allowed.
          </p>
        </div>

        {isExpired && !errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p>Code expired — tap Resend for a new one.</p>
              <p className="text-xs font-normal text-red-800">
                কোডের মেয়াদ শেষ হয়েছে — নতুন কোড পেতে Resend চাপুন।
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p>{errorMessage}</p>
              {banglaErr && (
                <p className="text-xs font-normal text-red-800">{banglaErr}</p>
              )}
            </div>
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
              Verifying &amp; Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" aria-hidden="true" />
              Verify &amp; Submit Application
            </>
          )}
        </Button>

        <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={resendLeft > 0 || isResending || isVerifying}
            onClick={handleResendClick}
            className="h-11 border-slate-300 text-sm font-semibold"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                Sending new code...
              </>
            ) : resendLeft > 0 ? (
              <>
                <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Resend in {resendLeft}s
              </>
            ) : (
              <>
                <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Resend Code
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={isVerifying}
            onClick={onBackToReview}
            className="h-11 text-sm font-medium text-slate-600"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Back to Review
          </Button>
        </div>
      </form>
    </div>
  );
}

