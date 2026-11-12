"use client";

import * as React from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  DateFieldMode,
  DatePicker,
  formatLocalDateToYmd,
  parseYmdToLocalDate,
} from "@/components/ui/date-picker";
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
  extractBdMobileLocalPart,
  isBdMobileKey,
  isTuitionKey,
  shouldUppercaseField,
} from "@/lib/bd-validation";
import { getBanglaError } from "@/lib/error-messages";
import {
  getFieldHelpText,
  getFieldPlaceholder,
  getSelectOptions,
  getTableColumns,
} from "@/lib/field-helpers";
import { AnswerValue, FormAnswers, FormField, TableRowValue } from "@/lib/types";

interface DynamicFieldProps {
  field: FormField;
  value: AnswerValue | undefined;
  allAnswers: FormAnswers;
  error?: string;
  onChange: (value: AnswerValue) => void;
  onBlurValidate?: () => void;
}

const STRICT_PAST_DATE_KEYS = new Set(["date_of_birth", "passport_issue_date"]);
const PAST_OR_TODAY_DATE_KEYS = new Set([
  "fathers_date_of_birth",
  "mothers_date_of_birth",
  "spouse_date_of_birth",
  "business_start_date",
  "date_of_joining",
  "employment_start_date",
]);
const FUTURE_DATE_KEYS = new Set([
  "intended_arrival_date",
  "intended_departure_date",
  "passport_expiry_date",
  "expected_completion_date",
  "course_start_date",
  "course_end_date",
]);

function getDateModeForField(fieldKey: string): DateFieldMode {
  if (STRICT_PAST_DATE_KEYS.has(fieldKey)) return "past";
  if (PAST_OR_TODAY_DATE_KEYS.has(fieldKey)) return "past-or-today";
  if (FUTURE_DATE_KEYS.has(fieldKey)) return "future";
  return "any";
}

function getDefaultFocusYear(fieldKey: string): number | undefined {
  if (fieldKey === "date_of_birth" || fieldKey === "spouse_date_of_birth") {
    return 1995;
  }
  if (fieldKey === "fathers_date_of_birth" || fieldKey === "mothers_date_of_birth") {
    return 1965;
  }
  return undefined;
}

function preserveCursorUppercase(
  target: HTMLInputElement | HTMLTextAreaElement,
  nextRaw: string,
  emit: (upper: string) => void,
) {
  const start = target.selectionStart;
  const end = target.selectionEnd;
  const upper = nextRaw.toUpperCase();
  emit(upper);
  window.requestAnimationFrame(() => {
    if (document.activeElement === target && start !== null && end !== null) {
      try {
        target.setSelectionRange(start, end);
      } catch {
        // Ignore non-selectable input types
      }
    }
  });
}

