"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, RefreshCw, TableProperties } from "lucide-react";
import { toast } from "sonner";
import { LiveServerTime } from "@/components/admin/LiveServerTime";
import { ApplicationsTable } from "@/components/shared/ApplicationsTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { CompanyWithCounts, SubmissionSummary } from "@/lib/types";

export default function SuperAdminSubmissionsPage() {
  const searchParams = useSearchParams();
  const initialCompanyId = searchParams.get("companyId") || "";

  const [items, setItems] = useState<SubmissionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Company list for dropdown filter
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);

  useEffect(() => {
    api
      .fetchCompanies()
      .then((res) => setCompanies(res.items))
      .catch((err) => console.error(err));
  }, []);

  const loadSubmissions = async (
    targetPage = page,
    targetSearch = search,
    targetStatus = status,
    targetCompany = selectedCompanyId,
  ) => {
    try {
      setLoading(true);
      const res = await api.fetchAdminSubmissions({
        companyId: targetCompany || undefined,
        search: targetSearch || undefined,
        status: targetStatus || undefined,
        page: targetPage,
        limit,
      });
      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch {
      toast.error("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(1, search, status, selectedCompanyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId, status]);

  const handlePageChange = (newPage: number) => {
    loadSubmissions(newPage, search, status, selectedCompanyId);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    loadSubmissions(1, newSearch, status, selectedCompanyId);
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="flex flex-col gap-2 rounded bg-white px-3.5 py-2 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between border border-slate-200">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="text-emerald-700 font-bold">▼</span>
          <span>
            Figures below:{" "}
            <strong className="font-semibold text-slate-900">
              Cross-tenant global submissions feed and visa intake records
            </strong>
          </span>
        </div>

        <LiveServerTime />
      </div>

      {/* 2. Page Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <TableProperties className="h-5 w-5 text-emerald-700" />
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Global Platform Submissions
            </h1>
            <p className="text-xs text-slate-500">
              Cross-tenant intake feed. Filter by agency, search applicants, or inspect verified application sheets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadSubmissions(page, search, status, selectedCompanyId)}
            className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* 3. Agency Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-[#fafbfc] p-3 text-xs shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700">
          <Building2 className="h-4 w-4 text-emerald-700" />
          <span>Agency Scope:</span>
        </div>

        <div className="w-64">
          <Select
            value={selectedCompanyId || "ALL"}
            onValueChange={(val) => setSelectedCompanyId(val === "ALL" ? "" : val)}
          >
            <SelectTrigger className="h-8 bg-white text-xs font-medium border-slate-300">
              <SelectValue placeholder="All Agencies (Global)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Agencies (Global)</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.prefix})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCompanyId && (
          <button
            type="button"
            onClick={() => setSelectedCompanyId("")}
            className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Clear Agency Filter
          </button>
        )}

        <div className="ml-auto font-mono text-xs text-slate-500">
          Matching: <strong className="text-slate-800">{total}</strong> applications
        </div>
      </div>

      {/* 4. Reusable Submissions Table with Company Column */}
      <ApplicationsTable
        items={items}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        isLoading={loading}
        showCompanyColumn={true}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={(st) => setStatus(st)}
        onRefresh={() => loadSubmissions(page, search, status, selectedCompanyId)}
      />
    </div>
  );
}
