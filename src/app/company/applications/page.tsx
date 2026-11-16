"use client";

import { useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LiveServerTime } from "@/components/admin/LiveServerTime";
import { ApplicationsTable } from "@/components/shared/ApplicationsTable";
import { useAdminMe } from "@/hooks/useSubmissions";
import { api } from "@/lib/api";
import { SubmissionSummary } from "@/lib/types";

export default function CompanyApplicationsPage() {
  const { data: meData } = useAdminMe();
  const company = meData?.user?.company || meData?.admin?.company;

  const [items, setItems] = useState<SubmissionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadSubmissions = async (
    targetPage = page,
    targetSearch = search,
    targetStatus = status,
  ) => {
    try {
      setLoading(true);
      // Backend automatically applies req.tenantWhere: { companyId: req.user.companyId }
      const res = await api.fetchAdminSubmissions({
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
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(1, search, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handlePageChange = (newPage: number) => {
    loadSubmissions(newPage, search, status);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    loadSubmissions(1, newSearch, status);
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="flex flex-col gap-2 rounded border border-slate-200 bg-white px-3.5 py-2 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="font-bold text-emerald-700">▼</span>
          <span>
            Figures below:{" "}
            <strong className="font-semibold text-slate-900">
              {company?.name ? `${company.name} (${company.prefix || "Agency"})` : "Your Agency"}
            </strong>{" "}
            assigned visa applicant submissions
          </span>
        </div>

        <LiveServerTime />
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-700" />
            <h1 className="text-sm font-bold text-slate-900">
              Agency Applications
            </h1>
            <span className="text-xs text-slate-500">
              Review applicant documents, update status, and download branded receipts.
            </span>
          </div>

          <button
            type="button"
            onClick={() => loadSubmissions(page, search, status)}
            className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
          >
            <RefreshCw className="h-3 w-3 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="p-4">
          {/* Applications Table (Company Column Hidden for Single-Tenant View) */}
          <ApplicationsTable
            items={items}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            isLoading={loading}
            showCompanyColumn={false}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
            onStatusFilterChange={(st) => setStatus(st)}
            onRefresh={() => loadSubmissions(page, search, status)}
          />
        </div>
      </div>
    </div>
  );
}
