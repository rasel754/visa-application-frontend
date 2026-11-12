"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OtpVerifiedBadge } from "@/components/admin/OtpBadges";
import { ProfessionBadge } from "@/components/admin/ProfessionBadge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SubmissionSummary } from "@/lib/types";

interface SubmissionsTableProps {
  items: SubmissionSummary[];
  emptyMessage?: string;
}

export function SubmissionsTable({
  items,
  emptyMessage = "No applications found.",
}: SubmissionsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Date</TableHead>
            <TableHead className="font-semibold text-slate-700">
              Submission No.
            </TableHead>
            <TableHead className="font-semibold text-slate-700">
              Applicant Name
            </TableHead>
            <TableHead className="font-semibold text-slate-700">Phone</TableHead>
            <TableHead className="font-semibold text-slate-700">OTP</TableHead>
            <TableHead className="font-semibold text-slate-700">Country</TableHead>
            <TableHead className="font-semibold text-slate-700">
              Profession
            </TableHead>
            <TableHead className="font-semibold text-slate-700">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-slate-50/70">
              <TableCell className="whitespace-nowrap text-sm text-slate-600">
                {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm")}
              </TableCell>
              <TableCell className="whitespace-nowrap font-mono text-sm font-semibold text-blue-800">
                {item.reference}
              </TableCell>
              <TableCell className="font-medium text-slate-900">
                {item.applicantName}
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-slate-700">
                {item.applicantPhone || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <OtpVerifiedBadge
                  verified={item.otpVerified}
                  phone={item.otpVerifiedPhone}
                />
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-slate-800">
                {item.countryName}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <ProfessionBadge profession={item.profession} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="outline" className="h-8">
                  <Link href={`/admin/submissions/${item.id}`}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
