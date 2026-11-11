"use client";

import { AlertCircle, Plus, Trash2 } from "lucide-react";
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
import {
  getFieldHelpText,
  getFieldPlaceholder,
  getSelectOptions,
  getTableColumns,
} from "@/lib/field-helpers";
import { AnswerValue, FormField, TableRowValue } from "@/lib/types";

interface DynamicFieldProps {
  field: FormField;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (value: AnswerValue) => void;
}

export function DynamicField({
  field,
  value,
  error,
  onChange,
}: DynamicFieldProps) {
  const inputId = `field-${field.key}`;
  const placeholder = getFieldPlaceholder(field);
  const helpText = getFieldHelpText(field);
  const selectOptions =
    field.type === "select" ? getSelectOptions(field.key) : null;

  const stringValue =
    typeof value === "string"
      ? value
      : typeof value === "number"
        ? String(value)
        : "";

  const renderControl = () => {
    if (field.type === "textarea") {
      return (
        <Textarea
          id={inputId}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`min-h-24 bg-white text-base leading-relaxed placeholder:text-slate-400 ${
            error ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
          }`}
        />
      );
    }

    if (field.type === "select" && selectOptions) {
      return (
        <Select
          value={stringValue}
          onValueChange={(nextVal) => onChange(nextVal)}
        >
          <SelectTrigger
            id={inputId}
            aria-invalid={Boolean(error)}
            className={`min-h-12 w-full bg-white text-base ${
              error ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
            }`}
          >
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem key={option} value={option} className="min-h-10 text-base">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "table") {
      const columns = getTableColumns(field.key);
      const rows: TableRowValue[] =
        Array.isArray(value) && value.length > 0
          ? (value as TableRowValue[])
          : [
              Object.fromEntries(columns.map((c) => [c.key, ""])),
            ];

      const updateCell = (rowIndex: number, colKey: string, cellValue: string) => {
        const nextRows = rows.map((row, idx) =>
          idx === rowIndex ? { ...row, [colKey]: cellValue } : row,
        );
        onChange(nextRows);
      };

      const addRow = () => {
        const emptyRow = Object.fromEntries(columns.map((c) => [c.key, ""]));
        onChange([...rows, emptyRow]);
      };

      const removeRow = (rowIndex: number) => {
        if (rows.length <= 1 && field.required) {
          onChange([Object.fromEntries(columns.map((c) => [c.key, ""]))]);
          return;
        }
        const nextRows = rows.filter((_, idx) => idx !== rowIndex);
        onChange(nextRows);
      };

      return (
        <div id={inputId} tabIndex={-1} className="space-y-3">
          {rows.map((row, rowIndex) => (
            <div
              key={`${field.key}-row-${rowIndex}`}
              className={`rounded-xl border bg-slate-50/70 p-3.5 ${
                error ? "border-red-400" : "border-slate-200"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Row {rowIndex + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(rowIndex)}
                  className="h-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Remove Row
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {columns.map((col) => (
                  <div key={col.key} className="space-y-1.5">
                    <Label
                      htmlFor={`${inputId}-${rowIndex}-${col.key}`}
                      className="text-sm font-medium text-slate-700"
                    >
                      {col.label}
                    </Label>
                    <Input
                      id={`${inputId}-${rowIndex}-${col.key}`}
                      type="text"
                      value={row[col.key] ?? ""}
                      onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                      placeholder={col.placeholder}
                      className="h-12 border-slate-300 bg-white text-base placeholder:text-slate-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            className="h-11 border-blue-300 text-base font-medium text-blue-800 hover:bg-blue-50"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Row
          </Button>
        </div>
      );
    }

    const htmlInputType =
      field.type === "select"
        ? "text"
        : field.type === "number"
          ? "number"
          : field.type;

    return (
      <Input
        id={inputId}
        type={htmlInputType}
        value={stringValue}
        min={field.type === "number" ? 0 : undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`h-12 bg-white text-base placeholder:text-slate-400 ${
          error ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
        }`}
      />
    );
  };

  return (
    <div className="space-y-2">
      <Label
        htmlFor={inputId}
        className="block text-base font-semibold leading-snug text-slate-900"
      >
        {field.label}
        {field.required ? (
          <span className="ml-1 text-red-600" aria-label="required">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-sm font-normal text-slate-500">
            (Optional)
          </span>
        )}
      </Label>

      {renderControl()}

      {helpText && !error && (
        <p className="text-sm text-slate-600">{helpText}</p>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

