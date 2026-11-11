"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Printer,
  Save,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrintSheet } from "@/components/admin/PrintSheet";
import {
  ALL_SUBMISSION_STATUSES,
  StatusBadge,
  getStatusLabel,
} from "@/components/admin/StatusBadge";
import {
  useDeleteSubmission,
  useSubmissionDetail,
  useUpdateSubmissionStatus,
} from "@/hooks/useSubmissions";
import { ApiRequestError, api } from "@/lib/api";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { getTableColumns } from "@/lib/field-helpers";
import { isTableRowNonEmpty } from "@/lib/form-validation";
import { SubmissionStatus, TableRowValue } from "@/lib/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminSubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const { data: detail, isLoading, error } = useSubmissionDetail(id);
  const updateStatusMutation = useUpdateSubmissionStatus(id);
  const deleteMutation = useDeleteSubmission();

  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus>("NEW");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (detail?.status) {
      setSelectedStatus(detail.status);
    }
  }, [detail?.status]);

  const handleSaveStatus = async () => {
    try {
      await updateStatusMutation.mutateAsync(selectedStatus);
      toast.success("Application status saved.");
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Submission deleted.");
      router.replace("/admin/submissions");
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-base font-semibold text-red-800">
          {error instanceof ApiRequestError
            ? error.message
            : ERROR_MESSAGES.formNotFound}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/submissions">Back to Submissions</Link>
        </Button>
      </div>
    );
  }

  const uploadedDocKeys = new Set(detail.documents.map((d) => d.documentKey));

  return (
    <>
      {/* Screen view */}
      <div className="space-y-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/submissions">
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Back to Submissions
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={api.getAdminPdfUrl(detail.id)}>
                <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Download PDF
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.print()}
            >
              <Printer className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Print
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={api.getAdminZipUrl(detail.id)}>
                <Archive className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Download All Files (ZIP)
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>

        {/* Summary & Status Control */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-2xl font-extrabold text-blue-900">
                  {detail.reference}
                </h1>
                <StatusBadge status={detail.status} />
              </div>
              <p className="text-base font-semibold text-slate-900">
                {detail.applicantName} • {detail.countryName} (
                {detail.category.charAt(0).toUpperCase() + detail.category.slice(1)})
              </p>
              <p className="text-sm text-slate-600">{detail.officialVisaName}</p>
              <p className="text-xs text-slate-500">
                Submitted: {format(new Date(detail.createdAt), "dd MMM yyyy, HH:mm")} • Phone:{" "}
                {detail.applicantPhone || "—"}
                {detail.applicantEmail ? ` • Email: ${detail.applicantEmail}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val as SubmissionStatus)}
              >
                <SelectTrigger className="h-10 w-40 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_SUBMISSION_STATUSES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {getStatusLabel(st)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                onClick={handleSaveStatus}
                disabled={updateStatusMutation.isPending}
                className="h-10 bg-blue-700 hover:bg-blue-800"
              >
                <Save className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {updateStatusMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FileText className="h-4 w-4 text-blue-700" aria-hidden="true" />
              Uploaded Documents ({detail.documents.length})
            </h2>
          </div>

          {detail.documents.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">
              No files uploaded with this submission.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {detail.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {doc.label}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {doc.originalName} • {formatFileSize(doc.sizeBytes)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="h-9">
                      <a
                        href={api.getAdminDocumentUrl(detail.id, doc.id, true)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        View
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="h-9">
                      <a href={api.getAdminDocumentUrl(detail.id, doc.id, false)}>
                        <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full Checklist Status */}
          <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Document Checklist
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {detail.requiredDocuments.map((reqDoc) => {
                const given = uploadedDocKeys.has(reqDoc.key);
                return (
                  <div
                    key={reqDoc.key}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                  >
                    <span className="truncate text-slate-800">{reqDoc.label}</span>
                    {given ? (
                      <Badge className="shrink-0 bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                        Given
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-slate-200 text-slate-500"
                      >
                        <XCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                        Not given
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Answers Grouped by Section */}
        <div className="space-y-4">
          {detail.sections.map((group) => {
            const hasAnyAnswer = group.fields.some((f) => {
              const val = detail.answers[f.key];
              if (f.type === "table") {
                return (
                  Array.isArray(val) &&
                  (val as TableRowValue[]).some(isTableRowNonEmpty)
                );
              }
              if (typeof val === "number") return Number.isFinite(val);
              return typeof val === "string" && val.trim().length > 0;
            });

            if (!hasAnyAnswer) return null;

            return (
              <div
                key={group.section}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                  <h2 className="text-base font-bold text-slate-900">
                    {group.section}
                  </h2>
                </div>

                <div className="divide-y divide-slate-100 px-5">
                  {group.fields.map((field) => {
                    const val = detail.answers[field.key];

                    if (field.type === "table") {
                      const columns = getTableColumns(field.key);
                      const rows = Array.isArray(val)
                        ? (val as TableRowValue[]).filter(isTableRowNonEmpty)
                        : [];

                      return (
                        <div key={field.key} className="py-3.5">
                          <p className="mb-2 text-sm font-semibold text-slate-700">
                            {field.label}
                          </p>
                          {rows.length === 0 ? (
                            <p className="text-sm text-slate-400">—</p>
                          ) : (
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs font-semibold text-slate-700">
                                  <tr>
                                    {columns.map((col) => (
                                      <th key={col.key} className="px-3 py-2">
                                        {col.label}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {rows.map((row, idx) => (
                                    <tr key={`${field.key}-row-${idx}`}>
                                      {columns.map((col) => (
                                        <td key={col.key} className="px-3 py-2 text-slate-900">
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

                    const displayValue =
                      typeof val === "number"
                        ? String(val)
                        : typeof val === "string" && val.trim()
                          ? val.trim()
                          : "—";

                    return (
                      <div
                        key={field.key}
                        className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                      >
                        <span className="text-sm font-medium text-slate-600 sm:w-5/12">
                          {field.label}
                        </span>
                        <span className="whitespace-pre-wrap text-sm font-medium text-slate-900 sm:w-7/12">
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean White Print Layout */}
      <PrintSheet detail={detail} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {detail.reference}?</DialogTitle>
            <DialogDescription>
              This will permanently remove this application and all uploaded files from the server. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

