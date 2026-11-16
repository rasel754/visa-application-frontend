"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, Copy, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ALL_PROFESSIONS } from "@/components/admin/ProfessionBadge";
import { useCountries } from "@/hooks/useCountries";
import {
  useAdminLinks,
  useCreateAdminLink,
  useDeleteAdminLink,
} from "@/hooks/useSubmissions";
import { ApiRequestError } from "@/lib/api";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { formatProfessionLabel } from "@/lib/field-helpers";

export default function AdminLinksPage() {
  const { data: countries = [] } = useCountries();
  const { data, isLoading } = useAdminLinks();
  const createMutation = useCreateAdminLink();
  const deleteMutation = useDeleteAdminLink();

  const [countryCode, setCountryCode] = useState("");
  const [profession, setProfession] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Server Time ticker
  const [serverTime, setServerTime] = useState<Date | null>(null);

  useEffect(() => {
    setServerTime(new Date());
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const countryOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "", label: "Client chooses country" },
      ...countries.map((c) => ({
        value: c.country_code,
        label: c.country,
        hint: c.region,
        keywords: [c.country_code, c.region],
      })),
    ],
    [countries],
  );

  const buildShareUrl = (token: string): string => {
    if (typeof window === "undefined") return `/apply/${token}`;
    return `${window.location.origin}/apply/${token}`;
  };

  const handleCopy = async (id: string, token: string) => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(token));
      setCopiedId(id);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
    } catch {
      toast.error("Could not copy link automatically. Please select and copy it.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDays = expiresInDays.trim()
      ? Number.parseInt(expiresInDays.trim(), 10)
      : null;

    if (
      parsedDays !== null &&
      (!Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 365)
    ) {
      toast.error("Expiry days must be between 1 and 365.");
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        countryCode: countryCode || null,
        profession: profession || null,
        expiresInDays: parsedDays,
      });
      toast.success("Unique intake link created.");
      setCountryCode("");
      setProfession("");
      setExpiresInDays("");
      await handleCopy(created.id, created.token);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Link deleted.");
    } catch (err: unknown) {
      const msg =
        err instanceof ApiRequestError ? err.message : ERROR_MESSAGES.serverError;
      toast.error(msg);
    }
  };

  const formattedServerTime = serverTime
    ? format(serverTime, "dd-MMM-yy HH:mm 'BD'")
    : "15-Nov-26 15:26 BD";

  return (
    <div className="space-y-4">
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="flex flex-col gap-2 rounded bg-white px-3.5 py-2 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between border border-slate-200">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="text-emerald-700 font-bold">▼</span>
          <span>
            Figures below:{" "}
            <strong className="font-semibold text-slate-900">
              Your desk active unique client links and intake tokens
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live DB Sync
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-600">
            Server Time: {formattedServerTime}
          </span>
        </div>
      </div>

      {/* 2. Page Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-white px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Link2 className="h-5 w-5 text-emerald-700" />
          <div>
            <h1 className="text-lg font-bold text-slate-900">Unique Client Intake Links</h1>
            <p className="text-xs text-slate-500">
              Generate one-time visit visa application links for clients with optional pre-selected country & profession.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Create Link Form */}
      <form
        onSubmit={handleCreate}
        className="rounded border border-slate-200 bg-white p-4 shadow-2xs"
      >
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <span className="h-2.5 w-2.5 rounded-xs bg-[#00a65a]" />
          Create New Intake Link
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Country (Optional)
            </Label>
            <Combobox
              options={countryOptions}
              value={countryCode}
              placeholder="Client chooses country"
              searchPlaceholder="Search country..."
              emptyText="No country found."
              onValueChange={(val) => setCountryCode(val)}
              className="h-8 text-xs bg-white"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Profession (Optional)
            </Label>
            <Select
              value={profession || "NONE"}
              onValueChange={(val) => setProfession(val === "NONE" ? "" : val)}
            >
              <SelectTrigger className="h-8 w-full text-xs bg-white">
                <SelectValue placeholder="Client chooses profession" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Client chooses profession</SelectItem>
                {ALL_PROFESSIONS.map((prof) => (
                  <SelectItem key={prof} value={prof}>
                    {formatProfessionLabel(prof)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="link-expiry" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              Expires After (Days, Optional)
            </Label>
            <Input
              id="link-expiry"
              type="number"
              min={1}
              max={365}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              placeholder="Example: 7"
              className="h-8 text-xs bg-white"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="h-8 bg-[#00a65a] px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-[#008d4c]"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {createMutation.isPending ? "Creating..." : "Create Link"}
          </Button>
        </div>
      </form>

      {/* 4. Links List */}
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#00a65a]" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            No unique links created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  <TableHead className="font-bold text-slate-700">Created</TableHead>
                  <TableHead className="font-bold text-slate-700">Preset Country / Profession</TableHead>
                  <TableHead className="font-bold text-slate-700">Link</TableHead>
                  <TableHead className="font-bold text-slate-700">Expires</TableHead>
                  <TableHead className="font-bold text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {data.items.map((link) => {
                  const isExpired =
                    Boolean(link.expiresAt) &&
                    new Date(link.expiresAt!).getTime() < Date.now();
                  const isUsed = Boolean(link.usedAt);
                  const fullUrl = buildShareUrl(link.token);

                  return (
                    <TableRow key={link.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="whitespace-nowrap text-xs text-slate-600 font-mono">
                        {format(new Date(link.createdAt), "dd MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell className="text-xs text-slate-900">
                        {link.countryName || link.profession ? (
                          <div>
                            <p className="font-semibold text-slate-900">
                              {link.countryName ?? "Any country"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {link.profession
                                ? formatProfessionLabel(link.profession)
                                : "Any profession"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400">Client chooses</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <code className="block truncate rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 font-mono">
                          {fullUrl}
                        </code>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-slate-600">
                        {link.expiresAt
                          ? format(new Date(link.expiresAt), "dd MMM yyyy")
                          : "Never"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {isUsed ? (
                          <span className="inline-block rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Used{link.submissionReference ? ` (${link.submissionReference})` : ""}
                          </span>
                        ) : isExpired ? (
                          <span className="inline-block rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-block rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(link.id, link.token)}
                            className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                          >
                            {copiedId === link.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(link.id)}
                            className="inline-flex items-center rounded border border-red-200 bg-white p-1 text-xs text-red-700 hover:bg-red-50"
                            title="Delete link"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
