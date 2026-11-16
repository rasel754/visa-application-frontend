"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Banknote,
  BarChart3,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  TableProperties,
} from "lucide-react";
import { toast } from "sonner";
import { LiveServerTime } from "@/components/admin/LiveServerTime";
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

  // Month & Year state for Overview chart
  const [overviewMonth, setOverviewMonth] = useState("November");
  const [overviewYear, setOverviewYear] = useState("2026");

  const formattedToday = format(new Date(), "dd MMM yyyy");

  return (
    <div className="space-y-4">
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="flex flex-col gap-2 rounded bg-white px-3.5 py-2 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between border border-slate-200">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="text-emerald-700 font-bold">▼</span>
          <span>
            Figures below:{" "}
            <strong className="font-semibold text-slate-900">
              Your own submissions
            </strong>{" "}
            (data assigned to your office desk)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live DB Sync
          </span>
          <span className="text-slate-300">|</span>
          <LiveServerTime />
        </div>
      </div>

      {/* 2. OVERVIEW 4 STAT CARDS */}
      {statsLoading ? (
        <div className="flex h-28 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[#00a65a]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="TOTAL APPLICATIONS"
            value={stats?.total ?? 0}
            subtitle={`${stats?.byStatus.NEW ?? 0} new awaiting check`}
            icon={FileText}
            variant="green"
            href="/admin/submissions"
            moreInfoText="More Info"
          />
          <StatCard
            title="RECEIVED TODAY"
            value={stats?.today ?? 0}
            subtitle="Since midnight (BD time)"
            icon={CalendarDays}
            variant="blue"
            href="/admin/submissions"
            moreInfoText="More Info"
          />
          <StatCard
            title="IN PROGRESS"
            value={inProgressCount}
            subtitle="Checked or processing"
            icon={RotateCcw}
            variant="red"
            href="/admin/submissions"
            moreInfoText="More Info"
          />
          <StatCard
            title="COMPLETED / FEES TARGET"
            value="TK 00"
            subtitle={`${stats?.byStatus.REJECTED ?? 0} rejected • 0 collected`}
            icon={Banknote}
            variant="dark"
            href="/admin/submissions"
            moreInfoText="More Info"
          />
        </div>
      )}

      {/* 3. APPLICATIONS DATA TABLE SECTION */}
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
        {/* Table Card Top Bar */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <TableProperties className="h-4 w-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Applications Data Table
            </h2>
            <span className="text-xs text-slate-500">
              Real-time applicant submissions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/links"
              className="inline-flex items-center gap-1.5 rounded bg-[#00a65a] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#008d4c]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Create Client Link</span>
            </Link>

            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-1.5 rounded bg-[#222d32] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#1a2226]"
            >
              <span>All Submissions</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#fafbfc] px-4 py-3 border-b border-slate-200">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5 items-end">
            {/* Search Input */}
            <div className="space-y-1">
              <label
                htmlFor="tbl-search"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block"
              >
                SEARCH
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="tbl-search"
                  type="search"
                  placeholder="Name, phone, or ref..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 w-full rounded border border-slate-300 bg-white pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Country Dropdown */}
            <div className="space-y-1">
              <label
                htmlFor="tbl-country"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block"
              >
                COUNTRY
              </label>
              <select
                id="tbl-country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPage(1);
                }}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All countries</option>
                {countries.map((c) => (
                  <option key={c.country_code} value={c.country_code}>
                    {c.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Profession Dropdown */}
            <div className="space-y-1">
              <label
                htmlFor="tbl-profession"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block"
              >
                PROFESSION
              </label>
              <select
                id="tbl-profession"
                value={profession}
                onChange={(e) => {
                  setProfession(e.target.value);
                  setPage(1);
                }}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All professions</option>
                {ALL_PROFESSIONS.map((prof) => (
                  <option key={prof} value={prof}>
                    {formatProfessionLabel(prof)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-1">
              <label
                htmlFor="tbl-status"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block"
              >
                STATUS
              </label>
              <select
                id="tbl-status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All statuses</option>
                {ALL_SUBMISSION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {getStatusLabel(st)}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply / Reset Filter Button */}
            <div>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                >
                  <RotateCcw className="h-3 w-3 text-slate-500" />
                  <span>Reset Filters</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Filters applied");
                  }}
                  className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded bg-[#00a65a] px-3 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#008d4c]"
                >
                  <Filter className="h-3 w-3 fill-current" />
                  <span>Apply Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {listLoading ? (
          <div className="flex h-56 items-center justify-center bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#00a65a]" />
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

        {/* Table Pagination Footer */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 bg-white text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900">{startRow}</strong> to{" "}
              <strong className="text-slate-900">{endRow}</strong> of{" "}
              <strong className="text-slate-900">{total}</strong> applications
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-slate-500">Rows per page:</span>
              <select
                aria-label="Rows per page"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page <= 1 || listLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            {/* Numeric page pills */}
            {totalPages <= 6 && (
              <div className="hidden items-center gap-1 sm:flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-7 w-7 rounded text-xs font-bold transition-colors ${
                      page === p
                        ? "bg-[#0284c7] text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              disabled={page >= totalPages || listLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM 2-COLUMN SECTION: ACTIVITY OVERVIEW & TODAYS OVERVIEW */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Activity & Performance Overview (8 cols) */}
        <div className="rounded border border-slate-200 bg-white shadow-2xs lg:col-span-8 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-xs bg-[#00a65a]" />
                <h3 className="text-xs font-bold text-slate-900 sm:text-sm">
                  Activity & Performance Overview, 2026 (TK)
                </h3>
              </div>

              {/* Month / Year / Filter */}
              <div className="flex items-center gap-1.5">
                <select
                  value={overviewMonth}
                  onChange={(e) => setOverviewMonth(e.target.value)}
                  className="h-7 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none"
                >
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>

                <select
                  value={overviewYear}
                  onChange={(e) => setOverviewYear(e.target.value)}
                  className="h-7 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>

                <button
                  type="button"
                  onClick={() => toast.info(`Filtered for ${overviewMonth} ${overviewYear}`)}
                  className="h-7 rounded bg-[#00a65a] px-3 text-xs font-bold text-white shadow-2xs hover:bg-[#008d4c]"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Chart placeholder box */}
            <div className="p-6">
              <div className="flex h-44 flex-col items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <BarChart3 className="h-10 w-10 text-slate-300 stroke-[1.2]" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  No figures for {overviewMonth} {overviewYear} registered under this agent desk.
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Threshold: TK 1,000 baseline • Sales target tracking initialized
                </p>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 bg-[#fafbfc]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#00a65a]" />
                Visa Invoicing: <strong className="text-slate-800">TK 0.00</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0284c7]" />
                Service Fees: <strong className="text-slate-800">TK 0.00</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#06b6d4]" />
                Collected: <strong className="text-slate-800">TK 0.00</strong>
              </span>
            </div>

            <div className="font-mono text-slate-500">
              Invoices Count: <strong className="text-slate-700">0</strong>
            </div>
          </div>
        </div>

        {/* Right: Todays Overview (4 cols) */}
        <div className="rounded border border-slate-200 bg-white shadow-2xs border-l-4 border-l-[#dc2626] lg:col-span-4 flex flex-col justify-between">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Todays Overview
              </h3>
              <span className="font-mono text-xs text-slate-500">
                {formattedToday}
              </span>
            </div>

            {/* Subheader */}
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Todays Report</span>
              <span>TK</span>
            </div>

            {/* Metric Rows */}
            <div className="mt-3 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-[#00a65a] rounded-2xs" />
                  Total Sales
                </span>
                <span className="font-mono font-bold text-slate-900">TK 0.00</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-[#06b6d4] rounded-2xs" />
                  Collected
                </span>
                <span className="font-mono font-bold text-slate-900">TK 0.00</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Invoices</span>
                <span className="font-mono font-bold text-slate-900">0</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span>Last Sale</span>
                <span className="italic text-slate-400">No sales yet</span>
              </div>
            </div>
          </div>

          {/* Bottom Card Action */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-[#fafbfc] px-4 py-2.5">
            <span className="text-xs font-semibold text-slate-700">
              Shift Desk: <span className="font-normal text-slate-500">Counter 02</span>
            </span>

            <button
              type="button"
              onClick={() => toast.info(`Shift schedule: Dhanmondi Counter 02 active for ${formattedToday}`)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00a65a] text-white shadow-2xs transition-colors hover:bg-[#008d4c]"
              title="Shift Calendar"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
