"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCountries } from "@/hooks/useCountries";
import { api } from "@/lib/api";
import { IntakeLinkItem } from "@/lib/types";

interface InviteLinkGeneratorProps {
  companySlug: string;
  companyName: string;
}

export function InviteLinkGenerator({
  companySlug,
  companyName,
}: InviteLinkGeneratorProps) {
  const { data: countries = [] } = useCountries();
  const [links, setLinks] = useState<IntakeLinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Modal create state - country and profession required
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [profession, setProfession] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [isCreating, setIsCreating] = useState(false);

  const countryOptions: ComboboxOption[] = useMemo(() => {
    return countries.map((c) => ({
      value: c.country_code,
      label: c.country,
      hint: c.region,
      keywords: [c.country_code, c.region],
    }));
  }, [countries]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicApplyUrl = `${origin}/apply/${companySlug}`;

  const loadLinks = async () => {
    try {
      setLoadingLinks(true);
      const res = await api.fetchCompanyLinks();
      setLinks(res.items);
    } catch {
      toast.error("Failed to load client intake links.");
    } finally {
      setLoadingLinks(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const handleCopyPublic = async () => {
    try {
      await navigator.clipboard.writeText(publicApplyUrl);
      setCopiedPublic(true);
      toast.success("Public application link copied to clipboard!");
      setTimeout(() => setCopiedPublic(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleCopyTokenLink = async (token: string) => {
    const linkUrl = `${origin}/apply/${companySlug}?token=${encodeURIComponent(token)}`;
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopiedToken(token);
      toast.success("One-time intake link copied!");
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryCode) {
      toast.error("Please select a target country.");
      return;
    }
    if (!profession || profession === "any") {
      toast.error("Please select an applicant profession.");
      return;
    }
    setIsCreating(true);
    try {
      await api.createCompanyLink({
        countryCode: countryCode,
        profession: profession,
        expiresInDays: expiresInDays ? Number.parseInt(expiresInDays, 10) : null,
      });
      toast.success("One-time invite link generated successfully!");
      setCreateModalOpen(false);
      setCountryCode("");
      setProfession("");
      setExpiresInDays("7");
      loadLinks();
    } catch {
      toast.error("Failed to generate link.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await api.deleteCompanyLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast.success("Link deleted.");
    } catch {
      toast.error("Failed to delete link.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Permanent Public Application URL */}
      <div className="rounded border border-emerald-200 bg-[#f7fbf9] p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Shareable Agency Intake Link
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Permanent public intake link for {companyName}. Applicants open this link to fill the white-labeled intake form.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopyPublic}
              className="h-8 gap-1.5 bg-[#00a65a] text-xs font-semibold text-white shadow-2xs hover:bg-[#008d4c]"
            >
              {copiedPublic ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedPublic ? "Copied!" : "Copy Public Link"}</span>
            </Button>
            <Button asChild variant="outline" size="icon" className="h-8 w-8">
              <a href={`/apply/${companySlug}`} target="_blank" rel="noreferrer" title="Open Public Page">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded border border-emerald-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-800 break-all">
          <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span>{publicApplyUrl}</span>
        </div>
      </div>

      {/* 2. One-Time Client Intake Links */}
      <div className="rounded border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">One-Time Client Links</h2>
            <p className="text-xs text-slate-500">
              Pre-configure a destination or profession for a client. Invalidates after submission.
            </p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            size="sm"
            className="h-8 gap-1.5 bg-[#00a65a] text-xs font-semibold text-white shadow-2xs hover:bg-[#008d4c]"
          >
            <Plus className="h-3.5 w-3.5" />
            Generate One-Time Link
          </Button>
        </div>

        <div className="mt-3">
          {loadingLinks ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#00a65a]" />
            </div>
          ) : links.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No one-time links created yet. Click Generate One-Time Link to create one.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {links.map((link) => {
                const isUsed = Boolean(link.usedAt);
                const isExpired = link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
                const isCopied = copiedToken === link.token;

                return (
                  <div
                    key={link.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-800">
                          {link.token.slice(0, 14)}...
                        </span>
                        {isUsed ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            Used {link.submissionReference ? `(${link.submissionReference})` : ""}
                          </span>
                        ) : isExpired ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Expired
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-slate-500">
                        <span>Country: {link.countryName || "Any"}</span>
                        &bull;
                        <span>Profession: {link.profession || "Any"}</span>
                        {link.expiresAt && (
                          <>
                            &bull;
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires: {new Date(link.expiresAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isUsed && !isExpired && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyTokenLink(link.token)}
                          className="h-8 gap-1.5 text-xs font-semibold"
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{isCopied ? "Copied" : "Copy Link"}</span>
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteLink(link.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600"
                        title="Delete Link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Generate One-Time Link Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate One-Time Client Link</DialogTitle>
            <DialogDescription className="text-xs">
              Select the required destination country and applicant profession for this client link.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLink} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Destination Country <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={countryOptions}
                value={countryCode}
                onValueChange={(val) => setCountryCode(val)}
                placeholder="Select destination country..."
                searchPlaceholder="Search country name..."
                emptyText="No country found"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Applicant Profession <span className="text-red-500">*</span>
              </Label>
              <Select value={profession} onValueChange={setProfession}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select Profession (Required)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="businessman">Businessman</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Link Expiration (Days)
              </Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !countryCode || !profession || profession === "any"}
                className="bg-[#00a65a] text-white hover:bg-[#008d4c] font-semibold text-xs h-9"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Link"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
