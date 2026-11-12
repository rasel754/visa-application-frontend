"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Home } from "lucide-react";
import { PublicHeader } from "@/components/form/PublicHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getUiStrings } from "@/lib/i18n/translations";
import { SubmitSuccessPayload } from "@/lib/types";
import {
  readLastSubmissionFallback,
  useIntakeStore,
} from "@/store/intake-store";
import { useLanguageStore } from "@/store/language-store";

export default function ApplySuccessPage() {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);
  const storeSubmission = useIntakeStore((s) => s.lastSubmission);
  const [submission, setSubmission] = useState<SubmitSuccessPayload | null>(
    storeSubmission,
  );

  useEffect(() => {
    if (!submission) {
      const fallback = readLastSubmissionFallback();
      if (fallback) {
        setSubmission(fallback);
      }
    }
  }, [submission]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader mode="success" />

      <main className="mx-auto flex w-full max-w-[680px] flex-1 items-center px-4 py-10">
        {submission ? (
          <div className="w-full rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-12 w-12" aria-hidden="true" />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {t.success.title}
            </h1>

            <div className="mt-6 rounded-xl border-2 border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t.success.submissionNumberLabel}
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-wide text-blue-800 sm:text-4xl">
                {submission.reference}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {t.success.saveNumberHint}
              </p>
            </div>

            <p className="mt-6 text-base font-medium text-slate-800">
              {t.success.officeFollowup}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Button
                asChild
                size="lg"
                className="h-14 w-full rounded-xl bg-blue-700 text-lg font-bold text-white shadow-md hover:bg-blue-800"
              >
                <a href={api.getPublicPdfUrl(submission.downloadToken)}>
                  <Download className="mr-2 h-6 w-6" aria-hidden="true" />
                  {t.success.downloadPdf}
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12 w-full border-slate-300 text-base font-semibold"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t.success.backToHome}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              {t.success.emptyTitle}
            </h1>
            <p className="mt-2 text-base text-slate-600">
              {t.success.emptyBody}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-12 bg-blue-700 px-6 text-base font-semibold">
                <Link href="/apply">{t.success.goToForm}</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6 text-base font-semibold">
                <Link href="/">{t.success.backToHome}</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
