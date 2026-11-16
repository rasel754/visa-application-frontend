"use client";

import { formatProfessionLabel } from "@/lib/field-helpers";
import { ProfessionEnum } from "@/lib/types";

const PROFESSION_BADGE_MAP: Record<
  ProfessionEnum,
  { label: string; className: string }
> = {
  STUDENT: {
    label: "Student",
    className: "border-[#bae6fd] bg-[#e0f2fe] text-[#0284c7]",
  },
  BUSINESSMAN: {
    label: "Businessman",
    className: "border-[#fde68a] bg-[#fef9c3] text-[#b45309]",
  },
  EMPLOYEE: {
    label: "Employee",
    className: "border-[#99f6e4] bg-[#ccfbf1] text-[#0f766e]",
  },
};

export const ALL_PROFESSIONS: ProfessionEnum[] = [
  "STUDENT",
  "BUSINESSMAN",
  "EMPLOYEE",
];

export function ProfessionBadge({
  profession,
}: {
  profession: ProfessionEnum | null | undefined;
}) {
  if (!profession) {
    return (
      <span className="inline-block rounded border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        {formatProfessionLabel(profession)}
      </span>
    );
  }

  const meta = PROFESSION_BADGE_MAP[profession];
  return (
    <span
      className={`inline-block rounded border px-2.5 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
