"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Files,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/StatCard";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { useAdminStats, useSubmissions } from "@/hooks/useSubmissions";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recent, isLoading: listLoading } = useSubmissions({
    page: 1,
    limit: 10,
  });

  const inProgressCount =
    (stats?.byStatus.CHECKED ?? 0) + (stats?.byStatus.PROCESSING ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">
            Overview of visa applications received by IGL Visa Help.
          </p>
        </div>

        <Button asChild className="bg-blue-700 hover:bg-blue-800">
          <Link href="/admin/links">Create Client Link</Link>
        </Button>
      </div>

      {statsLoading ? (
        <div className="flex h-28 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={stats?.total ?? 0}
            subtitle={`${stats?.byStatus.NEW ?? 0} new awaiting check`}
            icon={Files}
            accentClass="bg-blue-50 text-blue-700"
          />
          <StatCard
            title="Received Today"
            value={stats?.today ?? 0}
            subtitle="Since midnight (BD time)"
            icon={CalendarDays}
            accentClass="bg-amber-50 text-amber-700"
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            subtitle="Checked or processing"
            icon={Clock}
            accentClass="bg-indigo-50 text-indigo-700"
          />
          <StatCard
            title="Completed"
            value={stats?.byStatus.COMPLETED ?? 0}
            subtitle={`${stats?.byStatus.REJECTED ?? 0} rejected`}
            icon={CheckCircle2}
            accentClass="bg-emerald-50 text-emerald-700"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            Latest 10 Submissions
          </h2>
          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {listLoading ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
          </div>
        ) : (
          <SubmissionsTable
            items={recent?.items ?? []}
            emptyMessage="No applications received yet."
          />
        )}
      </div>
    </div>
  );
}

