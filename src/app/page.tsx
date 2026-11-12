"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Download,
  FileCheck2,
  Globe,
  PhoneCall,
} from "lucide-react";
import { PublicHeader } from "@/components/form/PublicHeader";
import { Button } from "@/components/ui/button";
import { getUiStrings } from "@/lib/i18n/translations";
import { useLanguageStore } from "@/store/language-store";

const STEP_ICONS = [Globe, FileCheck2, ClipboardList, Download] as const;

export default function HomePage() {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader mode="home" />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {t.home.heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              {t.home.heroSubtitle}
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-xl bg-blue-700 px-8 text-lg font-bold text-white shadow-md hover:bg-blue-800"
              >
                <Link href="/apply">
                  {t.home.startApplication}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12">
          <div className="mx-auto max-w-5xl px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {t.home.howItWorksTitle}
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {t.home.steps.map((step, idx) => {
                const Icon = STEP_ICONS[idx] ?? Globe;
                return (
                  <div
                    key={step.number}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                        {step.number}
                      </span>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{step.subtitle}</p>
                  </div>
                );
              })}
            </div>

            {/* Office Note */}
            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-900">
                  <PhoneCall className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                  <span>{t.home.afterSendTitle}</span>
                </div>
                <p className="text-base text-slate-700">{t.home.afterSendBody}</p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  {t.home.countriesSupported}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  {t.home.autoSaves}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600">
        <p className="font-semibold text-slate-800">{t.brandName}</p>
        <p className="mt-1 text-xs text-slate-500">{t.home.footerSubtitle}</p>
      </footer>
    </div>
  );
}
