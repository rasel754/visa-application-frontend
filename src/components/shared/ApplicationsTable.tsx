"use client";

import { useCallback, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import { ApplicationDetailDrawer } from "@/components/shared/ApplicationDetailDrawer";
import { OtpVerifiedBadge } from "@/components/admin/OtpBadges";
import { ProfessionBadge } from "@/components/admin/ProfessionBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { SubmissionSummary } from "@/lib/types";

interface ApplicationsTableProps {
  items: SubmissionSummary[];
  total: number;
  page: number;
  limit?: number;
  totalPages: number;
  isLoading: boolean;
  showCompanyColumn?: boolean;
  onPageChange: (newPage: number) => void;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onRefresh?: () => void;
}

export function ApplicationsTable({
  items,
  total,
  page,
  limit = 20,
  totalPages,
  isLoading,
  showCompanyColumn = false,
  onPageChange,
  onSearchChange,
  onStatusFilterChange,
  onRefresh,
}: ApplicationsTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [pdfConfirm, setPdfConfirm] = useState<{ url: string; filename: string } | null>(null);

  const promptPdfDownload = (url: string, filename: string) => {
    setPdfConfirm({ url, filename });
  };

  const confirmPdfDownload = () => {
    if (!pdfConfirm) return;
    const a = document.createElement("a");
    a.href = pdfConfirm.url;
    a.download = pdfConfirm.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setPdfConfirm(null);
  };

  const handleOpenDetail = useCallback((id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDrawerOpen(false);
    setSelectedId(null);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchVal);
  };

  const startRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-[#fafbfc] p-3 text-xs shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-md items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search reference, applicant name, phone..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="h-8 pl-8 text-xs bg-white"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-8 items-center justify-center rounded bg-[#00a65a] px-3 text-xs font-bold text-white shadow-2xs hover:bg-[#008d4c]"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Select onValueChange={(val) => onStatusFilterChange(val === "ALL" ? "" : val)}>
            <SelectTrigger className="h-8 w-40 text-xs font-medium bg-white border-slate-300">
              <Filter className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CHECKED">Checked</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <TableHead className="font-bold text-slate-700">Date</TableHead>
              <TableHead className="font-bold text-slate-700">Submission No.</TableHead>
              {showCompanyColumn && (
                <TableHead className="font-bold text-slate-700">Agency</TableHead>
              )}
              <TableHead className="font-bold text-slate-700">Applicant Name</TableHead>
              <TableHead className="font-bold text-slate-700">Phone</TableHead>
              <TableHead className="font-bold text-slate-700 text-center">OTP</TableHead>
              <TableHead className="font-bold text-slate-700">Country</TableHead>
              <TableHead className="font-bold text-slate-700">Profession</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={showCompanyColumn ? 10 : 9}
                  className="h-44 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin text-[#00a65a]" />
                    <span className="text-xs">Loading applications...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showCompanyColumn ? 10 : 9}
                  className="h-36 text-center text-xs text-slate-500"
                >
                  No applications found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              items.map((app) => (
                <TableRow key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="whitespace-nowrap font-mono text-xs text-slate-600">
                    {new Date(app.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(app.id)}
                      className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {app.reference}
                    </button>
                  </TableCell>

                  {showCompanyColumn && (
                    <TableCell className="whitespace-nowrap">
                      {app.company ? (
                        <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          {app.company.name} ({app.company.prefix})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Global</span>
                      )}
                    </TableCell>
                  )}

                  <TableCell className="font-bold text-slate-900">
                    {app.applicantName}
                  </TableCell>

                  <TableCell className="whitespace-nowrap font-mono text-xs text-slate-600">
                    {app.applicantPhone || "—"}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-center">
                    <OtpVerifiedBadge
                      verified={app.otpVerified}
                      phone={app.otpVerifiedPhone}
                    />
                  </TableCell>

                  <TableCell className="whitespace-nowrap font-medium text-slate-700">
                    {app.countryName}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <ProfessionBadge profession={app.profession} />
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={app.status} />
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(app.id)}
                        title="Review submission"
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Review</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          promptPdfDownload(
                            api.getAdminPdfUrl(app.id),
                            `${app.reference}.pdf`,
                          )
                        }
                        title="Download Reference PDF"
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Download Reference PDF</span>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 bg-white text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{startRow}</strong> to{" "}
            <strong className="text-slate-900">{endRow}</strong> of{" "}
            <strong className="text-slate-900">{total}</strong> applications
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
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
                    onClick={() => onPageChange(p)}
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
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <ApplicationDetailDrawer
        submissionId={selectedId}
        open={drawerOpen}
        onClose={handleCloseDetail}
        onStatusUpdated={onRefresh}
      />

      {/* PDF DOWNLOAD CONFIRMATION MODAL */}
      <Dialog
        open={Boolean(pdfConfirm)}
        onOpenChange={(isOpen) => !isOpen && setPdfConfirm(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Confirm PDF Download</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 pt-1">
              Are you sure you want to download{" "}
              <strong className="font-semibold text-slate-900">
                {pdfConfirm?.filename}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800">
            This will download the official PDF application sheet to your device.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPdfConfirm(null)}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={confirmPdfDownload}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
