"use client";

import { CheckCircle2, Clock, FileSearch, Loader, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SubmissionStatus } from "@/lib/types";

interface StatusMeta {
  label: string;
  classes: string;
  icon: typeof Clock;
}

const STATUS_META: Record<SubmissionStatus, StatusMeta> = {
  NEW: {
    label: "New",
    classes: "border-sky-300 bg-sky-50 text-sky-800",
    icon: Clock,
  },
  CHECKED: {
    label: "Checked",
    classes: "border-amber-300 bg-amber-50 text-amber-900",
    icon: FileSearch,
  },
  PROCESSING: {
    label: "Processing",
    classes: "border-indigo-300 bg-indigo-50 text-indigo-800",
    icon: Loader,
  },
  COMPLETED: {
    label: "Completed",
    classes: "border-emerald-300 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    classes: "border-red-300 bg-red-50 text-red-800",
    icon: XCircle,
  },
};

export const ALL_SUBMISSION_STATUSES: SubmissionStatus[] = [
  "NEW",
  "CHECKED",
  "PROCESSING",
  "COMPLETED",
  "REJECTED",
];

export function getStatusLabel(status: SubmissionStatus): string {
  return STATUS_META[status]?.label ?? status;
}

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.NEW;
  const Icon = meta.icon;

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-semibold ${meta.classes}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
    </Badge>
  );
}
