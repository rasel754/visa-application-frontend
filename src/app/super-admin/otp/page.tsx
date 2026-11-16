"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowUpRight,
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
  ShieldAlert,
  ShieldBan,
  Unlock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ALL_OTP_STATUSES, OtpStatusBadge } from "@/components/admin/OtpBadges";
import { StatCard } from "@/components/admin/StatCard";
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
  { value: "today", label: "Today", description: "Today since midnight (Dhaka UTC+6)" },
  { value: "week", label: "This Week", description: "Current calendar week" },
  { value: "month", label: "This Month", description: "Current calendar month" },
  { value: "all", label: "All Time", description: "All historical platform activity" },
];

export default function SuperAdminOtpPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "blocked">("logs");
  const [statsPeriod, setStatsPeriod] = useState<OtpStatsPeriod>("today");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Server time ticker
  const [serverTime, setServerTime] = useState<Date | null>(null);

  useEffect(() => {
    setServerTime(new Date());
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
              Multi-tenant SMS delivery logs, verification telemetry, and platform-wide blocked numbers
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

      {/* 2. Page Header Bar */}
      <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              OTP Security & Activity
            </h1>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              Platform-Wide
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Cross-tenant SMS delivery logs, verification telemetry, and platform-wide blocked mobile numbers.
          </p>
        </div>

        {/* Period selection */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="inline-flex items-center rounded border border-slate-300 bg-white p-0.5 shadow-2xs">
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
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#00a65a] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 shadow-2xs text-xs">
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
              className="h-6 w-32 border-0 p-0 text-xs font-semibold text-slate-800 focus-visible:ring-0 shadow-none cursor-pointer"
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

      {/* 3. Top Telemetry Metric Cards */}
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
            title="FAILED ATTEMPTS"
            value={stats?.failed ?? stats?.failedToday ?? 0}
            subtitle="Wrong code / rejected"
            icon={XCircle}
            variant="red"
          />
          <StatCard
            title="SUCCESS RATE"
            value={`${stats?.successRate ?? 0}%`}
            subtitle="Verified vs total sent"
            icon={Percent}
            variant="green"
          />
        </div>
      )}

      {/* 4. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === "logs"
              ? "bg-[#00a65a] text-white shadow-2xs"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>OTP Activity Logs</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("blocked")}
          className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === "blocked"
              ? "bg-[#00a65a] text-white shadow-2xs"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ShieldBan className="h-3.5 w-3.5" />
          <span>Blocked Numbers ({blockedCount})</span>
        </button>
      </div>

      {activeTab === "logs" ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="rounded border border-slate-200 bg-[#fafbfc] p-3 shadow-2xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
              {/* Phone search */}
              <div className="space-y-1">
                <Label htmlFor="otp-phone-search" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  SEARCH PHONE
                </Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
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
                    className="h-8 pl-8 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Status filter */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  DELIVERY STATUS
                </Label>
                <Select
                  value={statusFilter || "ALL"}
                  onValueChange={(val) => {
                    setStatusFilter(val === "ALL" ? "" : val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-full text-xs bg-white">
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

              {/* Date filter */}
              <div className="space-y-1">
                <Label htmlFor="otp-date-filter" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  FILTER DATE
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
                  className="h-8 text-xs bg-white"
                />
              </div>

              {/* Reset action */}
              <div>
                {hasLogFilters ? (
                  <button
                    type="button"
                    onClick={resetLogFilters}
                    className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset Filters</span>
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 py-1.5 text-right font-mono">
                    Showing latest 20 logs
                  </div>
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
                No OTP logs found matching current criteria.
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
                      <TableHead className="font-bold text-slate-700">Attempts</TableHead>
                      <TableHead className="font-bold text-slate-700">Expires At</TableHead>
                      <TableHead className="font-bold text-slate-700">Linked Application</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {logsData.items.map((row) => (
                      <TableRow key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="whitespace-nowrap font-mono text-xs font-bold text-slate-900">
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
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
                              {row.gatewayRef}
                            </code>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-700 font-semibold">
                          {row.attempts}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-600 font-mono">
                          {format(new Date(row.expiresAt), "dd MMM yyyy, HH:mm")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs">
                          {row.submissionId && row.submissionReference ? (
                            <Link
                              href={`/super-admin/submissions?search=${encodeURIComponent(row.submissionReference)}`}
                              className="inline-flex items-center gap-1 font-mono font-bold text-blue-600 hover:underline"
                              title="View Application"
                            >
                              <span>{row.submissionReference}</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {row.isBlocked ? (
                            <span className="inline-block rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                              Blocked
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setBlockTargetPhone(row.phone);
                                setModalReason("");
                              }}
                              className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                            >
                              <Ban className="h-3 w-3" />
                              <span>Block</span>
                            </button>
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
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
                <span>
                  Page <strong className="text-slate-900">{logsData.page}</strong> of{" "}
                  <strong className="text-slate-900">{logsData.totalPages}</strong> (Total {logsData.total} logs)
                </span>
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
                  <button
                    type="button"
                    disabled={page >= logsData.totalPages}
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
      ) : (
        <div className="space-y-4">
          {/* Block Number Form */}
          <form
            onSubmit={handleBlockFromForm}
            className="rounded border border-slate-200 bg-white p-4 shadow-2xs"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-1">
              <ShieldBan className="h-4 w-4 text-red-600" />
              <span>Block a Bangladeshi Mobile Number</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Blocked numbers will be globally rejected by the SMS gateway and cannot request visa verification codes.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="block-phone-input" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  MOBILE NUMBER
                </Label>
                <div className="flex h-9 overflow-hidden rounded border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
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
                    className="h-full w-full px-2.5 text-xs font-mono text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                {newBlockError && (
                  <p className="text-[11px] font-medium text-red-600">{newBlockError}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="block-reason-input" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  REASON (OPTIONAL)
                </Label>
                <Input
                  id="block-reason-input"
                  type="text"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  placeholder="e.g. repeated spam, unauthorized test"
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={blockMutation.isPending || !newBlockLocalPhone}
                  className="h-9 w-full bg-[#dd4b39] text-xs font-bold text-white hover:bg-red-700"
                >
                  <Ban className="mr-1.5 h-3.5 w-3.5" />
                  <span>{blockMutation.isPending ? "Blocking..." : "Block Number"}</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Blocked Numbers Table */}
          <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
            <div className="border-b border-slate-200 bg-[#fafbfc] px-4 py-2.5 text-xs font-bold text-slate-800">
              Platform-Wide Blocked Numbers ({blockedCount})
            </div>

            {blockedLoading ? (
              <div className="flex h-36 items-center justify-center bg-white">
                <Loader2 className="h-6 w-6 animate-spin text-[#00a65a]" />
              </div>
            ) : !blockedData || blockedData.items.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No blocked numbers. All valid Bangladesh mobile numbers are allowed to request OTP.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      <TableHead className="font-bold text-slate-700">Blocked Phone</TableHead>
                      <TableHead className="font-bold text-slate-700">Blocked Date</TableHead>
                      <TableHead className="font-bold text-slate-700">Reason</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {blockedData.items.map((row) => (
                      <TableRow key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                          {row.phone}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-slate-600 font-mono">
                          {format(new Date(row.createdAt), "dd MMM yyyy, HH:mm")}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {row.reason || <span className="italic text-slate-400">No reason specified</span>}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <button
                            type="button"
                            disabled={unblockMutation.isPending}
                            onClick={() => handleUnblock(row.id, row.phone)}
                            className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <Unlock className="h-3 w-3" />
                            <span>Unblock</span>
                          </button>
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

      {/* Block Confirmation Dialog */}
      <Dialog
        open={Boolean(blockTargetPhone)}
        onOpenChange={(open) => {
          if (!open) {
            setBlockTargetPhone(null);
            setModalReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              <span>Block Mobile Number</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to block{" "}
              <strong className="font-mono text-slate-900">{blockTargetPhone}</strong>?
              This number will immediately be banned from requesting OTPs across all agencies.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 py-2">
            <Label htmlFor="modal-reason" className="text-xs font-semibold text-slate-700">
              Reason for Blocking (Optional)
            </Label>
            <Input
              id="modal-reason"
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder="e.g. Invalid attempts, abuse"
              className="h-9 text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBlockTargetPhone(null);
                setModalReason("");
              }}
              disabled={blockMutation.isPending}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmBlockFromLog}
              disabled={blockMutation.isPending}
              className="h-9 bg-[#dd4b39] text-xs font-bold text-white hover:bg-red-700"
            >
              {blockMutation.isPending ? "Blocking..." : "Confirm Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
