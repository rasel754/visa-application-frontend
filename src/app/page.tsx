import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Download,
  FileCheck2,
  Globe,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    number: "1",
    title: "Choose Country",
    subtitle: "Pick the country you want to visit.",
    bangla: "আপনার পছন্দের দেশ বেছে নিন",
    icon: Globe,
  },
  {
    number: "2",
    title: "Choose Visa Type",
    subtitle: "Student, Business, or Employee.",
    bangla: "ভিসার ধরন বেছে নিন",
    icon: FileCheck2,
  },
  {
    number: "3",
    title: "Fill the Form & Upload Documents",
    subtitle: "Write your details and attach clear photos or PDFs.",
    bangla: "তথ্য লিখুন ও কাগজপত্র আপলোড করুন",
    icon: ClipboardList,
  },
  {
    number: "4",
    title: "Submit & Download PDF",
    subtitle: "Get your form number and PDF right away.",
    bangla: "জমা দিন ও সাথে সাথে PDF ডাউনলোড করুন",
    icon: Download,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight text-slate-900">
                IGL Visa Help
              </span>
              <span className="block text-xs text-slate-500">
                Visa Application Center
              </span>
            </div>
          </Link>

          <Link
            href="/admin/login"
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Admin Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Apply for your visa in a few easy steps
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              Fill out your visa form online on your phone or computer, upload your papers, and download your PDF copy right away.
            </p>
            <p className="mt-2 text-base font-medium text-blue-800">
              সহজ কয়েকটি ধাপে আপনার ভিসার ফর্ম পূরণ করুন এবং সাথে সাথে PDF ডাউনলোড করুন।
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-xl bg-blue-700 px-8 text-lg font-bold text-white shadow-md hover:bg-blue-800"
              >
                <Link href="/apply">
                  Start Application
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
                How it works
              </h2>
              <p className="mt-1 text-sm font-medium text-blue-800">
                কীভাবে আবেদন করবেন
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => {
                const Icon = step.icon;
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
                    <p className="mt-2 text-xs font-medium text-blue-800">
                      {step.bangla}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Office Note */}
            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-900">
                  <PhoneCall className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                  <span>What happens after you send?</span>
                </div>
                <p className="text-base text-slate-700">
                  Our office will check your information and contact you by phone.
                </p>
                <p className="text-sm font-medium text-emerald-900">
                  ফর্ম পাঠানোর পর আমাদের অফিস আপনার তথ্য যাচাই করে ফোনে যোগাযোগ করবে।
                </p>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  100 Countries Supported
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Saves Automatically on Your Device
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600">
        <p className="font-semibold text-slate-800">IGL Visa Help</p>
        <p className="mt-1 text-xs text-slate-500">
          Bangladesh Visa Application Assistance
        </p>
      </footer>
    </div>
  );
}
