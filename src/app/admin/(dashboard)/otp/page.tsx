"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Percent,
  RotateCcw,
  Search,
  Send,
  ShieldBan,
  Unlock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ALL_OTP_STATUSES, OtpStatusBadge } from "@/components/admin/OtpBadges";
import { StatCard } from "@/components/admin/StatCard";
import {
  useAdminOtpLogs,
  useAdminOtpStats,
  useBlockPhone,
  useBlockedPhones,
  useUnblockPhone,
} from "@/hooks/useSubmissions";
import { ApiRequestError } from "@/lib/api";
import { BD_MOBILE_FULL_REGEX, normalizeBdMobileInput } from "@/lib/bd-validation";
import { ERROR_MESSAGES } from "@/lib/error-messages";

export default function AdminOtpActivityPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "blocked">("logs");

  // Log filters
  const [phoneSearch, setPhoneSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  // Block modal state (from log row)
  const [blockTargetPhone, setBlockTargetPhone] = useState<string | null>(null);
  const [modalReason, setModalReason] = useState("");

  // Block form state (on Blocked Numbers tab)
  const [newBlockLocalPhone, setNewBlockLocalPhone] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [newBlockError, setNewBlockError] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useAdminOtpStats();
  const { data: logsData, isLoading: logsLoading } = useAdminOtpLogs({
    phone: phoneSearch.trim() || undefined,
    status: statusFilter || undefined,
    date: dateFilter || undefined,
    page,
    limit: 20,
  });
  const { data: blockedData, isLoading: blockedLoading } = useBlockedPhones();
  const blockMutation = useBlockPhone();
  const unblockMutation = useUnblockPhone();

  const hasLogFilters = Boolean(phoneSearch || statusFilter || dateFilter);

  const resetLogFilters = () => {
    setPhoneSearch("");
    setStatusFilter("");
    setDateFilter("");
    setPage(1);
  };

  const handleConfirmBlockFromLog = async () => {
    if (!blockTargetPhone) return;
    try {
      await blockMutation.mutateAsync({
        phone: blockTargetPhone,
        reason: modalReason.trim() || null,
      });
      toast.success(`${blockTargetPhone} has been blocked.`);
      setBlockTargetPhone(null);
      setModalReason("");
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      toast.error(msg);
    }
  };

  const handleBlockFromForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewBlockError(null);
    const fullPhone = normalizeBdMobileInput(newBlockLocalPhone);
    if (!BD_MOBILE_FULL_REGEX.test(fullPhone)) {
      setNewBlockError(ERROR_MESSAGES.invalidBdPhone);
      return;
    }

    try {
      await blockMutation.mutateAsync({
        phone: fullPhone,
        reason: newBlockReason.trim() || null,
      });
      toast.success(`${fullPhone} has been blocked.`);
      setNewBlockLocalPhone("");
      setNewBlockReason("");
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      setNewBlockError(msg);
      toast.error(msg);
    }
  };

  const handleUnblock = async (id: string, phone: string) => {
    try {
      await unblockMutation.mutateAsync(id);
      toast.success(`${phone} has been unblocked.`);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      toast.error(msg);
    }
  };

  const blockedCount = blockedData?.items.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">OTP Activity</h1>
        <p className="text-sm text-slate-600">
          Monitor daily OTP verification activity and manage blocked mobile numbers.
        </p>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <div className="flex h-28 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="OTP Sent Today"
            value={stats?.sentToday ?? 0}
            subtitle="Since midnight (BD)"
            icon={Send}
            accentClass="bg-blue-50 text-blue-700"
          />
          <StatCard
            title="Verified Today"
            value={stats?.verifiedToday ?? 0}
            subtitle="Verified or used"
            icon={CheckCircle2}
            accentClass="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            title="Expired"
            value={stats?.expiredToday ?? 0}
            subtitle="Past 5-min window"
            icon={Clock}
            accentClass="bg-slate-100 text-slate-700"
          />
          <StatCard
            title="Failed"
            value={stats?.failedToday ?? 0}
            subtitle="Max attempts reached"
            icon={XCircle}
            accentClass="bg-red-50 text-red-700"
          />
          <StatCard
            title="Success Rate"
            value={`${stats?.successRate ?? 0}%`}
            subtitle="Verified / Sent today"
            icon={Percent}
            accentClass="bg-indigo-50 text-indigo-700"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <Button
          type="button"
          variant={activeTab === "logs" ? "default" : "outline"}
          onClick={() => setActiveTab("logs")}
          className={
            activeTab === "logs" ? "bg-blue-700 hover:bg-blue-800" : ""
          }
        >
          OTP Logs
        </Button>
        <Button
          type="button"
          variant={activeTab === "blocked" ? "default" : "outline"}
          onClick={() => setActiveTab("blocked")}
          className={
            activeTab === "blocked" ? "bg-blue-700 hover:bg-blue-800" : ""
          }
        >
          <ShieldBan className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Blocked Numbers ({blockedCount})
        </Button>
      </div>

      {activeTab === "logs" ? (
        <div className="space-y-4">
          {/* Log Filters */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="otp-phone-search" className="text-xs font-semibold text-slate-600">
                  Phone Number
                </Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    id="otp-phone-search"
                    type="search"
                    value={phoneSearch}
                    onChange={(e) => {
                      setPhoneSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="017... or +8801..."
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600">
                  Status
                </Label>
                <Select
                  value={statusFilter || "ALL"}
                  onValueChange={(val) => {
                    setStatusFilter(val === "ALL" ? "" : val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    {ALL_OTP_STATUSES.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="otp-date-filter" className="text-xs font-semibold text-slate-600">
                  Date
                </Label>
                <DatePicker
                  id="otp-date-filter"
                  value={dateFilter}
                  mode="past-or-today"
                  allowClear
                  placeholder="All dates"
                  onChange={(val) => {
                    setDateFilter(val);
                    setPage(1);
                  }}
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex items-end">
                {hasLogFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetLogFilters}
                    className="h-10 w-full"
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* OTP Logs Table */}
          {logsLoading ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <Loader2 className="h-7 w-7 animate-spin text-blue-700" />
            </div>
          ) : !logsData || logsData.items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              No OTP logs found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">Phone</TableHead>
                    <TableHead className="font-semibold text-slate-700">Sent At</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Gateway Ref
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Wrong Attempts
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Expires At</TableHead>
                    <TableHead className="font-semibold text-slate-700">Submission</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsData.items.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50/70">
                      <TableCell className="whitespace-nowrap font-mono text-sm font-medium text-slate-900">
                        {row.phone}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {format(new Date(row.createdAt), "dd MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <OtpStatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-slate-700">
                        {row.gatewayRef ? (
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">
                            {row.gatewayRef}
                          </code>
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-700">
                        {row.attempts}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {format(new Date(row.expiresAt), "dd MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {row.submissionId && row.submissionReference ? (
                          <Link
                            href={`/admin/submissions/${row.submissionId}`}
                            className="font-mono font-semibold text-blue-700 hover:underline"
                          >
                            {row.submissionReference}
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {row.isBlocked ? (
                          <Badge
                            variant="outline"
                            className="border-red-200 bg-red-50 text-red-700"
                          >
                            Blocked
                          </Badge>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setBlockTargetPhone(row.phone);
                              setModalReason("");
                            }}
                            className="h-8 border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Ban className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                            Block
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {logsData && logsData.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm text-slate-600">
                Page <strong>{logsData.page}</strong> of{" "}
                <strong>{logsData.totalPages}</strong>
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
                  disabled={page >= logsData.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Block a Number Form */}
          <form
            onSubmit={handleBlockFromForm}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
              <ShieldBan className="h-4 w-4 text-red-600" aria-hidden="true" />
              Block a Number
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="block-phone-input" className="text-sm font-medium text-slate-700">
                  Bangladeshi Mobile Number
                </Label>
                <div className="flex h-11 overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20">
                  <span className="flex shrink-0 items-center border-r border-slate-300 bg-slate-100 px-3 text-sm font-bold text-slate-800 select-none">
                    +88
                  </span>
                  <input
                    id="block-phone-input"
                    type="tel"
                    inputMode="numeric"
                    value={newBlockLocalPhone}
                    onChange={(e) => {
                      let digits = e.target.value.replace(/\D/g, "");
                      if (digits.startsWith("8801") && digits.length >= 13) {
                        digits = digits.slice(2);
                      }
                      setNewBlockLocalPhone(digits);
                      setNewBlockError(null);
                    }}
                    placeholder="01XXXXXXXXX"
                    className="h-full w-full px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                {newBlockError && (
                  <p className="text-xs font-medium text-red-600">{newBlockError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="block-reason-input" className="text-sm font-medium text-slate-700">
                  Reason (Optional)
                </Label>
                <Input
                  id="block-reason-input"
                  type="text"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  placeholder="Example: Spam OTP requests"
                  className="h-11"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={blockMutation.isPending}
                  className="h-11 w-full bg-red-600 font-semibold text-white hover:bg-red-700 sm:w-auto sm:px-6"
                >
                  <Ban className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  {blockMutation.isPending ? "Blocking..." : "Block Number"}
                </Button>
              </div>
            </div>
          </form>

          {/* Blocked Numbers Table */}
          {blockedLoading ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <Loader2 className="h-7 w-7 animate-spin text-blue-700" />
            </div>
          ) : !blockedData || blockedData.items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              No blocked numbers.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Phone</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Blocked Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedData.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap font-mono text-sm font-medium text-slate-900">
                        {item.phone}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {item.reason || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={unblockMutation.isPending}
                          onClick={() => handleUnblock(item.id, item.phone)}
                          className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Unlock className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          Unblock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Confirm Block Dialog (from Log row) */}
      <Dialog
        open={Boolean(blockTargetPhone)}
        onOpenChange={(open) => {
          if (!open) {
            setBlockTargetPhone(null);
            setModalReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {blockTargetPhone}?</DialogTitle>
            <DialogDescription>
              This number will no longer be able to request OTP verification codes until unblocked.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="modal-block-reason" className="text-sm font-medium">
              Reason (Optional)
            </Label>
            <Input
              id="modal-block-reason"
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder="Example: Too many invalid requests"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBlockTargetPhone(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={blockMutation.isPending}
              onClick={handleConfirmBlockFromLog}
            >
              {blockMutation.isPending ? "Blocking..." : "Confirm Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

