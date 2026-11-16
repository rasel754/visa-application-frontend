"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpDown, Eye, SquarePen } from "lucide-react";
import { OtpVerifiedBadge } from "@/components/admin/OtpBadges";
import { ProfessionBadge } from "@/components/admin/ProfessionBadge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SubmissionSummary } from "@/lib/types";

interface SubmissionsTableProps {
  items: SubmissionSummary[];
  emptyMessage?: string;
  showStatus?: boolean;
}

export function SubmissionsTable({
  items,
  emptyMessage = "No applications found.",
  showStatus = false,
}: SubmissionsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border-t border-slate-200">
      <table className="w-full border-collapse text-left text-xs text-slate-700">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-700">
            <th scope="col" className="whitespace-nowrap px-3.5 py-3">
              <span className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-slate-900">
                Date
                <ArrowUpDown className="h-3 w-3 text-slate-400" />
              </span>
            </th>
            <th scope="col" className="whitespace-nowrap px-3.5 py-3">
              Submission No.
            </th>
            <th scope="col" className="whitespace-nowrap px-3.5 py-3">
              Applicant Name
            </th>
            <th scope="col" className="whitespace-nowrap px-3.5 py-3">
              Phone
            </th>
            <th scope="col" className="whitespace-nowrap px-3.5 py-3 text-center">
              OTP
            </th>
            <th scope="col" className="whitespace-nowrap px-3.5 py-3">
              Country
            </th>
            <th scope="col" className="whitespace-nowrap px-3.5 py-3">
              Profession
            </th>
            {showStatus && (
              <th scope="col" className="whitespace-nowrap px-3.5 py-3">
                Status
              </th>
            )}
            <th scope="col" className="whitespace-nowrap px-3.5 py-3 text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {items.map((item) => (
            <tr
              key={item.id}
              className="transition-colors hover:bg-slate-50/80"
            >
              <td className="whitespace-nowrap px-3.5 py-3 font-mono text-slate-600">
                {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm")}
              </td>
              <td className="whitespace-nowrap px-3.5 py-3">
                <Link
                  href={`/admin/submissions/${item.id}`}
                  className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {item.reference}
                </Link>
              </td>
              <td className="px-3.5 py-3 font-bold text-slate-900">
                {item.applicantName}
              </td>
              <td className="whitespace-nowrap px-3.5 py-3 font-mono text-slate-600">
                {item.applicantPhone || "—"}
              </td>
              <td className="whitespace-nowrap px-3.5 py-3 text-center">
                <OtpVerifiedBadge
                  verified={item.otpVerified}
                  phone={item.otpVerifiedPhone}
                />
              </td>
              <td className="whitespace-nowrap px-3.5 py-3 font-medium text-slate-700">
                {item.countryName}
              </td>
              <td className="whitespace-nowrap px-3.5 py-3">
                <ProfessionBadge profession={item.profession} />
              </td>
              {showStatus && (
                <td className="whitespace-nowrap px-3.5 py-3">
                  <StatusBadge status={item.status} />
                </td>
              )}
              <td className="whitespace-nowrap px-3.5 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Link
                    href={`/admin/submissions/${item.id}`}
                    title="View submission details"
                    className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">View</span>
                  </Link>
                  <Link
                    href={`/admin/submissions/${item.id}`}
                    title="Edit submission"
                    className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                  >
                    <SquarePen className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
