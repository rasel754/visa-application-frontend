"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
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
  Mail,
  MapPin,
  Phone,
  Plane,
  Printer,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { PrintSheet } from "@/components/admin/PrintSheet";
import { OtpVerifiedBadge } from "@/components/admin/OtpBadges";
import { ProfessionBadge } from "@/components/admin/ProfessionBadge";
import {
  ALL_SUBMISSION_STATUSES,
  StatusBadge,
  getStatusLabel,
} from "@/components/admin/StatusBadge";
import {
  useAdminMe,
  useDeleteSubmission,
  useSubmissionDetail,
  useUpdateSubmissionStatus,
} from "@/hooks/useSubmissions";
import { ApiRequestError, api } from "@/lib/api";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import {
  formatDateYmdDisplay,
  getTableColumnsFromData,
} from "@/lib/field-helpers";
import { isTableRowNonEmpty } from "@/lib/form-validation";
import {
  FormDocument,
  SubmissionDocumentMeta,
  SubmissionStatus,
  TableRowValue,
} from "@/lib/types";

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

export default function AdminSubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const { data: detail, isLoading, error } = useSubmissionDetail(id);
  const updateStatusMutation = useUpdateSubmissionStatus(id);
  const deleteMutation = useDeleteSubmission();
  const { data: meData } = useAdminMe();
  const currentUser = meData?.user || meData?.admin;
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus>("NEW");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Active tab state: "form" | "documents" | "audit"
  const [activeTab, setActiveTab] = useState<"form" | "documents" | "audit">("form");

  // In-app search within form answers
  const [fieldSearchQuery, setFieldSearchQuery] = useState("");

  // In-app Document Preview Modal
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

  // Live Server Time ticker
  const [serverTime, setServerTime] = useState<Date | null>(null);

  useEffect(() => {
    setServerTime(new Date());
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (detail?.status) {
      setSelectedStatus(detail.status);
    }
  }, [detail?.status]);

  const handleCopyReference = () => {
    if (!detail?.reference) return;
    navigator.clipboard.writeText(detail.reference);
    setCopiedRef(true);
    toast.success("Submission reference copied to clipboard.");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleSaveStatus = async () => {
    try {
      await updateStatusMutation.mutateAsync(selectedStatus);
      toast.success(`Application status updated to ${getStatusLabel(selectedStatus)}`);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Submission permanently deleted.");
      router.replace("/admin/submissions");
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      toast.error(msg);
    }
  };

  const formattedServerTime = serverTime
    ? format(serverTime, "dd-MMM-yy HH:mm 'BD'")
    : "15-Nov-26 15:26 BD";

  // Document map for fast checklist lookup
  const uploadedDocMap = useMemo(() => {
    const map = new Map<string, SubmissionDocumentMeta>();
    if (!detail?.documents) return map;
    for (const doc of detail.documents) {
      map.set(doc.documentKey, doc);
    }
    return map;
  }, [detail?.documents]);

  // Combined required documents checklist
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

  // Filtered sections based on in-app field search
  const filteredSections = useMemo(() => {
    if (!detail?.sections) return [];
    const q = fieldSearchQuery.trim().toLowerCase();

    return detail.sections
      .map((sec) => {
        const matchingFields = sec.fields.filter((f) => {
          const val = detail.answers[f.key];
          // Check if field was answered
          const hasValue =
            f.type === "table"
              ? Array.isArray(val) && (val as TableRowValue[]).some(isTableRowNonEmpty)
              : typeof val === "number"
                ? Number.isFinite(val)
                : typeof val === "string" && val.trim().length > 0;

          if (!hasValue) return false;
          if (!q) return true;

          // Search in label, subgroup, section, and value
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
  }, [detail?.sections, detail?.answers, fieldSearchQuery]);

  // Quick vital highlights from answers
  const vitals = useMemo(() => {
    if (!detail?.answers) return null;
    const a = detail.answers;

    const passportNo =
      (a["passport_number"] as string) ||
      (a["passportNumber"] as string) ||
      "—";
    const passportIssue =
      (a["passport_issue_date"] as string) || (a["passport_issue"] as string) || "";
    const passportExpiry =
      (a["passport_expiry_date"] as string) || (a["passport_expiry"] as string) || "";

    const arrival =
      (a["intended_arrival_date"] as string) || (a["arrival_date"] as string) || "";
    const departure =
      (a["intended_departure_date"] as string) || (a["departure_date"] as string) || "";
    const durationDays =
      (a["duration_of_stay_days"] as string | number) || (a["duration_days"] as string | number) || "";
    const destinationCity =
      (a["destination_city"] as string) || (a["main_destination"] as string) || detail.countryName;

    const dob = (a["date_of_birth"] as string) || (a["dob"] as string) || "";
    const gender = (a["sex"] as string) || (a["gender"] as string) || "";
    const maritalStatus = (a["marital_status"] as string) || "";
    const nationality = (a["current_nationality"] as string) || "Bangladeshi";

    const tripFundedBy =
      (a["who_pays_for_trip"] as string) ||
      (a["trip_funded_by"] as string) ||
      (a["cost_covered_by"] as string) ||
      "—";
    const sponsorName = (a["sponsor_name"] as string) || "";
    const estimatedCost = (a["estimated_trip_cost"] as string | number) || "";

    return {
      passportNo,
      passportIssue,
      passportExpiry,
      arrival,
      departure,
      durationDays,
      destinationCity,
      dob,
      gender,
      maritalStatus,
      nationality,
      tripFundedBy,
      sponsorName,
      estimatedCost,
    };
  }, [detail]);

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white shadow-xs">
        <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-slate-500">
          Loading submission details...
        </p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/70 p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold text-red-900">
          Application Record Not Found
        </h2>
        <p className="mt-1 text-xs text-red-700 max-w-md mx-auto">
          {error instanceof ApiRequestError
            ? error.message
            : ERROR_MESSAGES.formNotFound}
        </p>
        <Button asChild variant="outline" className="mt-5 h-9 text-xs font-semibold">
          <Link href="/admin/submissions">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Submissions
          </Link>
        </Button>
      </div>
    );
  }

  const renderChecklistSection = (title: string, docs: FormDocument[]) => {
    if (docs.length === 0) return null;
    return (
      <div className="space-y-2.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>{title} ({docs.length})</span>
        </h4>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {docs.map((reqDoc) => {
            const uploadedMeta = uploadedDocMap.get(reqDoc.key);
            const isGiven = Boolean(uploadedMeta);

            return (
              <div
                key={reqDoc.key}
                className={`flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors ${
                  isGiven
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">
                      {reqDoc.label}
                    </p>
                    {reqDoc.required && (
                      <span className="shrink-0 text-[10px] font-semibold text-rose-600">
                        *Required
                      </span>
                    )}
                  </div>
                  {reqDoc.note && (
                    <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                      {reqDoc.note}
                    </p>
                  )}
                  {uploadedMeta && (
                    <p className="mt-1 font-mono text-[10px] text-emerald-800">
                      File: {uploadedMeta.originalName} ({formatFileSize(uploadedMeta.sizeBytes)})
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {isGiven ? (
                    <>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                        Given
                      </span>
                      {uploadedMeta && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(uploadedMeta)}
                          className="rounded p-1 text-slate-600 hover:bg-emerald-100 hover:text-emerald-900"
                          title="Preview Document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      <XCircle className="h-3 w-3 text-slate-400" />
                      Not given
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
    <>
      <div className="space-y-4 print:hidden">
        {/* 1. TOP UTILITY BREADCRUMB BAR */}
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Submissions
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-mono font-bold text-slate-900">
              {detail.reference}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">
              Visa Intake Application Record
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-600">
              {formattedServerTime}
            </span>
          </div>
        </div>

        {/* 2. EXECUTIVE HERO HEADER CARD */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              {/* Left Column: Applicant Overview */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    title="Click to copy Reference Number"
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1 font-mono text-base font-bold text-blue-800 transition-colors hover:bg-blue-100 hover:border-blue-300"
                  >
                    <span>{detail.reference}</span>
                    {copiedRef ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-blue-500 group-hover:text-blue-700" />
                    )}
                  </button>

                  <StatusBadge status={detail.status} />
                  <ProfessionBadge profession={detail.profession} />

                  <OtpVerifiedBadge
                    verified={detail.otpVerified}
                    phone={detail.otpVerifiedPhone}
                  />

                  {detail.company && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-800">
                      <Building2 className="h-3 w-3" />
                      {detail.company.name} ({detail.company.prefix})
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {detail.applicantName}
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-emerald-700 font-bold">
                      {detail.countryName} (Visit Visa)
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-normal">
                      {detail.officialVisaName}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Submitted:{" "}
                      <strong>
                        {format(new Date(detail.createdAt), "dd MMM yyyy, HH:mm")}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Phone:{" "}
                      {detail.applicantPhone ? (
                        <a
                          href={`tel:${detail.applicantPhone}`}
                          className="font-mono font-semibold text-slate-900 hover:text-blue-600"
                        >
                          {detail.applicantPhone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>

                  {detail.applicantEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        Email:{" "}
                        <a
                          href={`mailto:${detail.applicantEmail}`}
                          className="font-semibold text-slate-900 hover:text-blue-600"
                        >
                          {detail.applicantEmail}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Status Change & Action Toolbar */}
              <div className="flex flex-col gap-3 lg:items-end">
                {/* Status Switcher Control */}
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-2">
                  <span className="text-xs font-bold text-slate-700 px-1">
                    Status:
                  </span>
                  <Select
                    value={selectedStatus}
                    onValueChange={(val) => setSelectedStatus(val as SubmissionStatus)}
                  >
                    <SelectTrigger className="h-8 w-36 bg-white text-xs font-semibold">
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
                    onClick={handleSaveStatus}
                    disabled={updateStatusMutation.isPending || selectedStatus === detail.status}
                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="mr-1 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      promptPdfDownload(
                        api.getAdminPdfUrl(detail.id),
                        `${detail.reference}.pdf`,
                      )
                    }
                    className="h-8 text-xs font-semibold hover:bg-slate-50"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5 text-slate-600" />
                    Official PDF
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="h-8 text-xs font-semibold hover:bg-slate-50"
                  >
                    <Printer className="mr-1.5 h-3.5 w-3.5 text-slate-600" />
                    Print
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="h-8 border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Vitals Bar */}
          {vitals && (
            <div className="border-t border-slate-100 bg-[#fbfcfd] px-4 py-3 sm:px-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Passport */}
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Passport Number
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

                {/* Travel */}
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Travel Itinerary
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {vitals.destinationCity}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {vitals.arrival ? formatDateYmdDisplay(vitals.arrival) : "Dates TBD"}
                    {vitals.durationDays ? ` • ${vitals.durationDays} Days` : ""}
                  </div>
                </div>

                {/* Demographics */}
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Demographics
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {vitals.gender ? `${vitals.gender} • ` : ""}
                    {vitals.maritalStatus || vitals.nationality}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    DOB: {vitals.dob ? formatDateYmdDisplay(vitals.dob) : "—"}
                  </div>
                </div>

                {/* Document Readiness */}
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Documents Readiness</span>
                    <span className="font-bold text-emerald-700">
                      {completenessPercent}%
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {detail.documents.length} Files Attached
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {uploadedRequiredCount} of {totalRequiredCount} Required Given
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. TABS NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 rounded-lg shadow-2xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                activeTab === "form"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Application Answers</span>
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
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
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
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
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
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                value={fieldSearchQuery}
                onChange={(e) => setFieldSearchQuery(e.target.value)}
                placeholder="Search within answers..."
                className="h-8 pl-8 pr-7 text-xs bg-slate-50 border-slate-200"
              />
              {fieldSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFieldSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. TAB CONTENTS */}

        {/* TAB 1: FORM ANSWERS */}
        {activeTab === "form" && (
          <div className="space-y-4">
            {/* Quick Section Anchors if multiple sections exist */}
            {filteredSections.length > 1 && !fieldSearchQuery && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                  Jump to:
                </span>
                {filteredSections.map((sec, idx) => (
                  <a
                    key={`nav-${sec.section}-${idx}`}
                    href={`#section-${idx}`}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <span>{sec.section}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      ({sec.fields.length})
                    </span>
                  </a>
                ))}
              </div>
            )}

            {filteredSections.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
                {fieldSearchQuery ? (
                  <div>
                    <p className="font-semibold text-slate-700">
                      No matching fields found for &ldquo;{fieldSearchQuery}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => setFieldSearchQuery("")}
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
              filteredSections.map((group, secIdx) => (
                <div
                  key={`sec-${group.section}-${secIdx}`}
                  id={`section-${secIdx}`}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs scroll-mt-20"
                >
                  {/* Section Title Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 bg-[#fafbfc] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 shadow-2xs">
                        {getSectionIcon(group.section)}
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        {group.section}
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                      {group.fields.length} {group.fields.length === 1 ? "field" : "fields"}
                    </span>
                  </div>

                  {/* Section Fields Grid */}
                  <div className="p-4">
                    {/* Special banner for No Formal Education */}
                    {group.section.toLowerCase().includes("education") &&
                      (String(detail.answers["has_no_education"] ?? "") === "yes" ||
                        String(detail.answers["has_no_education"] ?? "") === "true" ||
                        (detail.answers["has_no_education"] as unknown) === true) && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                          <GraduationCap className="h-4 w-4 text-amber-700 shrink-0" />
                          <div>
                            <strong>Educational Qualification:</strong> Applicant declared{" "}
                            <span className="font-bold underline">No Formal Education</span>.
                          </div>
                        </div>
                      )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {group.fields.map((field) => {
                        const val = detail.answers[field.key];
                        if (val === undefined || val === null || val === "") return null;
                        if (field.key === "has_no_education") return null;

                        // Render Table Answers
                        if (field.type === "table") {
                          const rows = (
                            Array.isArray(val) ? (val as TableRowValue[]) : []
                          ).filter(isTableRowNonEmpty);
                          const columns = getTableColumnsFromData(field.key, rows);

                          return (
                            <div
                              key={field.key}
                              className="col-span-full rounded-lg border border-slate-200 bg-slate-50/40 p-3.5"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">
                                  {field.subgroup
                                    ? `${field.subgroup} — ${field.label}`
                                    : field.label}
                                </span>
                                <span className="font-mono text-[11px] font-semibold text-slate-500">
                                  {rows.length} {rows.length === 1 ? "entry" : "entries"}
                                </span>
                              </div>

                              {rows.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">
                                  No records provided.
                                </p>
                              ) : (
                                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                      <tr>
                                        {columns.map((col) => (
                                          <th key={col.key} className="px-3.5 py-2.5">
                                            {col.label}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {rows.map((row, rIdx) => (
                                        <tr
                                          key={`${field.key}-r-${rIdx}`}
                                          className="hover:bg-slate-50/70"
                                        >
                                          {columns.map((col) => (
                                            <td
                                              key={col.key}
                                              className="px-3.5 py-2 text-slate-900 font-medium"
                                            >
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

                        // Scalar Fields (Text, Number, Date, Select)
                        const rawDisplay =
                          typeof val === "number"
                            ? String(val)
                            : typeof val === "string" && val.trim()
                              ? val.trim()
                              : typeof val === "boolean"
                                ? val
                                  ? "Yes"
                                  : "No"
                                : "";

                        const isDateField = field.type === "date" || field.key.includes("date");
                        const displayValue = rawDisplay
                          ? isDateField
                            ? formatDateYmdDisplay(rawDisplay)
                            : rawDisplay
                          : "—";

                        const isSecurityRefusal =
                          field.key.includes("refusal") || field.key.includes("deport");

                        return (
                          <div
                            key={field.key}
                            className={`rounded-lg border p-3 flex flex-col justify-between transition-colors ${
                              isSecurityRefusal && rawDisplay.toLowerCase() === "yes"
                                ? "border-rose-300 bg-rose-50/60"
                                : "border-slate-200 bg-slate-50/30 hover:bg-slate-50"
                            }`}
                          >
                            <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                              {field.subgroup
                                ? `${field.subgroup} • ${field.label}`
                                : field.label}
                            </dt>
                            <dd className="mt-1 text-xs font-bold text-slate-900 break-words">
                              {displayValue}
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
            {/* 1. Required Documents Checklist Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 bg-[#fafbfc] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 shadow-2xs">
                    <FileCheck className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Destination Visa Document Checklist
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Official document requirements for {detail.countryName} (
                      {detail.professionLabel} Category)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    {uploadedRequiredCount} / {totalRequiredCount} Uploaded ({completenessPercent}%)
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {totalRequiredCount === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No specific document checklist registered for this destination.
                  </p>
                ) : (
                  <>
                    {renderChecklistSection(
                      "Mandatory Documents",
                      detail.commonDocuments ?? [],
                    )}
                    {renderChecklistSection(
                      `${detail.professionLabel} Category Documents`,
                      detail.additionalDocuments ?? [],
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 2. Uploaded Documents Gallery Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 bg-[#fafbfc] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white border border-slate-200 shadow-2xs">
                    <FileText className="h-4 w-4 text-blue-700" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Uploaded Files ({detail.documents.length})
                  </h3>
                </div>
              </div>

              {detail.documents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No files were uploaded with this application.
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {detail.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition-shadow hover:shadow-xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              {doc.group}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {formatFileSize(doc.sizeBytes)}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {doc.label}
                          </h4>

                          <p className="font-mono text-[11px] text-slate-500 truncate" title={doc.originalName}>
                            {doc.originalName}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            {doc.mimeType} • Uploaded {format(new Date(doc.createdAt), "dd-MMM HH:mm")}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
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
            {/* Agency Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="border-b border-slate-200 bg-[#fafbfc] px-4 py-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-purple-700" />
                  <span>Processing Agency Assignment</span>
                </h3>
              </div>
              <div className="p-4 space-y-3 text-xs">
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
                      <span className="text-slate-500 font-medium">Agency Portal Slug:</span>
                      <span className="font-mono text-blue-600">/apply/{detail.company.slug}</span>
                    </div>
                    {detail.company.phone && (
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500 font-medium">Agency Phone:</span>
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
                      This application was submitted through the root public portal, assigned directly to the master desk.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit & System Info Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="border-b border-slate-200 bg-[#fafbfc] px-4 py-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span>Security & Verification Audit</span>
                </h3>
              </div>
              <div className="p-4 space-y-3 text-xs">
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
                  <span className="text-slate-500 font-medium">Submission Timestamp:</span>
                  <span className="font-mono text-slate-800">
                    {format(new Date(detail.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Last Status Update:</span>
                  <span className="font-mono text-slate-800">
                    {format(new Date(detail.updatedAt), "yyyy-MM-dd HH:mm:ss")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IN-APP DOCUMENT PREVIEW MODAL */}
      <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl p-0 overflow-hidden sm:rounded-2xl">
          <DialogHeader className="border-b border-slate-200 px-5 py-3.5 bg-slate-50">
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900">
                  {previewDoc?.label}
                </DialogTitle>
                <DialogDescription className="font-mono text-[11px] text-slate-500 mt-0.5">
                  {previewDoc?.originalName} &bull; {previewDoc ? formatFileSize(previewDoc.sizeBytes) : ""}
                </DialogDescription>
              </div>

              {previewDoc && (
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

          <div className="relative flex min-h-[400px] max-h-[70vh] items-center justify-center bg-slate-900/5 p-4 overflow-auto">
            {previewDoc && (
              previewDoc.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={api.getAdminDocumentUrl(detail.id, previewDoc.id, true)}
                  alt={previewDoc.label}
                  className="max-h-[65vh] w-auto max-w-full rounded-lg object-contain shadow-md"
                />
              ) : previewDoc.mimeType === "application/pdf" ? (
                <iframe
                  src={api.getAdminDocumentUrl(detail.id, previewDoc.id, true)}
                  title={previewDoc.label}
                  className="h-[65vh] w-full rounded-lg border border-slate-200 bg-white"
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
            This will download the official PDF document to your device.
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

      {/* PRINT SHEET COMPONENT */}
      <div className="hidden print:block">
        <PrintSheet detail={detail} />
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete submission{" "}
              <strong className="font-mono text-slate-900">{detail.reference}</strong> ({detail.applicantName})?
              This action cannot be undone and will delete all stored visa intake documents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-9 text-xs font-semibold"
            >
              {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