export function DynamicField({
  field,
  value,
  allAnswers,
  error,
  onChange,
  onBlurValidate,
}: DynamicFieldProps) {
  const inputId = `field-${field.key}`;
  const placeholder = getFieldPlaceholder(field);
  const helpText = getFieldHelpText(field);
  const selectOptions = field.type === "select" ? getSelectOptions(field.key) : null;
  const banglaError = getBanglaError(error);

  const stringValue =
    typeof value === "string"
      ? value
      : typeof value === "number"
        ? String(value)
        : "";

  const renderControl = () => {
    // 1. Date fields -> Popover + Calendar DatePicker (DD MMM YYYY display, ISO YYYY-MM-DD stored)
    if (field.type === "date") {
      const mode = getDateModeForField(field.key);
      let minDateYmd: string | undefined;
      if (field.key === "intended_departure_date") {
        const arrival =
          typeof allAnswers["intended_arrival_date"] === "string"
            ? allAnswers["intended_arrival_date"]
            : "";
        const parsedArrival = parseYmdToLocalDate(arrival);
        if (parsedArrival) {
          const dayAfter = new Date(
            parsedArrival.getFullYear(),
            parsedArrival.getMonth(),
            parsedArrival.getDate() + 1,
          );
          minDateYmd = formatLocalDateToYmd(dayAfter);
        }
      }

      return (
        <DatePicker
          id={inputId}
          value={stringValue}
          onChange={(ymd) => onChange(ymd)}
          onBlur={onBlurValidate}
          placeholder={placeholder}
          mode={mode}
          minDateYmd={minDateYmd}
          defaultFocusYear={getDefaultFocusYear(field.key)}
          invalid={Boolean(error)}
          allowClear={!field.required}
        />
      );
    }

    // 2. Bangladeshi mobile fields (phone_primary, phone_secondary) -> fixed +88 prefix
    if (isBdMobileKey(field.key)) {
      const localDigits = extractBdMobileLocalPart(stringValue);

      const handleBdPhoneChange = (raw: string) => {
        let digitsOnly = raw.replace(/\D/g, "");
        if (digitsOnly.startsWith("8801") && digitsOnly.length >= 13) {
          digitsOnly = digitsOnly.slice(2);
        }
        onChange(digitsOnly ? `+88${digitsOnly}` : "");
      };

      return (
        <div
          className={`flex h-12 w-full overflow-hidden rounded-lg border bg-white ${
            error
              ? "border-red-500 ring-1 ring-red-500"
              : "border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20"
          }`}
        >
          <span
            className="flex shrink-0 items-center border-r border-slate-300 bg-slate-100 px-3.5 text-base font-bold text-slate-800 select-none"
            aria-hidden="true"
          >
            +88
          </span>
          <input
            id={inputId}
            type="tel"
            inputMode="numeric"
            value={localDigits}
            onChange={(e) => handleBdPhoneChange(e.target.value)}
            onBlur={onBlurValidate}
            onKeyDown={(e) => {
              if (
                e.key.length === 1 &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.altKey &&
                !/^\d$/.test(e.key)
              ) {
                e.preventDefault();
              }
            }}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            className="h-full w-full bg-white px-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>
      );
    }

    // 3. Tuition fee fields -> digits ONLY (reject typing non-digits in input itself)
    if (isTuitionKey(field.key)) {
      return (
        <Input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={stringValue}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, "");
            onChange(digitsOnly);
          }}
          onBlur={onBlurValidate}
          onKeyDown={(e) => {
            if (
              e.key.length === 1 &&
              !e.ctrlKey &&
              !e.metaKey &&
              !e.altKey &&
              !/^\d$/.test(e.key)
            ) {
              e.preventDefault();
            }
          }}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`h-12 bg-white text-base placeholder:text-slate-400 ${
            error ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
          }`}
        />
      );
    }

    // 4. Textarea -> UPPERCASE automatically
    if (field.type === "textarea") {
      const uppercase = shouldUppercaseField(field);
      return (
        <Textarea
          id={inputId}
          value={stringValue}
          onChange={(e) => {
            if (uppercase) {
              preserveCursorUppercase(e.target, e.target.value, (u) => onChange(u));
            } else {
              onChange(e.target.value);
            }
          }}
          onBlur={onBlurValidate}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`min-h-24 bg-white text-base leading-relaxed placeholder:text-slate-400 ${
            uppercase ? "uppercase placeholder:normal-case" : ""
          } ${error ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"}`}
        />
      );
    }

    // 5. Select -> Combobox if > 10 options, else shadcn Select
    if (field.type === "select" && selectOptions) {
      if (selectOptions.length > 10) {
        return (
          <Combobox
            id={inputId}
            options={selectOptions.map((opt) => ({ value: opt, label: opt }))}
            value={stringValue}
            onValueChange={(nextVal) => onChange(nextVal)}
            onBlur={onBlurValidate}
            placeholder="Choose an option"
            searchPlaceholder="Type to search options..."
            invalid={Boolean(error)}
          />
        );
      }

      return (
        <Select
          value={stringValue}
          onValueChange={(nextVal) => {
            onChange(nextVal);
          }}
        >
          <SelectTrigger
            id={inputId}
            aria-invalid={Boolean(error)}
            onBlur={onBlurValidate}
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

    // 6. Table (legacy fallback if ever present)
    if (field.type === "table") {
      const columns = getTableColumns(field.key);
      const rows: TableRowValue[] =
        Array.isArray(value) && value.length > 0
          ? (value as TableRowValue[])
          : [Object.fromEntries(columns.map((c) => [c.key, ""]))];

      const updateCell = (rowIndex: number, colKey: string, cellValue: string) => {
        const nextRows = rows.map((row, idx) =>
          idx === rowIndex ? { ...row, [colKey]: cellValue.toUpperCase() } : row,
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
                      onBlur={onBlurValidate}
                      placeholder={col.placeholder}
                      className="h-12 border-slate-300 bg-white text-base uppercase placeholder:normal-case placeholder:text-slate-400"
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

    // 7. Standard inputs (text, email, tel, number)
    const isNumericDigitsField =
      field.key === "national_id_number" || field.key === "tin_number";
    const uppercase = shouldUppercaseField(field) || field.key === "passport_number";
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
        inputMode={isNumericDigitsField ? "numeric" : undefined}
        value={stringValue}
        min={field.type === "number" ? 0 : undefined}
        onChange={(e) => {
          if (uppercase) {
            preserveCursorUppercase(e.target, e.target.value, (u) => onChange(u));
          } else {
            onChange(e.target.value);
          }
        }}
        onBlur={onBlurValidate}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`h-12 bg-white text-base placeholder:text-slate-400 ${
          uppercase ? "uppercase placeholder:normal-case" : ""
        } ${error ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"}`}
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

      {helpText && !error && <p className="text-sm text-slate-600">{helpText}</p>}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="space-y-0.5">
            <p>{error}</p>
            {banglaError && (
              <p className="text-xs font-normal text-red-800">{banglaError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
