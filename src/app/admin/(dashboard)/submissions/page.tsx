"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RotateCcw, Search, TableProperties } from "lucide-react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LiveServerTime } from "@/components/admin/LiveServerTime";
import { ALL_PROFESSIONS } from "@/components/admin/ProfessionBadge";
import {
  ALL_SUBMISSION_STATUSES,
  getStatusLabel,
} from "@/components/admin/StatusBadge";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { useCountries } from "@/hooks/useCountries";
import { useSubmissions } from "@/hooks/useSubmissions";
import { formatProfessionLabel } from "@/lib/field-helpers";

export default function AdminSubmissionsPage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [profession, setProfession] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

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

  const { data, isLoading } = useSubmissions({
    search: search.trim() || undefined,
    country: country || undefined,
    profession: profession || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit: 20,
  });

  const resetFilters = () => {
    setSearch("");
    setCountry("");
    setProfession("");
    setStatus("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = Boolean(
    search || country || profession || status || from || to,
  );

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const startRow = total === 0 ? 0 : (page - 1) * 20 + 1;
  const endRow = Math.min(page * 20, total);

  return (
    <div className="space-y-4">
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="flex flex-col gap-2 rounded bg-white px-3.5 py-2 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between border border-slate-200">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="text-emerald-700 font-bold">▼</span>
          <span>
            Figures below:{" "}
            <strong className="font-semibold text-slate-900">
              Your desk client submissions feed and processing records
            </strong>
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

      {/* 2. Page Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <TableProperties className="h-5 w-5 text-emerald-700" />
          <div>
            <h1 className="text-lg font-bold text-slate-900">All Client Submissions</h1>
            <p className="text-xs text-slate-500">
              Search, filter, review, and manage client visit visa applications.
            </p>
          </div>
        </div>
        {data && (
          <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            Total matching: <strong className="font-bold">{data.total}</strong>
          </span>
        )}
      </div>

      {/* 3. Filters Strip */}
      <div className="rounded border border-slate-200 bg-[#fafbfc] p-3.5 shadow-2xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="filter-search" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Search
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="filter-search"
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Name, phone, or IGL-2026-..."
                className="h-8 pl-8 text-xs bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Country
            </Label>
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
              className="h-8 text-xs bg-white"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Profession
            </Label>
            <Select
              value={profession || "ALL"}
              onValueChange={(val) => {
                setProfession(val === "ALL" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-full text-xs bg-white">
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
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Status
            </Label>
            <Select
              value={status || "ALL"}
              onValueChange={(val) => {
                setStatus(val === "ALL" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-full text-xs bg-white">
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

          <div>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <RotateCcw className="h-3 w-3 text-slate-500" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 border-t border-slate-200 pt-3">
          <div className="space-y-1">
            <Label htmlFor="filter-from" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              From Date
            </Label>
            <DatePicker
              id="filter-from"
              value={from}
              mode="past-or-today"
              allowClear
              placeholder="From date"
              onChange={(val) => {
                setFrom(val);
                setPage(1);
              }}
              className="h-8 text-xs bg-white"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-to" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              To Date
            </Label>
            <DatePicker
              id="filter-to"
              value={to}
              mode="past-or-today"
              allowClear
              placeholder="To date"
              onChange={(val) => {
                setTo(val);
                setPage(1);
              }}
              className="h-8 text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Submissions Table */}
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#00a65a]" />
          </div>
        ) : (
          <SubmissionsTable items={data?.items ?? []} showStatus />
        )}

        {/* Pagination Footer */}
        {data && (
          <div className="flex flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 bg-white text-xs text-slate-600">
            <div>
              Showing <strong className="text-slate-900">{startRow}</strong> to{" "}
              <strong className="text-slate-900">{endRow}</strong> of{" "}
              <strong className="text-slate-900">{total}</strong> applications
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

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
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
