"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Files,
  Loader2,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_PROFESSIONS } from "@/components/admin/ProfessionBadge";
import { StatCard } from "@/components/admin/StatCard";
import {
  ALL_SUBMISSION_STATUSES,
  getStatusLabel,
} from "@/components/admin/StatusBadge";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { useCountries } from "@/hooks/useCountries";
import { useAdminStats, useSubmissions } from "@/hooks/useSubmissions";
import { formatProfessionLabel } from "@/lib/field-helpers";

export default function AdminDashboardPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [profession, setProfession] = useState("");
  const [status, setStatus] = useState("");

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: countries = [] } = useCountries();

  const countryOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "", label: "All countries" },
      ...countries.map((c) => ({
        value: c.country_code,
        label: c.country,
        hint: c.region,
        keywords: [c.country_code, c.region],
      })),
    ],
    [countries],
  );

  const { data: submissionsData, isLoading: listLoading } = useSubmissions({
    page,
    limit,
    search: search.trim() || undefined,
    country: country || undefined,
    profession: profession || undefined,
    status: status || undefined,
  });

  const inProgressCount =
    (stats?.byStatus.CHECKED ?? 0) + (stats?.byStatus.PROCESSING ?? 0);

  const hasActiveFilters = Boolean(search || country || profession || status);

  const resetFilters = () => {
    setSearch("");
    setCountry("");
    setProfession("");
    setStatus("");
    setPage(1);
  };

  const total = submissionsData?.total ?? 0;
  const totalPages = submissionsData?.totalPages ?? 1;
  const startRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">
            Overview and real-time visa applications received by IGL Visa Help.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" className="h-10">
            <Link href="/admin/submissions">
              All Submissions
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild className="h-10 bg-blue-700 hover:bg-blue-800">
            <Link href="/admin/links">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Client Link
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {statsLoading ? (
        <div className="flex h-28 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-xs">
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

      {/* Data Table Section with Filters & Pagination */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Applications Data Table
            </h2>
            <p className="text-xs text-slate-500">
              Filter, search and manage applicant submissions in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 text-slate-600 hover:text-slate-900"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="dashboard-search" className="text-xs font-semibold text-slate-600">
              Search
            </Label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="dashboard-search"
                type="search"
                placeholder="Name, phone, or reference..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Country</Label>
            <Combobox
              options={countryOptions}
              value={country}
              placeholder="All countries"
              searchPlaceholder="Search country..."
              emptyText="No country found."
              onValueChange={(val) => {
                setCountry(val);
                setPage(1);
              }}
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Profession</Label>
            <Select
              value={profession || "ALL"}
              onValueChange={(val) => {
                setProfession(val === "ALL" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="All professions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All professions</SelectItem>
                {ALL_PROFESSIONS.map((prof) => (
                  <SelectItem key={prof} value={prof}>
                    {formatProfessionLabel(prof)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Status</Label>
            <Select
              value={status || "ALL"}
              onValueChange={(val) => {
                setStatus(val === "ALL" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {ALL_SUBMISSION_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {getStatusLabel(st)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Content */}
        {listLoading ? (
          <div className="flex h-56 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-blue-700" />
          </div>
        ) : (
          <SubmissionsTable
            items={submissionsData?.items ?? []}
            emptyMessage={
              hasActiveFilters
                ? "No submissions matched your filters."
                : "No applications received yet."
            }
          />
        )}

        {/* Data Table Pagination Controls */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>
              Showing <strong className="text-slate-900">{startRow}</strong> to{" "}
              <strong className="text-slate-900">{endRow}</strong> of{" "}
              <strong className="text-slate-900">{total}</strong> applications
            </span>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-slate-500">Rows per page:</span>
              <select
                aria-label="Rows per page"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || listLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Previous
            </Button>

            {/* Numeric page pills if total pages <= 6 */}
            {totalPages <= 6 && (
              <div className="hidden items-center gap-1 sm:flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded text-xs font-bold transition-colors ${
                      page === p
                        ? "bg-blue-700 text-white"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || listLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              Next
              <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
