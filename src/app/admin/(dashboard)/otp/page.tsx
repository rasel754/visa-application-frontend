"use client";

import { useEffect, useState } from "react";
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
import { OtpStatsPeriod } from "@/lib/types";

const PERIOD_OPTIONS: Array<{ value: OtpStatsPeriod; label: string; description: string }> = [
  { value: "today", label: "Today", description: "Today since midnight (BD)" },
  { value: "week", label: "This Week", description: "Current week (Mon-Sun)" },
  { value: "month", label: "This Month", description: "Current month" },
  { value: "all", label: "All Time", description: "All historical activity" },
];

export default function AdminOtpActivityPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "blocked">("logs");
  const [statsPeriod, setStatsPeriod] = useState<OtpStatsPeriod>("today");
  const [selectedMonth, setSelectedMonth] = useState("");

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

  const { data: stats, isLoading: statsLoading } = useAdminOtpStats(
    selectedMonth ? { month: selectedMonth } : { period: statsPeriod },
  );
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

  // Live Server Time ticker
  const [serverTime, setServerTime] = useState<Date | null>(null);

  useEffect(() => {
    setServerTime(new Date());
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedServerTime = serverTime
    ? format(serverTime, "dd-MMM-yy HH:mm 'BD'")
    : "15-Nov-26 15:26 BD";

  return (
    <div className="space-y-4">
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="flex flex-col gap-2 rounded bg-white px-3.5 py-2 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between border border-slate-200">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="text-emerald-700 font-bold">▼</span>
          <span>
            Figures below:{" "}
            <strong className="font-semibold text-slate-900">
              Your desk OTP logs, SMS verification rates, and blocked numbers
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live DB Sync
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-600">
            Server Time: {formattedServerTime}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">OTP Security & Activity</h1>
          <p className="text-xs text-slate-500">
            Monitor SMS OTP logs, verification rates, and manage blocked mobile numbers.
          </p>
        </div>

        {/* Filters: Preset periods + Month picker */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="inline-flex items-center rounded border border-slate-200 bg-slate-100 p-0.5 shadow-2xs">
            {PERIOD_OPTIONS.map((opt) => {
              const isActive = !selectedMonth && statsPeriod === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedMonth("");
                    setStatsPeriod(opt.value);
                  }}
                  title={opt.description}
                  className={`rounded px-3 py-1 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#00a65a] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Any Month Selector */}
          <div className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 shadow-2xs">
            <Label
              htmlFor="otp-month-picker"
              className="text-xs font-medium text-slate-500 whitespace-nowrap cursor-pointer"
            >
              Month:
            </Label>
            <Input
              id="otp-month-picker"
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
              }}
              className="h-6 w-32 border-0 p-0 text-xs text-slate-800 focus-visible:ring-0 shadow-none cursor-pointer"
            />
            {selectedMonth && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMonth("");
                  setStatsPeriod("month");
                }}
                className="h-5 px-1.5 text-xs text-slate-400 hover:text-slate-700"
                title="Clear custom month"
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <div className="flex h-28 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[#00a65a]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="OTP SENT"
            value={stats?.sent ?? stats?.sentToday ?? 0}
            subtitle={stats?.label ?? "Selected period"}
            icon={Send}
            variant="blue"
          />
          <StatCard
            title="VERIFIED OTP"
            value={stats?.verified ?? stats?.verifiedToday ?? 0}
            subtitle="Verified or used"
            icon={CheckCircle2}
            variant="green"
          />
          <StatCard
            title="EXPIRED"
            value={stats?.expired ?? stats?.expiredToday ?? 0}
            subtitle="Past 5-min window"
            icon={Clock}
            variant="dark"
          />
          <StatCard
            title="FAILED"
            value={stats?.failed ?? stats?.failedToday ?? 0}
            subtitle="Max attempts / rejected"
            icon={XCircle}
            variant="red"
          />
          <StatCard
            title="SUCCESS RATE"
            value={`${stats?.successRate ?? 0}%`}
            subtitle={`Verified / Sent (${stats?.label ?? "Period"})`}
            icon={Percent}
            variant="green"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={activeTab === "logs" ? "default" : "outline"}
          onClick={() => setActiveTab("logs")}
          className={
            activeTab === "logs"
              ? "bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold"
              : "text-xs font-semibold"
          }
        >
          OTP Logs
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeTab === "blocked" ? "default" : "outline"}
          onClick={() => setActiveTab("blocked")}
          className={
            activeTab === "blocked"
              ? "bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold"
              : "text-xs font-semibold"
          }
        >
          <ShieldBan className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Blocked Numbers ({blockedCount})
        </Button>
      </div>

      {activeTab === "logs" ? (
        <div className="space-y-4">
          {/* Log Filters */}
          <div className="rounded border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
              <div className="space-y-1">
                <Label htmlFor="otp-phone-search" className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Phone Number
                </Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
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
                    className="h-9 pl-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Status
                </Label>
                <Select
                  value={statusFilter || "ALL"}
                  onValueChange={(val) => {
                    setStatusFilter(val === "ALL" ? "" : val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-full text-xs">
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
                <Label htmlFor="otp-date-filter" className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
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
                  className="h-9 text-xs"
                />
              </div>

              <div>
                {hasLogFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetLogFilters}
                    className="h-9 w-full text-xs font-semibold"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* OTP Logs Table */}
          <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
            {logsLoading ? (
              <div className="flex h-48 items-center justify-center bg-white">
                <Loader2 className="h-7 w-7 animate-spin text-[#00a65a]" />
              </div>
            ) : !logsData || logsData.items.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No OTP logs found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      <TableHead className="font-bold text-slate-700">Phone</TableHead>
                      <TableHead className="font-bold text-slate-700">Sent At</TableHead>
                      <TableHead className="font-bold text-slate-700">Status</TableHead>
                      <TableHead className="font-bold text-slate-700">Gateway Ref</TableHead>
                      <TableHead className="font-bold text-slate-700">Wrong Attempts</TableHead>
                      <TableHead className="font-bold text-slate-700">Expires At</TableHead>
                      <TableHead className="font-bold text-slate-700">Submission</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {logsData.items.map((row) => (
                      <TableRow key={row.id} className="hover:bg-slate-50/70">
                        <TableCell className="whitespace-nowrap font-mono text-xs font-semibold text-slate-900">
                          {row.phone}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-600 font-mono">
                          {format(new Date(row.createdAt), "dd MMM yyyy, HH:mm")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <OtpStatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-700">
                          {row.gatewayRef ? (
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">
                              {row.gatewayRef}
                            </code>
                          ) : null}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-700">
                          {row.attempts}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-600 font-mono">
                          {format(new Date(row.expiresAt), "dd MMM yyyy, HH:mm")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {row.submissionId && row.submissionReference ? (
                            <Link
                              href={`/admin/submissions/${row.submissionId}`}
                              className="font-mono font-bold text-blue-600 hover:underline"
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
                              className="border-red-200 bg-red-50 text-red-700 text-xs rounded-sm"
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
                              className="h-7 border-red-200 text-red-700 hover:bg-red-50 text-xs"
                            >
                              <Ban className="mr-1 h-3 w-3" aria-hidden="true" />
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
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                <span>
                  Page <strong className="text-slate-900">{logsData.page}</strong> of{" "}
                  <strong className="text-slate-900">{logsData.totalPages}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 text-xs font-semibold"
                  >
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= logsData.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 text-xs font-semibold"
                  >
                    Next
                    <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Block a Number Form */}
          <form
            onSubmit={handleBlockFromForm}
            className="rounded border border-slate-200 bg-white p-4 shadow-2xs"
          >
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldBan className="h-4 w-4 text-red-600" aria-hidden="true" />
              Block a Phone Number
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="block-phone-input" className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Bangladeshi Mobile Number
                </Label>
                <div className="flex h-9 overflow-hidden rounded border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600">
                  <span className="flex shrink-0 items-center border-r border-slate-300 bg-slate-100 px-2.5 text-xs font-bold text-slate-800 select-none">
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
                    className="h-full w-full px-2.5 text-xs text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                {newBlockError && (
                  <p className="text-[11px] font-medium text-red-600">{newBlockError}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="block-reason-input" className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Reason (Optional)
                </Label>
                <Input
                  id="block-reason-input"
                  type="text"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  placeholder="Example: Spam OTP requests"
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={blockMutation.isPending}
                  className="h-9 w-full bg-red-600 font-bold text-xs text-white shadow-2xs hover:bg-red-700 sm:w-auto sm:px-5"
                >
                  <Ban className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {blockMutation.isPending ? "Blocking..." : "Block Number"}
                </Button>
              </div>
            </div>
          </form>

          {/* Blocked Numbers Table */}
          <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
            {blockedLoading ? (
              <div className="flex h-40 items-center justify-center bg-white">
                <Loader2 className="h-7 w-7 animate-spin text-[#00a65a]" />
              </div>
            ) : !blockedData || blockedData.items.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No blocked numbers.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      <TableHead className="font-bold text-slate-700">Phone</TableHead>
                      <TableHead className="font-bold text-slate-700">Reason</TableHead>
                      <TableHead className="font-bold text-slate-700">Blocked Date</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {blockedData.items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/70">
                        <TableCell className="whitespace-nowrap font-mono text-xs font-semibold text-slate-900">
                          {item.phone}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {item.reason || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-600 font-mono">
                          {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={unblockMutation.isPending}
                            onClick={() => handleUnblock(item.id, item.phone)}
                            className="h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs"
                          >
                            <Unlock className="mr-1 h-3 w-3" aria-hidden="true" />
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
        </div>
      )}

      {/* Confirm Block Dialog */}
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
            <Label htmlFor="modal-block-reason" className="text-xs font-semibold">
              Reason (Optional)
            </Label>
            <Input
              id="modal-block-reason"
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder="Example: Too many invalid requests"
              className="h-9 text-xs"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBlockTargetPhone(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={blockMutation.isPending}
              onClick={handleConfirmBlockFromLog}
              className="text-xs"
            >
              {blockMutation.isPending ? "Blocking..." : "Confirm Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
