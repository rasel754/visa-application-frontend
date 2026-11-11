import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SectionWizard } from "@/components/form/SectionWizard";

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[800px] items-center justify-between gap-3 px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-800 text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-base font-bold text-slate-900 sm:text-lg">
              IGL Visa Help
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[800px] px-4 py-6">
        <SectionWizard />
      </main>
    </div>
  );
}

