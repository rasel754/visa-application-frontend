"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALL_SUBMISSION_STATUSES,
  getStatusLabel,
} from "@/components/admin/StatusBadge";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { useCountries } from "@/hooks/useCountries";
import { useSubmissions } from "@/hooks/useSubmissions";

export default function AdminSubmissionsPage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const { data: countries = [] } = useCountries();

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const c of countries) {
      for (const cat of c.categories) {
        set.add(cat);
      }
    }
    return Array.from(set);
  }, [countries]);

  const { data, isLoading } = useSubmissions({
    search: search.trim() || undefined,
    country: country || undefined,
    category: category || undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit: 20,
  });

  const resetFilters = () => {
    setSearch("");
    setCountry("");
    setCategory("");
    setStatus("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = Boolean(
    search || country || category || status || from || to,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
          <p className="text-sm text-slate-600">
            Search, filter, review, and download client visa applications.
          </p>
        </div>
        {data && (
          <span className="text-sm font-medium text-slate-600">
            Total matching: <strong className="text-slate-900">{data.total}</strong>
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="filter-search" className="text-xs font-semibold text-slate-600">
              Search
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
                className="h-10 pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">
              Country
            </Label>
            <Select
              value={country || "ALL"}
              onValueChange={(val) => {
                setCountry(val === "ALL" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.country_code} value={c.country_code}>
                    {c.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">
              Visa Type
            </Label>
            <Select
              value={category || "ALL"}
              onValueChange={(val) => {
                setCategory(val === "ALL" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">
              Status
            </Label>
            <Select
              value={status || "ALL"}
              onValueChange={(val) => {
                setStatus(val === "ALL" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full">
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

          <div className="flex items-end">
            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="h-10 w-full"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1">
            <Label htmlFor="filter-from" className="text-xs font-semibold text-slate-600">
              From Date
            </Label>
            <Input
              id="filter-from"
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="h-10"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-to" className="text-xs font-semibold text-slate-600">
              To Date
            </Label>
            <Input
              id="filter-to"
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-blue-700" />
        </div>
      ) : (
        <SubmissionsTable items={data?.items ?? []} />
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-sm text-slate-600">
            Page <strong>{data.page}</strong> of <strong>{data.totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

