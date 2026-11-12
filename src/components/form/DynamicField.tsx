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
  getFieldMaxLength,
  isBdMobileKey,
  isNoNumberFieldKey,
  isTuitionKey,
  shouldUppercaseField,
} from "@/lib/bd-validation";
import { localizeErrorMessage } from "@/lib/error-messages";
import {
  getFieldHelpText,
  getFieldPlaceholder,
  getLocalizedFieldLabel,
  getLocalizedSelectOptions,
  getTableColumns,
} from "@/lib/field-helpers";
import { normalizeBengaliDigits } from "@/lib/i18n/bangla-data";
import { getUiStrings } from "@/lib/i18n/translations";
import { AnswerValue, FormAnswers, FormField, TableRowValue } from "@/lib/types";
import { useLanguageStore } from "@/store/language-store";

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

function isDigitKeystroke(key: string): boolean {
  return /^[\d\u09E6-\u09EF]$/.test(key);
}

function isAllowedTelKeystroke(key: string): boolean {
  return /^[\d\u09E6-\u09EF+\-\s()]$/.test(key);
}

function applySanitizedValue(
  target: HTMLInputElement | HTMLTextAreaElement,
  rawValue: string,
  sanitize: (val: string) => string,
  emit: (cleaned: string) => void,
) {
  const start = target.selectionStart;
  const end = target.selectionEnd;
  const cleaned = sanitize(rawValue);
  const nextStart =
    start !== null ? sanitize(rawValue.slice(0, start)).length : null;
  const nextEnd = end !== null ? sanitize(rawValue.slice(0, end)).length : null;
  emit(cleaned);
  window.requestAnimationFrame(() => {
    if (
      document.activeElement === target &&
      nextStart !== null &&
      nextEnd !== null
    ) {
      try {
        target.setSelectionRange(nextStart, nextEnd);
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
  const language = useLanguageStore((s) => s.language);
  const t = getUiStrings(language);

  const inputId = `field-${field.key}`;
  const maxLength = getFieldMaxLength(field);
  const disallowNumbers = isNoNumberFieldKey(field.key);
  const localizedLabel = getLocalizedFieldLabel(field, language);
  const placeholder = getFieldPlaceholder(field, language);
  const helpText = getFieldHelpText(field, language);
  const selectOptions =
    field.type === "select"
      ? getLocalizedSelectOptions(field.key, language)
      : null;
  const localizedError = error
    ? localizeErrorMessage(error, language, localizedLabel)
    : "";

  const stringValue =
    typeof value === "string"
      ? value
      : typeof value === "number"
        ? String(value)
        : "";

  const renderControl = () => {
    // 1. Date fields -> Popover + Calendar DatePicker (ISO YYYY-MM-DD stored)
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
          language={language}
        />
      );
    }

    // 2. Bangladeshi mobile fields (phone_primary, phone_secondary) -> fixed +88 prefix
    if (isBdMobileKey(field.key)) {
      const localDigits = extractBdMobileLocalPart(stringValue);

      const handleBdPhoneChange = (raw: string) => {
        let digitsOnly = normalizeBengaliDigits(raw).replace(/\D/g, "");
        if (digitsOnly.startsWith("8801") && digitsOnly.length >= 13) {
          digitsOnly = digitsOnly.slice(2);
        }
        digitsOnly = digitsOnly.slice(0, 11);
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
                !isDigitKeystroke(e.key)
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
            const digitsOnly = normalizeBengaliDigits(e.target.value).replace(
              /\D/g,
              "",
            );
            onChange(digitsOnly);
          }}
          onBlur={onBlurValidate}
          onKeyDown={(e) => {
            if (
              e.key.length === 1 &&
              !e.ctrlKey &&
              !e.metaKey &&
              !e.altKey &&
              !isDigitKeystroke(e.key)
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
          maxLength={maxLength}
          onChange={(e) => {
            applySanitizedValue(
              e.target,
              e.target.value,
              (val) => {
                let next = uppercase ? val.toUpperCase() : val;
                if (maxLength !== undefined) {
                  next = next.slice(0, maxLength);
                }
                return next;
              },
              (cleaned) => onChange(cleaned),
            );
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
      const selectPlaceholder =
        language === "bn" ? placeholder : t.chooseOptionPlaceholder;

      if (selectOptions.length > 10) {
        return (
          <Combobox
            id={inputId}
            options={selectOptions}
            value={stringValue}
            onValueChange={(nextVal) => onChange(nextVal)}
            onBlur={onBlurValidate}
            placeholder={selectPlaceholder}
            searchPlaceholder={t.searchOptionsPlaceholder}
            emptyText={t.noOptionsFound}
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
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="min-h-10 text-base"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // 6. Table (legacy fallback if ever present)
    if (field.type === "table") {
      const columns = getTableColumns(field.key, language);
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
                  {t.dynamicField.rowTitle(rowIndex + 1)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(rowIndex)}
                  className="h-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  {t.dynamicField.removeRow}
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
            {t.dynamicField.addRow}
          </Button>
        </div>
      );
    }

    // 7. Number fields -> allow English or Bengali digits, normalize to ASCII digits
    if (field.type === "number") {
      return (
        <Input
          id={inputId}
          type="text"
          inputMode="numeric"
          maxLength={maxLength}
          value={stringValue}
          onChange={(e) => {
            let digitsOnly = normalizeBengaliDigits(e.target.value).replace(
              /\D/g,
              "",
            );
            if (maxLength !== undefined) {
              digitsOnly = digitsOnly.slice(0, maxLength);
            }
            onChange(digitsOnly);
          }}
          onBlur={onBlurValidate}
          onKeyDown={(e) => {
            if (
              e.key.length === 1 &&
              !e.ctrlKey &&
              !e.metaKey &&
              !e.altKey &&
              !isDigitKeystroke(e.key)
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

    // 8. Standard inputs (text, email, tel)
    const isNumericDigitsField =
      field.key === "national_id_number" || field.key === "tin_number";
    const isPassportField = field.key === "passport_number";
    const isTelField = field.type === "tel";
    const uppercase = shouldUppercaseField(field) || isPassportField;
    const htmlInputType = field.type === "select" ? "text" : field.type;

    return (
      <Input
        id={inputId}
        type={htmlInputType}
        inputMode={isNumericDigitsField ? "numeric" : undefined}
        maxLength={maxLength}
        value={stringValue}
        onKeyDown={(e) => {
          if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
            return;
          }
          if (isNumericDigitsField && !isDigitKeystroke(e.key)) {
            e.preventDefault();
            return;
          }
          if (isPassportField && !/^[A-Za-z0-9]$/.test(e.key)) {
            e.preventDefault();
            return;
          }
          if (disallowNumbers && isDigitKeystroke(e.key)) {
            e.preventDefault();
            return;
          }
          if (isTelField && !isAllowedTelKeystroke(e.key)) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          if (isNumericDigitsField) {
            let digitsOnly = normalizeBengaliDigits(e.target.value).replace(
              /\D/g,
              "",
            );
            if (maxLength !== undefined) {
              digitsOnly = digitsOnly.slice(0, maxLength);
            }
            onChange(digitsOnly);
            return;
          }
          if (isPassportField) {
            applySanitizedValue(
              e.target,
              e.target.value,
              (val) => val.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 9),
              (cleaned) => onChange(cleaned),
            );
            return;
          }
          if (field.type === "email") {
            const nextVal =
              maxLength !== undefined
                ? e.target.value.slice(0, maxLength)
                : e.target.value;
            onChange(nextVal);
            return;
          }
          applySanitizedValue(
            e.target,
            e.target.value,
            (val) => {
              let next = val;
              if (disallowNumbers) {
                next = next.replace(/[\d\u09E6-\u09EF]/g, "");
              }
              if (uppercase) {
                next = next.toUpperCase();
              }
              if (maxLength !== undefined) {
                next = next.slice(0, maxLength);
              }
              return next;
            },
            (cleaned) => onChange(cleaned),
          );
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
        {localizedLabel}
        {field.required ? (
          <span className="ml-1 text-red-600" aria-label={t.requiredAria}>
            *
          </span>
        ) : (
          <span className="ml-1.5 text-sm font-normal text-slate-500">
            {t.optionalTag}
          </span>
        )}
      </Label>

      {renderControl()}

      {helpText && !error && <p className="text-sm text-slate-600">{helpText}</p>}

      {localizedError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{localizedError}</p>
        </div>
      )}
    </div>
  );
}
