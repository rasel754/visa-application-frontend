"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { SubmitSuccessPayload } from "@/lib/types";
import {
  readLastSubmissionFallback,
  useIntakeStore,
} from "@/store/intake-store";

export default function ApplySuccessPage() {
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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[800px] items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-800 text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              IGL Visa Help
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[680px] flex-1 items-center px-4 py-10">
        {submission ? (
          <div className="w-full rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-12 w-12" aria-hidden="true" />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Your application has been sent!
            </h1>
            <p className="mt-2 text-base font-medium text-emerald-800">
              আপনার আবেদন সফলভাবে জমা হয়েছে!
            </p>

            <div className="mt-6 rounded-xl border-2 border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Your Submission Number
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-wide text-blue-800 sm:text-4xl">
                {submission.reference}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Save this number. Give it if you call or visit the IGL Visa Help office.
              </p>
            </div>

            <p className="mt-6 text-base font-medium text-slate-800">
              Our office will check your information and call you.
            </p>
            <p className="mt-1 text-sm font-medium text-blue-800">
              আমাদের অফিস আপনার তথ্য যাচাই করে আপনাকে কল করবে।
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Button
                asChild
                size="lg"
                className="h-14 w-full rounded-xl bg-blue-700 text-lg font-bold text-white shadow-md hover:bg-blue-800"
              >
                <a href={api.getPublicPdfUrl(submission.downloadToken)}>
                  <Download className="mr-2 h-6 w-6" aria-hidden="true" />
                  Download Your PDF
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-12 w-full border-slate-300 text-base font-semibold"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              No recent submission found
            </h1>
            <p className="mt-2 text-base text-slate-600">
              If you have not sent your form yet, you can start or continue your application below.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-12 bg-blue-700 px-6 text-base font-semibold">
                <Link href="/apply">Go to Application Form</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6 text-base font-semibold">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

