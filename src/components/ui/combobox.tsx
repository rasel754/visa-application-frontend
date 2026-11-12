"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: string;
  keywords?: string[];
}

interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value: string | null | undefined;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

export function Combobox({
  id,
  options,
  value,
  onValueChange,
  onBlur,
  placeholder = "Choose an option...",
  searchPlaceholder = "Type to search...",
  emptyText = "No matching result found.",
  disabled = false,
  invalid = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = React.useMemo(() => {
    if (!value) return null;
    const normalized = value.toLowerCase();
    return options.find((opt) => opt.value.toLowerCase() === normalized) ?? null;
  }, [options, value]);

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
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          disabled={disabled}
          className={cn(
            "h-12 w-full justify-between bg-white px-3.5 text-left text-base font-normal hover:bg-slate-50",
            invalid ? "border-red-500 ring-1 ring-red-500" : "border-slate-300",
            className,
          )}
        >
          <span className="truncate">
            {selectedOption ? (
              <span className="font-medium text-slate-900">{selectedOption.label}</span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-[260px] p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-10 text-sm" />
          <CommandList className="max-h-72">
            <CommandEmpty className="py-6 text-center text-sm text-slate-500">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected =
                  Boolean(value) && opt.value.toLowerCase() === value!.toLowerCase();
                return (
                  <CommandItem
                    key={opt.value || "__empty__"}
                    value={`${opt.label} ${opt.hint ?? ""} ${(opt.keywords ?? []).join(" ")}`}
                    onSelect={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                      onBlur?.();
                    }}
                    className="min-h-10 cursor-pointer py-2 text-base [&>svg:last-child]:hidden"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0 text-blue-700",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                      <span className="truncate font-medium text-slate-900">{opt.label}</span>
                      {opt.hint && (
                        <span className="shrink-0 text-xs text-slate-500">{opt.hint}</span>
                      )}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
