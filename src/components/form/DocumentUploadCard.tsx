"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBanglaError } from "@/lib/error-messages";
import { validateClientPickedFile } from "@/lib/form-validation";
import { FormDocument, UploadedDocumentEntry } from "@/lib/types";

interface DocumentUploadCardProps {
  document: FormDocument;
  entry?: UploadedDocumentEntry;
  error?: string;
  onSelectFile: (docKey: string, entry: UploadedDocumentEntry) => void;
  onRemoveFile: (docKey: string) => void;
  onLocalError: (docKey: string, message: string | null) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DocumentUploadCard({
  document,
  entry,
  error,
  onSelectFile,
  onRemoveFile,
  onLocalError,
}: DocumentUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFilePicked = (file: File | undefined) => {
    if (!file) return;
    const validationErr = validateClientPickedFile(file);
    if (validationErr) {
      onLocalError(document.key, validationErr);
      toast.error(validationErr);
      return;
    }

    onLocalError(document.key, null);
    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
    onSelectFile(document.key, { file, previewUrl });
  };

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  return (
    <div
      id={`field-${document.key}`}
      tabIndex={-1}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        handleFilePicked(dropped);
      }}
      className={`rounded-xl border-2 bg-white p-4 transition-colors ${
        error
          ? "border-red-400 bg-red-50/30"
          : isDragging
            ? "border-blue-600 bg-blue-50"
            : entry
              ? "border-emerald-300 bg-emerald-50/20"
              : "border-slate-200"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFilePicked(e.target.files?.[0])}
      />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-base font-semibold leading-snug text-slate-900">
            {document.label}
            {document.required ? (
              <span className="ml-1 text-red-600" aria-label="required">
                *
              </span>
            ) : (
              <span className="ml-1.5 text-sm font-normal text-slate-500">
                (Optional)
              </span>
            )}
          </p>
          {document.note && (
            <p className="text-sm text-slate-600">{document.note}</p>
          )}
        </div>

        {document.required ? (
          <Badge
            variant="outline"
            className="shrink-0 border-amber-300 bg-amber-50 text-amber-900"
          >
            Must give
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="shrink-0 border-slate-200 bg-slate-50 text-slate-600"
          >
            Optional
          </Badge>
        )}
      </div>

      {entry ? (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-emerald-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {entry.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.previewUrl}
                alt={entry.file.name}
                className="h-14 w-14 shrink-0 rounded-md border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700">
                <FileText className="h-7 w-7" aria-hidden="true" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Ready to send</span>
              </div>
              <p className="truncate text-sm font-medium text-slate-900">
                {entry.file.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatFileSize(entry.file.size)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={openPicker}
              className="h-11 flex-1 border-slate-300 text-sm font-medium sm:flex-initial"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Replace
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onRemoveFile(document.key)}
              className="h-11 flex-1 border-red-200 text-sm font-medium text-red-700 hover:bg-red-50 sm:flex-initial"
            >
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={openPicker}
            className="h-12 w-full border-blue-300 bg-white text-base font-semibold text-blue-800 hover:bg-blue-50 sm:w-auto sm:px-6"
          >
            <Upload className="mr-2 h-5 w-5" aria-hidden="true" />
            Choose File (Photo or PDF)
          </Button>
          <p className="mt-2 text-xs text-slate-500">
            Or drag and drop here. Only PDF, JPG, or PNG — max 10 MB.
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="space-y-0.5">
            <p>{error}</p>
            {getBanglaError(error) && (
              <p className="text-xs font-normal text-red-800">{getBanglaError(error)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

