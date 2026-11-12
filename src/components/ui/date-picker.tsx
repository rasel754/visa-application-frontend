"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type DateFieldMode = "past" | "past-or-today" | "future" | "any";

interface DatePickerProps {
  id?: string;
  value?: string;
  onChange: (ymd: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  mode?: DateFieldMode;
  minDateYmd?: string;
  maxDateYmd?: string;
  defaultFocusYear?: number;
  disabled?: boolean;
  invalid?: boolean;
  allowClear?: boolean;
  className?: string;
}

export function parseYmdToLocalDate(ymd: string | undefined): Date | undefined {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return undefined;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const dt = new Date(y, m - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return undefined;
  }
  return dt;
}

export function formatLocalDateToYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getLocalTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Select date",
  mode = "any",
  minDateYmd,
  maxDateYmd,
  defaultFocusYear,
  disabled = false,
  invalid = false,
  allowClear = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => parseYmdToLocalDate(value), [value]);
  const today = React.useMemo(() => getLocalTodayDate(), []);
  const currentYear = today.getFullYear();

  const minBound = React.useMemo(() => {
    const parsedMin = parseYmdToLocalDate(minDateYmd);
    if (mode === "future") {
      if (parsedMin && parsedMin > today) return parsedMin;
      return today;
    }
    return parsedMin;
  }, [minDateYmd, mode, today]);

  const maxBound = React.useMemo(() => {
    const parsedMax = parseYmdToLocalDate(maxDateYmd);
    if (mode === "past") {
      const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      if (parsedMax && parsedMax < yesterday) return parsedMax;
      return yesterday;
    }
    if (mode === "past-or-today") {
      if (parsedMax && parsedMax < today) return parsedMax;
      return today;
    }
    return parsedMax;
  }, [maxDateYmd, mode, today]);

  const startMonth = React.useMemo(() => {
    if (mode === "future") {
      return minBound
        ? new Date(minBound.getFullYear(), minBound.getMonth(), 1)
        : new Date(currentYear, today.getMonth(), 1);
    }
    return new Date(1920, 0, 1);
  }, [currentYear, minBound, mode, today]);

  const endMonth = React.useMemo(() => {
    if (mode === "past" || mode === "past-or-today") {
      return new Date(currentYear, 11, 1);
    }
    return new Date(currentYear + 15, 11, 1);
  }, [currentYear, mode]);

  const defaultMonth = React.useMemo(() => {
    if (selectedDate) return selectedDate;
    if (minBound && minBound > today) return minBound;
    if (defaultFocusYear) {
      return new Date(defaultFocusYear, 0, 1);
    }
    return today;
  }, [defaultFocusYear, minBound, selectedDate, today]);

  const isDateDisabled = React.useCallback(
    (date: Date) => {
      const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (minBound && normalized < minBound) return true;
      if (maxBound && normalized > maxBound) return true;
      return false;
    },
    [maxBound, minBound],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      onBlur?.();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(
            "h-12 w-full justify-between bg-white px-3.5 text-left text-base font-normal hover:bg-slate-50",
            !selectedDate && "text-slate-400",
            invalid ? "border-red-500 ring-1 ring-red-500" : "border-slate-300",
            className,
          )}
        >
          <span className="flex items-center gap-2.5 truncate">
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="truncate text-slate-900">
              {selectedDate ? (
                format(selectedDate, "dd MMM yyyy")
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
            </span>
          </span>
          {allowClear && selectedDate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                onBlur?.();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                  onBlur?.();
                }
              }}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={defaultMonth}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={isDateDisabled}
          onSelect={(date) => {
            if (!date) return;
            onChange(formatLocalDateToYmd(date));
            setOpen(false);
            onBlur?.();
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

