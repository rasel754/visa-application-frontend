"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LanguageToggle } from "@/components/form/LanguageToggle";
import { getUiStrings } from "@/lib/i18n/translations";
import { useLanguageStore } from "@/store/language-store";

interface PublicHeaderProps {
  mode: "home" | "apply" | "token" | "success";
}

export function PublicHeader({ mode }: PublicHeaderProps) {
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);
  const maxWidthClass = mode === "home" ? "max-w-5xl" : "max-w-[800px]";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div
        className={`mx-auto flex ${maxWidthClass} flex-wrap items-center justify-between gap-3 px-4 py-3.5`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="IGL Group Logo"
            width={36}
            height={48}
            className="h-10 w-auto object-contain sm:h-11"
            priority
          />
          <div>
            <span className="block text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              {t.brandName}
            </span>
            {mode === "home" && (
              <span className="block text-xs text-slate-500">
                {t.brandSubtitle}
              </span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          {mode === "home" && (
            <Link
              href="/admin/login"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:px-3.5 sm:text-sm"
            >
              {t.navAdminLogin}
            </Link>
          )}

          {mode === "apply" && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>{t.navHome}</span>
            </Link>
          )}

          {mode === "token" && (
            <span className="hidden text-xs font-medium text-slate-500 sm:inline">
              {t.navPersonalFormLink}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

