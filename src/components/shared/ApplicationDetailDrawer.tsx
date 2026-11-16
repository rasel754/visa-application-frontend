"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  MapPin,
  Phone,
  Plane,
  Save,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { OtpVerifiedBadge } from "@/components/admin/OtpBadges";
import { ProfessionBadge } from "@/components/admin/ProfessionBadge";
import {
  ALL_SUBMISSION_STATUSES,
  StatusBadge,
  getStatusLabel,
} from "@/components/admin/StatusBadge";
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
  useAdminMe,
  useSubmissionDetail,
  useUpdateSubmissionStatus,
} from "@/hooks/useSubmissions";
import { api } from "@/lib/api";
import {
  formatDateYmdDisplay,
  getTableColumnsFromData,
} from "@/lib/field-helpers";
import { isTableRowNonEmpty } from "@/lib/form-validation";
import {
  FormDocument,
  SubmissionDetail,
  SubmissionDocumentMeta,
  SubmissionStatus,
  TableRowValue,
} from "@/lib/types";

interface ApplicationDetailDrawerProps {
  submissionId: string | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdated?: (newStatus: SubmissionStatus) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSectionIcon(sectionName: string) {
  const lower = sectionName.toLowerCase();
  if (lower.includes("personal") || lower.includes("general")) {
    return <User className="h-4 w-4 text-blue-600" aria-hidden="true" />;
  }
  if (lower.includes("contact")) {
    return <Phone className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
  }
  if (lower.includes("passport")) {
    return <CreditCard className="h-4 w-4 text-indigo-600" aria-hidden="true" />;
  }
  if (lower.includes("travel") || lower.includes("destination") || lower.includes("flight")) {
    return <Plane className="h-4 w-4 text-sky-600" aria-hidden="true" />;
  }
  if (lower.includes("host") || lower.includes("invitation") || lower.includes("accommodation")) {
    return <MapPin className="h-4 w-4 text-rose-600" aria-hidden="true" />;
  }
  if (lower.includes("family")) {
    return <Users className="h-4 w-4 text-purple-600" aria-hidden="true" />;
  }
  if (lower.includes("education") || lower.includes("study") || lower.includes("student")) {
    return <GraduationCap className="h-4 w-4 text-amber-600" aria-hidden="true" />;
  }
  if (lower.includes("work") || lower.includes("employ") || lower.includes("business")) {
    return <Building2 className="h-4 w-4 text-teal-600" aria-hidden="true" />;
  }
  if (lower.includes("financial") || lower.includes("sponsor") || lower.includes("cost")) {
    return <CreditCard className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
  }
  if (lower.includes("history") || lower.includes("security") || lower.includes("refusal")) {
    return <Clock className="h-4 w-4 text-orange-600" aria-hidden="true" />;
  }
  return <Layers className="h-4 w-4 text-slate-600" aria-hidden="true" />;
}

export function ApplicationDetailDrawer({
  submissionId,
  open,
  onClose,
  onStatusUpdated,
}: ApplicationDetailDrawerProps) {
  const effectiveId = open && submissionId ? submissionId : "";
  const {
    data: queryDetail,
    isLoading: queryLoading,
    isError,
  } = useSubmissionDetail(effectiveId);
  const updateStatusMutation = useUpdateSubmissionStatus(effectiveId);
  const { data: meData } = useAdminMe();
  const currentUser = meData?.user || meData?.admin;
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus>("NEW");
  const [copiedRef, setCopiedRef] = useState(false);

  // Active Tab: "form" | "documents" | "audit"
  const [activeTab, setActiveTab] = useState<"form" | "documents" | "audit">("form");

  // In-modal search filter
  const [searchQuery, setSearchQuery] = useState("");

  // In-modal preview document
  const [previewDoc, setPreviewDoc] = useState<SubmissionDocumentMeta | null>(null);

  // PDF Download Confirmation Modal state
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

  useEffect(() => {
    if (activeTab === "audit" && !isSuperAdmin) {
      setActiveTab("form");
    }
  }, [activeTab, isSuperAdmin]);

  useEffect(() => {
    if (queryDetail) {
      setDetail(queryDetail);
      setSelectedStatus(queryDetail.status);
    } else if (!open || !submissionId) {
      setDetail(null);
    }
  }, [queryDetail, open, submissionId]);

  useEffect(() => {
    if (isError && open) {
      toast.error("Failed to load application details.");
      onClose();
    }
  }, [isError, open, onClose]);

  const loading = open && Boolean(submissionId) && queryLoading && !detail;
  const updatingStatus = updateStatusMutation.isPending;

  const handleCopyReference = () => {
    if (!detail?.reference) return;
    navigator.clipboard.writeText(detail.reference);
    setCopiedRef(true);
    toast.success("Submission reference copied to clipboard.");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleStatusChange = async (newStatus: SubmissionStatus) => {
    if (!detail) return;
    try {
      await updateStatusMutation.mutateAsync(newStatus);
      setDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
      setSelectedStatus(newStatus);
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
      onStatusUpdated?.(newStatus);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  // Uploaded docs mapping
  const uploadedDocMap = useMemo(() => {
    const map = new Map<string, SubmissionDocumentMeta>();
    if (!detail?.documents) return map;
    for (const doc of detail.documents) {
      map.set(doc.documentKey, doc);
    }
    return map;
  }, [detail?.documents]);

  // Combined required documents
  const allRequiredDocs = useMemo(() => {
    if (!detail) return [];
    const list: FormDocument[] = [];
    if (detail.commonDocuments) list.push(...detail.commonDocuments);
    if (detail.additionalDocuments) list.push(...detail.additionalDocuments);
    return list;
  }, [detail]);

  const totalRequiredCount = allRequiredDocs.length;
  const uploadedRequiredCount = useMemo(() => {
    return allRequiredDocs.filter((d) => uploadedDocMap.has(d.key)).length;
  }, [allRequiredDocs, uploadedDocMap]);

  const completenessPercent =
    totalRequiredCount > 0
      ? Math.round((uploadedRequiredCount / totalRequiredCount) * 100)
      : 100;

  // Filtered sections for search
  const filteredSections = useMemo(() => {
    if (!detail?.sections) return [];
    const q = searchQuery.trim().toLowerCase();

    return detail.sections
      .map((sec) => {
        const matchingFields = sec.fields.filter((f) => {
          const val = detail.answers[f.key];
          const hasValue =
            f.type === "table"
              ? Array.isArray(val) && (val as TableRowValue[]).some(isTableRowNonEmpty)
              : typeof val === "number"
                ? Number.isFinite(val)
                : typeof val === "string" && val.trim().length > 0;

          if (!hasValue) return false;
          if (!q) return true;

          const labelMatch = f.label.toLowerCase().includes(q);
          const subgroupMatch = f.subgroup ? f.subgroup.toLowerCase().includes(q) : false;
          const sectionMatch = sec.section.toLowerCase().includes(q);
          const valueString =
            typeof val === "object" ? JSON.stringify(val).toLowerCase() : String(val).toLowerCase();
          const valueMatch = valueString.includes(q);

          return labelMatch || subgroupMatch || sectionMatch || valueMatch;
        });

        return {
          ...sec,
          fields: matchingFields,
        };
      })
      .filter((sec) => sec.fields.length > 0);
  }, [detail?.sections, detail?.answers, searchQuery]);

  // Vitals summary
  const vitals = useMemo(() => {
    if (!detail?.answers) return null;
    const a = detail.answers;

    const passportNo =
      (a["passport_number"] as string) || (a["passportNumber"] as string) || "—";
    const passportExpiry =
      (a["passport_expiry_date"] as string) || (a["passport_expiry"] as string) || "";
    const arrival =
      (a["intended_arrival_date"] as string) || (a["arrival_date"] as string) || "";
    const durationDays =
      (a["duration_of_stay_days"] as string | number) || (a["duration_days"] as string | number) || "";
    const destinationCity =
      (a["destination_city"] as string) || (a["main_destination"] as string) || detail.countryName;
    const dob = (a["date_of_birth"] as string) || (a["dob"] as string) || "";
    const gender = (a["sex"] as string) || (a["gender"] as string) || "";
    const maritalStatus = (a["marital_status"] as string) || "";

    return {
      passportNo,
      passportExpiry,
      arrival,
      durationDays,
      destinationCity,
      dob,
      gender,
      maritalStatus,
    };
  }, [detail]);

  const renderChecklistSection = (title: string, docs: FormDocument[]) => {
    if (docs.length === 0) return null;
    return (
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>{title} ({docs.length})</span>
        </h4>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {docs.map((reqDoc) => {
            const uploadedMeta = uploadedDocMap.get(reqDoc.key);
            const isGiven = Boolean(uploadedMeta);

            return (
              <div
                key={reqDoc.key}
                className={`flex items-start justify-between gap-3 rounded-lg border p-2.5 transition-colors ${
                  isGiven
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {reqDoc.label}
                    </p>
                    {reqDoc.required && (
                      <span className="shrink-0 text-[10px] font-semibold text-rose-600">
                        *Req
                      </span>
                    )}
                  </div>
                  {reqDoc.note && (
                    <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                      {reqDoc.note}
                    </p>
                  )}
                  {uploadedMeta && (
                    <p className="mt-0.5 font-mono text-[10px] text-emerald-800 truncate">
                      {uploadedMeta.originalName} ({formatFileSize(uploadedMeta.sizeBytes)})
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {isGiven ? (
                    <>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                        Given
                      </span>
                      {uploadedMeta && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(uploadedMeta)}
                          className="rounded p-1 text-slate-600 hover:bg-emerald-100 hover:text-emerald-900"
                          title="Preview document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      <XCircle className="h-3 w-3 text-slate-400" />
                      Missing
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl p-0 overflow-hidden sm:rounded-2xl border-slate-200 shadow-2xl flex flex-col">
        {/* 1. FIXED TOP HEADER */}
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-3.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle asChild>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="font-mono text-lg sm:text-xl font-bold text-blue-700 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                    title="Click to copy Reference Number"
                  >
                    <span>{detail?.reference || "Application Details"}</span>
                    {copiedRef ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                    )}
                  </button>
                </DialogTitle>

                {detail && <StatusBadge status={detail.status} />}
                {detail && <ProfessionBadge profession={detail.profession} />}
                {detail && (
                  <OtpVerifiedBadge
                    verified={detail.otpVerified}
                    phone={detail.otpVerifiedPhone}
                  />
                )}
                {detail?.company && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-800">
                    <Building2 className="h-3 w-3" />
                    {detail.company.name} ({detail.company.prefix})
                  </span>
                )}
              </div>

              <DialogDescription className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {detail?.applicantName || "Loading..."}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-bold">
                  {detail?.countryName} (Visit Visa)
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  {detail?.officialVisaName}
                </span>
                {detail?.createdAt && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">
                      Submitted: {format(new Date(detail.createdAt), "dd MMM yyyy, HH:mm")}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>

            {/* Quick Actions in Header */}
            {detail && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs font-semibold"
                  onClick={() =>
                    promptPdfDownload(
                      api.getAdminPdfUrl(detail.id),
                      `${detail.reference}.pdf`,
                    )
                  }
                >
                  <FileText className="h-3.5 w-3.5 text-slate-600" />
                  PDF
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* 2. BODY CONTENT (SCROLLABLE) */}
        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold text-slate-500">Loading application details...</p>
          </div>
        ) : !detail ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Could not load application details.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Status Workflow Action Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <Save className="h-4 w-4 text-emerald-700" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Processing Stage & Status
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Select a status to update this application across the agency portal.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={selectedStatus}
                  onValueChange={(val) => setSelectedStatus(val as SubmissionStatus)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="h-8 w-40 bg-white text-xs font-bold border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_SUBMISSION_STATUSES.map((st) => (
                      <SelectItem key={st} value={st} className="text-xs">
                        {getStatusLabel(st)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  onClick={() => handleStatusChange(selectedStatus)}
                  disabled={updatingStatus || selectedStatus === detail.status}
                  size="sm"
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
                >
                  {updatingStatus ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
              </div>
            </div>

            {/* Vitals Summary Strip */}
            {vitals && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Passport
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                    {vitals.passportNo}
                  </div>
                  {vitals.passportExpiry && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Exp: {formatDateYmdDisplay(vitals.passportExpiry)}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Travel Plan
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {vitals.destinationCity}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {vitals.arrival ? formatDateYmdDisplay(vitals.arrival) : "Dates TBD"}
                    {vitals.durationDays ? ` • ${vitals.durationDays} Days` : ""}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Applicant
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {detail.applicantName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    {detail.applicantPhone || "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Documents</span>
                    <span className="font-bold text-emerald-700">{completenessPercent}%</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {detail.documents.length} Files Attached
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {uploadedRequiredCount} of {totalRequiredCount} Required Given
                  </div>
                </div>
              </div>
            )}

            {/* Tabs Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 rounded-lg shadow-2xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeTab === "form"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Answers</span>
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      activeTab === "form"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {filteredSections.reduce((acc, s) => acc + s.fields.length, 0)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("documents")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeTab === "documents"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  <span>Documents & Checklist</span>
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      activeTab === "documents"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {detail.documents.length}
                  </span>
                </button>

                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("audit")}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      activeTab === "audit"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Agency & Audit Details</span>
                  </button>
                )}
              </div>

              {activeTab === "form" && (
                <div className="relative w-full sm:w-56">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search answers..."
                    className="h-8 pl-8 pr-7 text-xs bg-slate-50 border-slate-200"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* TAB 1: APPLICATION ANSWERS */}
            {activeTab === "form" && (
              <div className="space-y-4">
                {filteredSections.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
                    {searchQuery ? (
                      <div>
                        <p className="font-semibold text-slate-700">
                          No matching fields found for &ldquo;{searchQuery}&rdquo;
                        </p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-blue-600 underline font-medium"
                        >
                          Clear search filter
                        </button>
                      </div>
                    ) : (
                      <p>No answers recorded for this application.</p>
                    )}
                  </div>
                ) : (
                  filteredSections.map((sec, sIdx) => (
                    <div
                      key={`sec-${sec.section}-${sIdx}`}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 bg-[#fafbfc] px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 shadow-2xs">
                            {getSectionIcon(sec.section)}
                          </div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            {sec.section}
                          </h4>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 font-semibold">
                          {sec.fields.length} {sec.fields.length === 1 ? "field" : "fields"}
                        </span>
                      </div>

                      <div className="p-4">
                        {/* Check for No Formal Education */}
                        {sec.section.toLowerCase().includes("education") &&
                          (String(detail.answers["has_no_education"] ?? "") === "yes" ||
                            String(detail.answers["has_no_education"] ?? "") === "true" ||
                            (detail.answers["has_no_education"] as unknown) === true) && (
                            <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900">
                              <GraduationCap className="h-4 w-4 text-amber-700 shrink-0" />
                              <div>
                                <strong>Educational Qualification:</strong> Applicant declared{" "}
                                <span className="font-bold underline">No Formal Education</span>.
                              </div>
                            </div>
                          )}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {sec.fields.map((field) => {
                            const val = detail.answers[field.key];
                            if (val === undefined || val === null || val === "") return null;
                            if (field.key === "has_no_education") return null;

                            // Table value
                            if (field.type === "table") {
                              const rows = (
                                Array.isArray(val) ? (val as TableRowValue[]) : []
                              ).filter(isTableRowNonEmpty);
                              const columns = getTableColumnsFromData(field.key, rows);

                              return (
                                <div
                                  key={field.key}
                                  className="col-span-full rounded-lg border border-slate-200 bg-slate-50/40 p-3"
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800">
                                      {field.subgroup
                                        ? `${field.subgroup} — ${field.label}`
                                        : field.label}
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-500 font-semibold">
                                      {rows.length} {rows.length === 1 ? "entry" : "entries"}
                                    </span>
                                  </div>

                                  {rows.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-1">
                                      No records provided.
                                    </p>
                                  ) : (
                                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                      <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                                          <tr>
                                            {columns.map((col) => (
                                              <th key={col.key} className="px-3 py-2">
                                                {col.label}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {rows.map((row, rIdx) => (
                                            <tr key={rIdx} className="hover:bg-slate-50/70">
                                              {columns.map((col) => (
                                                <td key={col.key} className="px-3 py-1.5 text-slate-900 font-medium">
                                                  {row[col.key]?.trim() || "—"}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            // Scalar field
                            const raw = typeof val === "number" ? String(val) : String(val).trim();
                            const isDate = field.type === "date" || field.key.includes("date");
                            const formattedVal = raw
                              ? isDate
                                ? formatDateYmdDisplay(raw)
                                : raw
                              : "—";

                            const isSecurityAlert =
                              field.key.includes("refusal") || field.key.includes("deport");

                            return (
                              <div
                                key={field.key}
                                className={`rounded-lg border p-2.5 flex flex-col justify-between transition-colors ${
                                  isSecurityAlert && raw.toLowerCase() === "yes"
                                    ? "border-rose-300 bg-rose-50/60"
                                    : "border-slate-200 bg-slate-50/30 hover:bg-slate-50"
                                }`}
                              >
                                <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                  {field.subgroup ? `${field.subgroup} • ${field.label}` : field.label}
                                </dt>
                                <dd className="mt-1 text-xs font-bold text-slate-900 break-words">
                                  {formattedVal}
                                </dd>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: DOCUMENTS & CHECKLIST */}
            {activeTab === "documents" && (
              <div className="space-y-4">
                {/* Required Documents Checklist Card */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 bg-[#fafbfc] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 shadow-2xs">
                        <FileCheck className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Destination Visa Document Checklist
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Requirements for {detail.countryName} ({detail.professionLabel} Category)
                        </p>
                      </div>
                    </div>

                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                      {uploadedRequiredCount} / {totalRequiredCount} Uploaded ({completenessPercent}%)
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {totalRequiredCount === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        No specific document checklist registered for this destination.
                      </p>
                    ) : (
                      <>
                        {renderChecklistSection("Mandatory Documents", detail.commonDocuments ?? [])}
                        {renderChecklistSection(
                          `${detail.professionLabel} Category Documents`,
                          detail.additionalDocuments ?? [],
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Uploaded Files Gallery */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-[#fafbfc] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 shadow-2xs">
                        <FileText className="h-4 w-4 text-blue-700" />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Uploaded Files ({detail.documents.length})
                      </h4>
                    </div>

                    {/* Uploaded Files Header */}
                  </div>

                  {detail.documents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 italic">
                      No files uploaded with this submission.
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {detail.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:shadow-xs transition-shadow"
                          >
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                  {doc.group}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {formatFileSize(doc.sizeBytes)}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                                {doc.label}
                              </h5>
                              <p className="font-mono text-[11px] text-slate-500 truncate" title={doc.originalName}>
                                {doc.originalName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {doc.mimeType} &bull; {format(new Date(doc.createdAt), "dd-MMM HH:mm")}
                              </p>
                            </div>

                            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPreviewDoc(doc)}
                                className="flex-1 h-7 text-xs font-semibold"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Preview
                              </Button>
                              {doc.mimeType === "application/pdf" ||
                              doc.originalName.toLowerCase().endsWith(".pdf") ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() =>
                                    promptPdfDownload(
                                      api.getAdminDocumentUrl(detail.id, doc.id, false),
                                      doc.originalName,
                                    )
                                  }
                                  className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                                >
                                  <Download className="mr-1 h-3 w-3" />
                                  Download
                                </Button>
                              ) : (
                                <Button
                                  asChild
                                  size="sm"
                                  className="flex-1 h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                                >
                                  <a
                                    href={api.getAdminDocumentUrl(detail.id, doc.id, false)}
                                    download={doc.originalName}
                                  >
                                    <Download className="mr-1 h-3 w-3" />
                                    Download
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: AGENCY & AUDIT INFO (SUPER ADMIN ONLY) */}
            {activeTab === "audit" && isSuperAdmin && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="border-b border-slate-200 bg-[#fafbfc] px-4 py-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-purple-700" />
                      <span>Assigned Agency</span>
                    </h4>
                  </div>
                  <div className="p-4 space-y-2.5 text-xs">
                    {detail.company ? (
                      <>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-500 font-medium">Agency Name:</span>
                          <span className="font-bold text-slate-900">{detail.company.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-500 font-medium">Agency Prefix:</span>
                          <span className="font-mono font-bold text-slate-900">{detail.company.prefix}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-500 font-medium">Agency Slug:</span>
                          <span className="font-mono text-blue-600">/apply/{detail.company.slug}</span>
                        </div>
                        {detail.company.phone && (
                          <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 font-medium">Phone:</span>
                            <span className="font-mono text-slate-800">{detail.company.phone}</span>
                          </div>
                        )}
                        {detail.company.address && (
                          <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 font-medium">Address:</span>
                            <span className="text-slate-800 text-right">{detail.company.address}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-4 text-center text-slate-500">
                        <p className="font-semibold text-slate-700">Global Direct Submission</p>
                        <p className="text-[11px] mt-0.5">
                          Assigned directly to master administrative desk.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="border-b border-slate-200 bg-[#fafbfc] px-4 py-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" />
                      <span>Security & Verification Audit</span>
                    </h4>
                  </div>
                  <div className="p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Submission ID:</span>
                      <span className="font-mono text-slate-700 select-all">{detail.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Reference Code:</span>
                      <span className="font-mono font-bold text-blue-700 select-all">{detail.reference}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">OTP Verification:</span>
                      <span>
                        {detail.otpVerified ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified ({detail.otpVerifiedPhone || detail.applicantPhone})
                          </span>
                        ) : (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            Unverified
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Created:</span>
                      <span className="font-mono text-slate-800">
                        {format(new Date(detail.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">Updated:</span>
                      <span className="font-mono text-slate-800">
                        {format(new Date(detail.updatedAt), "yyyy-MM-dd HH:mm:ss")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. STICKY MODAL FOOTER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/90 px-5 py-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Reference:</span>
            <strong className="font-mono text-slate-900">{detail?.reference}</strong>
            {detail && <StatusBadge status={detail.status} />}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* DOCUMENT PREVIEW SUB-MODAL */}
      <Dialog open={Boolean(previewDoc)} onOpenChange={(isOpen) => !isOpen && setPreviewDoc(null)}>
        <DialogContent className="max-h-[92vh] w-[90vw] sm:max-w-3xl md:max-w-4xl p-0 overflow-hidden sm:rounded-2xl border-slate-200">
          <DialogHeader className="border-b border-slate-200 px-5 py-3 bg-slate-50">
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900">
                  {previewDoc?.label}
                </DialogTitle>
                <DialogDescription className="font-mono text-[11px] text-slate-500 mt-0.5">
                  {previewDoc?.originalName} &bull; {previewDoc ? formatFileSize(previewDoc.sizeBytes) : ""}
                </DialogDescription>
              </div>

              {previewDoc && detail && (
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs font-semibold">
                    <a
                      href={api.getAdminDocumentUrl(detail.id, previewDoc.id, true)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      New Tab
                    </a>
                  </Button>
                  {previewDoc.mimeType === "application/pdf" ||
                  previewDoc.originalName.toLowerCase().endsWith(".pdf") ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        promptPdfDownload(
                          api.getAdminDocumentUrl(detail.id, previewDoc.id, false),
                          previewDoc.originalName,
                        )
                      }
                      className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                      <a
                        href={api.getAdminDocumentUrl(detail.id, previewDoc.id, false)}
                        download={previewDoc.originalName}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="relative flex min-h-[350px] max-h-[68vh] items-center justify-center bg-slate-900/5 p-4 overflow-auto">
            {previewDoc && detail && (
              previewDoc.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={api.getAdminDocumentUrl(detail.id, previewDoc.id, true)}
                  alt={previewDoc.label}
                  className="max-h-[62vh] w-auto max-w-full rounded-lg object-contain shadow-md"
                />
              ) : previewDoc.mimeType === "application/pdf" ? (
                <iframe
                  src={api.getAdminDocumentUrl(detail.id, previewDoc.id, true)}
                  title={previewDoc.label}
                  className="h-[62vh] w-full rounded-lg border border-slate-200 bg-white"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    Preview not supported for this file format ({previewDoc.mimeType})
                  </p>
                  {previewDoc.mimeType === "application/pdf" ||
                  previewDoc.originalName.toLowerCase().endsWith(".pdf") ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        promptPdfDownload(
                          api.getAdminDocumentUrl(detail.id, previewDoc.id, false),
                          previewDoc.originalName,
                        )
                      }
                      className="mt-4 text-xs font-bold"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download File to View
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="mt-4 text-xs font-bold">
                      <a
                        href={api.getAdminDocumentUrl(detail.id, previewDoc.id, false)}
                        download={previewDoc.originalName}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download File to View
                      </a>
                    </Button>
                  )}
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

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
            This will download the official document PDF to your device.
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
    </Dialog>
  );
}
