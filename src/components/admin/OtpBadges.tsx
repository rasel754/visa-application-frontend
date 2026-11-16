"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OtpStatus } from "@/lib/types";

const OTP_STATUS_STYLES: Record<OtpStatus, { label: string; className: string }> = {
  VERIFIED: {
    label: "Verified",
    className: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-50 font-semibold",
  },
  USED: {
    label: "Used",
    className: "border-emerald-400 bg-emerald-100 text-emerald-900 hover:bg-emerald-100 font-semibold",
  },
  SENT: {
    label: "Sent",
    className: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-50",
  },
  EXPIRED: {
    label: "Expired",
    className: "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-100",
  },
  FAILED: {
    label: "Failed",
    className: "border-red-300 bg-red-50 text-red-700 hover:bg-red-50",
  },
};

export const ALL_OTP_STATUSES: OtpStatus[] = [
  "SENT",
  "VERIFIED",
  "USED",
  "EXPIRED",
  "FAILED",
];

export function OtpStatusBadge({ status }: { status: OtpStatus }) {
  const cfg = OTP_STATUS_STYLES[status];
  return (
    <Badge variant="outline" className={`rounded-sm px-2 py-0.5 text-xs ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

export function OtpVerifiedBadge({
  verified,
  phone,
}: {
  verified: boolean;
  phone?: string | null;
}) {
  if (verified) {
    return (
      <div
        title={phone ? `Verified: ${phone}` : "OTP Verified"}
        className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-300 bg-emerald-50/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 shadow-2xs"
      >
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
        </div>
        <div className="leading-tight text-left">
          <span>OTP</span>
          <br className="leading-none" />
          <span>Verified</span>
        </div>
      </div>
    );
  }

  return (
    <div
      title="Mobile number was not OTP verified"
      className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-slate-100/90 px-2 py-0.5 text-[11px] font-medium text-slate-600"
    >
      <ShieldAlert className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      <div className="leading-tight text-left">
        <span>Not</span>
        <br className="leading-none" />
        <span>verified</span>
      </div>
    </div>
  );
}
