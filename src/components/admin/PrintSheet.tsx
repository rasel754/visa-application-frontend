"use client";

import { format } from "date-fns";
import { getTableColumns } from "@/lib/field-helpers";
import { isTableRowNonEmpty } from "@/lib/form-validation";
import { SubmissionDetail, TableRowValue } from "@/lib/types";

interface PrintSheetProps {
  detail: SubmissionDetail;
}

export function PrintSheet({ detail }: PrintSheetProps) {
  const uploadedDocKeys = new Set(detail.documents.map((d) => d.documentKey));

  const formatCategory = (cat: string) =>
    cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : "";

  return (
    <div className="hidden bg-white text-black print:block">
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-3">
        <h1 className="text-2xl font-bold text-black">IGL Visa Help</h1>
        <p className="text-sm text-slate-700">Visa Application Form</p>
      </div>

      {/* Info Box */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded border border-slate-300 bg-slate-50 p-3 text-sm">
        <div>
          <span className="font-semibold">Submission No.: </span>
          <span>{detail.reference}</span>
        </div>
        <div>
          <span className="font-semibold">Date Submitted: </span>
          <span>{format(new Date(detail.createdAt), "dd MMM yyyy, HH:mm")}</span>
        </div>
        <div>
          <span className="font-semibold">Country: </span>
          <span>{detail.countryName}</span>
        </div>
        <div>
          <span className="font-semibold">Visa Type: </span>
          <span>{formatCategory(detail.category)}</span>
        </div>
        <div className="col-span-2">
          <span className="font-semibold">Official Visa Name: </span>
          <span>{detail.officialVisaName}</span>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-5 space-y-5">
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
            <div key={group.section} className="break-inside-avoid-page">
              <div className="border border-slate-300 bg-slate-200 px-3 py-1.5 text-sm font-bold text-black">
                {group.section}
              </div>

              <div className="divide-y divide-slate-200 border-x border-b border-slate-300">
                {group.fields.map((field) => {
                  const val = detail.answers[field.key];
                  if (field.type === "table") {
                    const columns = getTableColumns(field.key);
                    const rows = Array.isArray(val)
                      ? (val as TableRowValue[]).filter(isTableRowNonEmpty)
                      : [];
                    return (
                      <div key={field.key} className="p-2.5 text-xs">
                        <p className="mb-1.5 font-semibold text-black">
                          {field.label}
                        </p>
                        {rows.length === 0 ? (
                          <p className="text-slate-600">—</p>
                        ) : (
                          <table className="w-full border-collapse border border-slate-300 text-xs">
                            <thead>
                              <tr className="bg-slate-100">
                                {columns.map((col) => (
                                  <th
                                    key={col.key}
                                    className="border border-slate-300 px-2 py-1 text-left font-semibold"
                                  >
                                    {col.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, idx) => (
                                <tr key={`${field.key}-p-${idx}`}>
                                  {columns.map((col) => (
                                    <td
                                      key={col.key}
                                      className="border border-slate-300 px-2 py-1"
                                    >
                                      {row[col.key]?.trim() || "—"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  }

                  const textVal =
                    typeof val === "number"
                      ? String(val)
                      : typeof val === "string" && val.trim()
                        ? val.trim()
                        : "—";

                  return (
                    <div
                      key={field.key}
                      className="grid grid-cols-12 gap-3 px-2.5 py-1.5 text-xs"
                    >
                      <span className="col-span-5 font-semibold text-slate-800">
                        {field.label}:
                      </span>
                      <span className="col-span-7 whitespace-pre-wrap text-black">
                        {textVal}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Documents Checklist */}
        <div className="break-inside-avoid-page">
          <div className="border border-slate-300 bg-slate-200 px-3 py-1.5 text-sm font-bold text-black">
            Documents Checklist
          </div>
          <div className="divide-y divide-slate-200 border-x border-b border-slate-300">
            {detail.requiredDocuments.map((doc) => {
              const given = uploadedDocKeys.has(doc.key);
              return (
                <div
                  key={doc.key}
                  className="flex items-center justify-between gap-4 px-2.5 py-1.5 text-xs"
                >
                  <span>{doc.label}</span>
                  <span className="font-semibold">
                    {given ? "Given" : "Not given"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-6 border-t border-slate-300 pt-2 text-center text-xs text-slate-600">
        IGL Visa Help — This form was filled online by the applicant.
      </p>
    </div>
  );
}

