"use client";

import Link from "next/link";
import { ArrowRightCircle, ChevronRight, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "green" | "blue" | "red" | "dark" | "default";
  href?: string;
  moreInfoText?: string;
  accentClass?: string;
}

const VARIANT_STYLES: Record<
  "green" | "blue" | "red" | "dark",
  {
    bg: string;
    footerBg: string;
    iconColor: string;
  }
> = {
  green: {
    bg: "bg-[#00a65a]", // Emerald AdminLTE Green
    footerBg: "bg-black/15 hover:bg-black/25 text-white/95",
    iconColor: "text-white/20",
  },
  blue: {
    bg: "bg-[#00c0ef]", // Aqua Cyan Blue
    footerBg: "bg-black/15 hover:bg-black/25 text-white/95",
    iconColor: "text-white/20",
  },
  red: {
    bg: "bg-[#dd4b39]", // Crimson Coral Red
    footerBg: "bg-black/15 hover:bg-black/25 text-white/95",
    iconColor: "text-white/20",
  },
  dark: {
    bg: "bg-[#222d32]", // Graphite Charcoal
    footerBg: "bg-black/20 hover:bg-black/35 text-white/95",
    iconColor: "text-white/20",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  href,
  moreInfoText = "More Info",
  accentClass = "bg-blue-50 text-blue-700",
}: StatCardProps) {
  // If variant is one of the colorful admin styles
  if (variant !== "default" && VARIANT_STYLES[variant]) {
    const style = VARIANT_STYLES[variant];

    const cardContent = (
      <div
        className={`relative overflow-hidden rounded-md shadow-xs transition-transform hover:-translate-y-0.5 ${style.bg} text-white`}
      >
        {/* Main Body */}
        <div className="relative z-10 p-4 pb-3">
          <div className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {value}
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/90">
            {title}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-white/80">{subtitle}</p>
          )}
        </div>

        {/* Large watermark background icon */}
        <div
          className={`pointer-events-none absolute right-2 top-2 z-0 transition-opacity ${style.iconColor}`}
        >
          <Icon className="h-20 w-20 stroke-[1.2]" aria-hidden="true" />
        </div>

        {/* Footer 'More Info' Bar */}
        {href ? (
          <Link
            href={href}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors ${style.footerBg}`}
          >
            <span>{moreInfoText}</span>
            <ArrowRightCircle className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <div
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium ${style.footerBg}`}
          >
            <span>{moreInfoText}</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
        )}
      </div>
    );

    return cardContent;
  }

  // Fallback default card style
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${accentClass}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
