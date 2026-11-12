"use client";

import { Badge } from "@/components/ui/badge";
import { formatProfessionLabel } from "@/lib/field-helpers";
import { ProfessionEnum } from "@/lib/types";

const PROFESSION_BADGE_MAP: Record<
  ProfessionEnum,
  { label: string; className: string }
> = {
  STUDENT: {
    label: "Student",
    className: "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-50",
  },
  BUSINESSMAN: {
    label: "Businessman",
    className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50",
  },
  EMPLOYEE: {
    label: "Employee",
    className: "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-50",
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
      <Badge
        variant="outline"
        className="border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-50"
      >
        {formatProfessionLabel(profession)}
      </Badge>
    );
  }

  const meta = PROFESSION_BADGE_MAP[profession];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
}

