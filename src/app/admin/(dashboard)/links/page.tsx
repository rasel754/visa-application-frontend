"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, Copy, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCountries } from "@/hooks/useCountries";
import {
  useAdminLinks,
  useCreateAdminLink,
  useDeleteAdminLink,
} from "@/hooks/useSubmissions";
import { ApiRequestError } from "@/lib/api";
import { ERROR_MESSAGES } from "@/lib/error-messages";

export default function AdminLinksPage() {
  const { data: countries = [] } = useCountries();
  const { data, isLoading } = useAdminLinks();
  const createMutation = useCreateAdminLink();
  const deleteMutation = useDeleteAdminLink();

  const [countryCode, setCountryCode] = useState("");
  const [category, setCategory] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedCountry = useMemo(
    () =>
      countries.find(
        (c) => c.country_code.toUpperCase() === countryCode.toUpperCase(),
      ) ?? null,
    [countries, countryCode],
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
        category: countryCode && category ? category : null,
        expiresInDays: parsedDays,
      });
      toast.success("Unique intake link created.");
      setCountryCode("");
      setCategory("");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Unique Client Links</h1>
        <p className="text-sm text-slate-600">
          Create a one-time application link for a client (optionally pre-selecting their country and visa type).
        </p>
      </div>

      {/* Create Link Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
          <Link2 className="h-4 w-4 text-blue-700" aria-hidden="true" />
          Create New Link
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Country (Optional)
            </Label>
            <Select
              value={countryCode || "NONE"}
              onValueChange={(val) => {
                setCountryCode(val === "NONE" ? "" : val);
                setCategory("");
              }}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Client chooses country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Client chooses country</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.country_code} value={c.country_code}>
                    {c.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">
              Visa Type (Optional)
            </Label>
            <Select
              disabled={!selectedCountry}
              value={category || "NONE"}
              onValueChange={(val) => setCategory(val === "NONE" ? "" : val)}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue
                  placeholder={
                    selectedCountry
                      ? "Client chooses visa type"
                      : "Pick a country first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Client chooses visa type</SelectItem>
                {(selectedCountry?.categories ?? []).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link-expiry" className="text-sm font-medium text-slate-700">
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
              className="h-11"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="h-11 bg-blue-700 px-6 font-semibold hover:bg-blue-800"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {createMutation.isPending ? "Creating..." : "Create Link"}
          </Button>
        </div>
      </form>

      {/* Links List */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-blue-700" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No unique links created yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Created</TableHead>
                <TableHead>Preset Country / Type</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((link) => {
                const isExpired =
                  Boolean(link.expiresAt) &&
                  new Date(link.expiresAt!).getTime() < Date.now();
                const isUsed = Boolean(link.usedAt);
                const fullUrl = buildShareUrl(link.token);

                return (
                  <TableRow key={link.id}>
                    <TableCell className="whitespace-nowrap text-sm text-slate-600">
                      {format(new Date(link.createdAt), "dd MMM yyyy, HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      {link.countryName ? (
                        <div>
                          <p className="font-medium">{link.countryName}</p>
                          <p className="text-xs text-slate-500">
                            {link.category
                              ? link.category.charAt(0).toUpperCase() +
                                link.category.slice(1)
                              : "Any visa type"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500">Client chooses</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <code className="block truncate rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {fullUrl}
                      </code>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-slate-600">
                      {link.expiresAt
                        ? format(new Date(link.expiresAt), "dd MMM yyyy")
                        : "Never"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {isUsed ? (
                        <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                          Used{link.submissionReference ? ` (${link.submissionReference})` : ""}
                        </Badge>
                      ) : isExpired ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          Expired
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-50 text-blue-800 hover:bg-blue-50">
                          Not used
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(link.id, link.token)}
                          className="h-8"
                        >
                          {copiedId === link.id ? (
                            <>
                              <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3.5 w-3.5" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(link.id)}
                          className="h-8 border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
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
  );
}

