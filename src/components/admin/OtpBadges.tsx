"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OtpStatus } from "@/lib/types";

const OTP_STATUS_STYLES: Record<OtpStatus, { label: string; className: string }> = {
  VERIFIED: {
    label: "Verified",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50",
  },
  USED: {
    label: "Used",
    className: "border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  },
  SENT: {
    label: "Sent",
    className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50",
  },
  EXPIRED: {
    label: "Expired",
    className: "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100",
  },
  FAILED: {
    label: "Failed",
    className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
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
    <Badge variant="outline" className={cfg.className}>
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
      <Badge
        variant="outline"
        title={phone ? `Verified: ${phone}` : "OTP Verified"}
        className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50"
      >
        <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
        OTP Verified
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      title="Mobile number was not OTP verified"
      className="border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100"
    >
      <ShieldAlert className="mr-1 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      Not verified
    </Badge>
  );
}

