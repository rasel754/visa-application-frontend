"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/lib/types";
import { mapExtractedDataToForm } from "@/lib/ocr/fieldMapper";
import { ExtractedDocumentData, OCRConfidence } from "@/lib/ocr/types";
import { FieldMetaItem } from "@/store/intake-store";

interface ScanSummaryDrawerProps {
  isOpen: boolean;
  extracted: ExtractedDocumentData | null;
  cleanFile: File | null;
  cleanBackFile?: File | null;
  availableFields: FormField[];
  onApply: (
    answers: Record<string, string>,
    fieldMeta: Record<string, FieldMetaItem>,
    files: { passport?: File; nidFront?: File; nidBack?: File },
  ) => void;
  onDiscard: () => void;
}

export function ScanSummaryDrawer({
  isOpen,
  extracted,
  cleanFile,
  cleanBackFile,
  availableFields,
  onApply,
  onDiscard,
}: ScanSummaryDrawerProps) {
  const [formData, setFormData] = useState<Partial<ExtractedDocumentData>>({});
  const [fieldConfidence, setFieldConfidence] = useState<
    Record<string, OCRConfidence>
  >({});

  useEffect(() => {
    if (extracted) {
      setFormData({
        surname: extracted.surname ?? "",
        given_names: extracted.given_names ?? "",
        full_name: extracted.full_name ?? "",
        passport_number: extracted.passport_number ?? "",
        nid_number: extracted.nid_number ?? "",
        date_of_birth: extracted.date_of_birth ?? "",
        gender: extracted.gender,
        passport_expiry_date: extracted.passport_expiry_date ?? "",
        present_address: extracted.present_address ?? "",
        permanent_address: extracted.permanent_address ?? "",
      });

      const conf = extracted.confidence;
      setFieldConfidence({
        surname: conf,
        given_names: conf,
        full_name: conf,
        passport_number: conf,
        nid_number: conf,
        date_of_birth: conf,
        gender: conf,
        passport_expiry_date: conf,
        present_address: "low",
        permanent_address: "low",
      });
    }
  }, [extracted]);

  if (!isOpen || !extracted) return null;

  const handleFieldChange = (key: keyof ExtractedDocumentData, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    // When manually edited in drawer, treat confidence as high verified
    setFieldConfidence((prev) => ({ ...prev, [key]: "high" }));
  };

  const handleConfirm = () => {
    // Reconstruct updated extracted data
    const updated: ExtractedDocumentData = {
      ...extracted,
      surname: formData.surname || undefined,
      given_names: formData.given_names || undefined,
      full_name: formData.full_name || undefined,
      passport_number: formData.passport_number || undefined,
      nid_number: formData.nid_number || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      gender: formData.gender,
      passport_expiry_date: formData.passport_expiry_date || undefined,
      present_address: formData.present_address || undefined,
      permanent_address: formData.permanent_address || undefined,
    };

    const { answers, fieldMeta } = mapExtractedDataToForm(updated, availableFields);

    const files: { passport?: File; nidFront?: File; nidBack?: File } = {};
    if (cleanFile) {
      if (extracted.documentType === "passport") {
        files.passport = cleanFile;
      } else {
        files.nidFront = cleanFile;
        if (cleanBackFile) files.nidBack = cleanBackFile;
      }
    }

    onApply(answers, fieldMeta, files);
  };

  const isPassport = extracted.documentType === "passport";

  const renderConfidenceBadge = (key: string, val: string | undefined | null) => {
    if (!val) return null;
    const isLow = fieldConfidence[key] === "low";
    return (
      <Badge
        variant="outline"
        className={`text-[10px] ${
          isLow
            ? "border-amber-300 bg-amber-50 text-amber-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        {isLow ? "Auto-filled • Verify spelling" : "Auto-filled"}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Scan Summary &amp; Review
              </h3>
              <p className="text-xs text-slate-500">
                {isPassport ? "Bangladeshi Passport (e-Passport / MRP)" : "Bangladeshi National ID Card (NID)"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDiscard}
            className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-200/60"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Warnings alert if any */}
        {extracted.warnings && extracted.warnings.length > 0 && (
          <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              {extracted.warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          </div>
        )}

        {/* Editable Fields Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <p className="text-xs text-slate-500">
            Please review the auto-extracted details below. You can edit any field now or adjust it later in the form.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Surname */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Surname</Label>
                {renderConfidenceBadge("surname", formData.surname)}
              </div>
              <Input
                value={formData.surname || ""}
                onChange={(e) => handleFieldChange("surname", e.target.value.toUpperCase())}
                placeholder="RAHMAN"
                className="h-11 uppercase"
              />
            </div>

            {/* Given Names */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Given Name(s)</Label>
                {renderConfidenceBadge("given_names", formData.given_names)}
              </div>
              <Input
                value={formData.given_names || ""}
                onChange={(e) => handleFieldChange("given_names", e.target.value.toUpperCase())}
                placeholder="MOHAMMAD ARIF"
                className="h-11 uppercase"
              />
            </div>

            {/* Passport Number (if passport) */}
            {isPassport && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">Passport Number</Label>
                  {renderConfidenceBadge("passport_number", formData.passport_number)}
                </div>
                <Input
                  value={formData.passport_number || ""}
                  onChange={(e) => handleFieldChange("passport_number", e.target.value.toUpperCase())}
                  placeholder="A01234567"
                  className="h-11 uppercase font-mono"
                />
              </div>
            )}

            {/* National ID Number */}
            {(formData.nid_number || !isPassport) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">National ID (NID)</Label>
                  {renderConfidenceBadge("nid_number", formData.nid_number)}
                </div>
                <Input
                  value={formData.nid_number || ""}
                  onChange={(e) => handleFieldChange("nid_number", e.target.value.replace(/\D/g, ""))}
                  placeholder="10, 13, or 17 digit NID"
                  className="h-11 font-mono"
                />
              </div>
            )}

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Date of Birth (YYYY-MM-DD)</Label>
                {renderConfidenceBadge("date_of_birth", formData.date_of_birth)}
              </div>
              <Input
                type="text"
                value={formData.date_of_birth || ""}
                onChange={(e) => handleFieldChange("date_of_birth", e.target.value)}
                placeholder="1995-08-15"
                className="h-11 font-mono"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Gender / Sex</Label>
                {renderConfidenceBadge("gender", formData.gender)}
              </div>
              <Select
                value={formData.gender || ""}
                onValueChange={(val) => handleFieldChange("gender", val)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Passport Expiry Date (if passport) */}
            {isPassport && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">Passport Expiry Date</Label>
                  {renderConfidenceBadge("passport_expiry_date", formData.passport_expiry_date)}
                </div>
                <Input
                  type="text"
                  value={formData.passport_expiry_date || ""}
                  onChange={(e) => handleFieldChange("passport_expiry_date", e.target.value)}
                  placeholder="2032-05-20"
                  className="h-11 font-mono"
                />
              </div>
            )}
          </div>

          {/* Transliterated Address Fields (if present) */}
          {(formData.present_address || !isPassport) && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Home / Present Address
                  </Label>
                  {renderConfidenceBadge("present_address", formData.present_address)}
                </div>
                <Textarea
                  rows={2}
                  value={formData.present_address || ""}
                  onChange={(e) => handleFieldChange("present_address", e.target.value)}
                  placeholder="House, Road, Village/Area, Thana, District"
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
            className="h-11 rounded-xl text-slate-600 hover:bg-slate-200/50"
          >
            Discard
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 font-bold text-white shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-800"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Apply to Application
          </Button>
        </div>
      </div>
    </div>
  );
}
