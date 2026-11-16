"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Banknote,
  BarChart3,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  SquarePen,
  TableProperties,
} from "lucide-react";
import { toast } from "sonner";
import { ProfessionBadge } from "@/components/admin/ProfessionBadge";
import { StatCard } from "@/components/admin/StatCard";
import {
  ALL_SUBMISSION_STATUSES,
  StatusBadge,
  getStatusLabel,
} from "@/components/admin/StatusBadge";
import { LiveServerTime } from "@/components/admin/LiveServerTime";
import { OtpVerifiedBadge } from "@/components/admin/OtpBadges";
import { ApplicationDetailDrawer } from "@/components/shared/ApplicationDetailDrawer";
import { useCountries } from "@/hooks/useCountries";
import { api } from "@/lib/api";
import {
  CompanyWithCounts,
  SubmissionSummary,
  SuperAdminStats,
} from "@/lib/types";

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);
  const { data: countries = [] } = useCountries();

  // Submissions list state
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Application detail drawer
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDetail = useCallback((id: string) => {
    setSelectedSubId(id);
    setDrawerOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDrawerOpen(false);
    setSelectedSubId(null);
  }, []);

  // Overview month & year
  const [overviewMonth, setOverviewMonth] = useState("November");
  const [overviewYear, setOverviewYear] = useState("2026");

  // Fetch initial stats & companies
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.fetchSuperAdminStats(),
      api.fetchCompanies(),
    ]).then(([statsRes, compRes]) => {
      if (!active) return;
      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (compRes.status === "fulfilled") setCompanies(compRes.value.items);
      setLoadingStats(false);
    });

    return () => {
      active = false;
    };
  }, []);

  // Load submissions table data
  const loadSubmissions = async (
    targetPage = page,
    targetLimit = limit,
    targetSearch = search,
    targetCompany = companyId,
    targetCountry = country,
    targetStatus = status,
  ) => {
    try {
      setLoadingList(true);
      const res = await api.fetchAdminSubmissions({
        companyId: targetCompany || undefined,
        search: targetSearch.trim() || undefined,
        country: targetCountry || undefined,
        status: targetStatus || undefined,
        page: targetPage,
        limit: targetLimit,
      });
      setSubmissions(res.items);
      setTotalSubmissions(res.total);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error("Failed to load platform submissions.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadSubmissions(page, limit, search, companyId, country, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, companyId, country, status]);

  const hasActiveFilters = Boolean(search || companyId || country || status);

  const resetFilters = () => {
    setSearch("");
    setCompanyId("");
    setCountry("");
    setStatus("");
    setPage(1);
    loadSubmissions(1, limit, "", "", "", "");
  };

  const formattedToday = format(new Date(), "dd MMM yyyy");

  const startRow = totalSubmissions === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, totalSubmissions);

  return (
    <div className="space-y-4">
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="flex flex-col gap-2 rounded bg-white px-3.5 py-2 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between border border-slate-200">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="text-emerald-700 font-bold">▼</span>
          <span>
            Figures below:{" "}
            <strong className="font-semibold text-slate-900">
              Multi-agency platform metrics
            </strong>{" "}
            (aggregated across all tenant branches)
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
      {loadingStats ? (
        <div className="flex h-28 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[#00a65a]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="TOTAL AGENCIES"
            value={stats?.companies.total ?? 0}
            subtitle={`${stats?.companies.active ?? 0} active • ${stats?.companies.suspended ?? 0} suspended`}
            icon={Building2}
            variant="green"
            href="/super-admin/companies"
            moreInfoText="More Info"
          />
          <StatCard
            title="GLOBAL APPLICATIONS"
            value={stats?.submissions.total ?? 0}
            subtitle="Across all registered agencies"
            icon={FileText}
            variant="blue"
            href="/super-admin/submissions"
            moreInfoText="More Info"
          />
          <StatCard
            title="RECEIVED TODAY"
            value={stats?.submissions.today ?? 0}
            subtitle="Since midnight (BD time)"
            icon={RotateCcw}
            variant="red"
            href="/super-admin/submissions"
            moreInfoText="More Info"
          />
          <StatCard
            title="COMPLETED / FEES TARGET"
            value="TK 00"
            subtitle={`${stats?.submissions.byStatus?.COMPLETED ?? 0} completed • ${stats?.submissions.byStatus?.REJECTED ?? 0} rejected`}
            icon={Banknote}
            variant="dark"
            href="/super-admin/submissions"
            moreInfoText="More Info"
          />
        </div>
      )}

      {/* 3. APPLICATIONS DATA TABLE SECTION */}
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
        {/* Table Top Toolbar */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <TableProperties className="h-4 w-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Applications Data Table
            </h2>
            <span className="text-xs text-slate-500">
              Real-time platform submissions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/super-admin/companies"
              className="inline-flex items-center gap-1.5 rounded bg-[#00a65a] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#008d4c]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Provision Agency</span>
            </Link>

            <Link
              href="/super-admin/submissions"
              className="inline-flex items-center gap-1.5 rounded bg-[#222d32] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#1a2226]"
            >
              <span>All Submissions</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="bg-[#fafbfc] px-4 py-3 border-b border-slate-200">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5 items-end">
            {/* Search */}
            <div className="space-y-1">
              <label
                htmlFor="tbl-super-search"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block"
              >
                SEARCH
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="tbl-super-search"
                  type="search"
                  placeholder="Name, phone, or ref..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setPage(1);
                      loadSubmissions(1, limit, search, companyId, country, status);
                    }
                  }}
                  className="h-8 w-full rounded border border-slate-300 bg-white pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Agency Dropdown */}
            <div className="space-y-1">
              <label
                htmlFor="tbl-super-agency"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block"
              >
                AGENCY
              </label>
              <select
                id="tbl-super-agency"
                value={companyId}
                onChange={(e) => {
                  setCompanyId(e.target.value);
                  setPage(1);
                }}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All agencies</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Dropdown */}
            <div className="space-y-1">
              <label
                htmlFor="tbl-super-country"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block"
              >
                COUNTRY
              </label>
              <select
                id="tbl-super-country"
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

            {/* Status Dropdown */}
            <div className="space-y-1">
              <label
                htmlFor="tbl-super-status"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block"
              >
                STATUS
              </label>
              <select
                id="tbl-super-status"
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

            {/* Action Button */}
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
                    setPage(1);
                    loadSubmissions(1, limit, search, companyId, country, status);
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

        {/* Table View */}
        {loadingList ? (
          <div className="flex h-56 items-center justify-center bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#00a65a]" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded border-t border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
            {hasActiveFilters
              ? "No platform applications matched your filters."
              : "No applications registered yet across agencies."}
          </div>
        ) : (
          <div className="w-full overflow-x-auto border-t border-slate-200">
            <table className="w-full border-collapse text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  <th scope="col" className="whitespace-nowrap px-3.5 py-3">
                    Date
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3.5 py-3">
                    Submission No.
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3.5 py-3">
                    Applicant Name
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3.5 py-3">
                    Agency
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
                  <th scope="col" className="whitespace-nowrap px-3.5 py-3">
                    Status
                  </th>
                  <th scope="col" className="whitespace-nowrap px-3.5 py-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {submissions.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-3.5 py-3 font-mono text-slate-600">
                      {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm")}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(item.id)}
                        className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {item.reference}
                      </button>
                    </td>
                    <td className="px-3.5 py-3 font-bold text-slate-900">
                      {item.applicantName}
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3">
                      <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        {item.company?.name || "Global Desk"}
                      </span>
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
                    <td className="whitespace-nowrap px-3.5 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="whitespace-nowrap px-3.5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item.id)}
                          title="View submission details"
                          className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item.id)}
                          title="Edit submission status"
                          className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                        >
                          <SquarePen className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 bg-white text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900">{startRow}</strong> to{" "}
              <strong className="text-slate-900">{endRow}</strong> of{" "}
              <strong className="text-slate-900">{totalSubmissions}</strong> applications
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
              disabled={page <= 1 || loadingList}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            {/* Page pills */}
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
              disabled={page >= totalPages || loadingList}
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

            {/* Chart placeholder */}
            <div className="p-6">
              <div className="flex h-44 flex-col items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <BarChart3 className="h-10 w-10 text-slate-300 stroke-[1.2]" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  No figures for {overviewMonth} {overviewYear} registered under this platform hub.
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
              Shift Desk: <span className="font-normal text-slate-500">Master HQ Counter 01</span>
            </span>

            <button
              type="button"
              onClick={() => toast.info(`Shift schedule: Global Master Desk active for ${formattedToday}`)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00a65a] text-white shadow-2xs transition-colors hover:bg-[#008d4c]"
              title="Shift Calendar"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Application Detail Drawer / Modal */}
      <ApplicationDetailDrawer
        submissionId={selectedSubId}
        open={drawerOpen}
        onClose={handleCloseDetail}
        onStatusUpdated={() => {
          loadSubmissions(page, limit, search, companyId, country, status);
        }}
      />
    </div>
  );
}
