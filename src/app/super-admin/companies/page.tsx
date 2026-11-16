"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Building2,
  ExternalLink,
  Loader2,
  Phone,
  Plus,
  Power,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { api } from "@/lib/api";
import { CompanyWithCounts } from "@/lib/types";

export default function SuperAdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Live Server Time ticker
  const [serverTime, setServerTime] = useState<Date | null>(null);

  useEffect(() => {
    setServerTime(new Date());
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Create Company Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [prefix, setPrefix] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.fetchCompanies();
      setCompanies(res.items);
    } catch {
      toast.error("Failed to load agencies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const suggestedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(suggestedSlug);

    const words = val.trim().split(/\s+/);
    if (words.length >= 2) {
      setPrefix(
        words
          .slice(0, 3)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join(""),
      );
    } else if (val.length >= 3) {
      setPrefix(val.slice(0, 3).toUpperCase());
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createCompany({
        name,
        slug,
        prefix,
        phone: phone || null,
        address: address || null,
        logoUrl: logoUrl || null,
        adminEmail,
        adminPassword,
        adminName,
      });
      toast.success(`Agency "${name}" provisioned successfully!`);
      setCreateModalOpen(false);
      setName("");
      setSlug("");
      setPrefix("");
      setPhone("");
      setAddress("");
      setLogoUrl("/logo.png");
      setAdminEmail("");
      setAdminPassword("");
      setAdminName("");
      loadCompanies();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        toast.error(String(err.message));
      } else {
        toast.error("Failed to create agency.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (company: CompanyWithCounts) => {
    const nextStatus = !company.isActive;
    try {
      await api.toggleCompanyStatus(company.id, nextStatus);
      setCompanies((prev) =>
        prev.map((c) => (c.id === company.id ? { ...c, isActive: nextStatus } : c)),
      );
      toast.success(
        `Agency "${company.name}" is now ${nextStatus ? "ACTIVE" : "SUSPENDED"}.`,
      );
    } catch {
      toast.error("Failed to update agency status.");
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.prefix.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount = companies.filter((c) => c.isActive).length;
  const suspendedCount = companies.length - activeCount;

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
              Multi-tenant registered agency counters and tenant portals
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

      {/* 2. Top Header & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-white p-4 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Agencies & Tenant Provisioning
          </h1>
          <p className="text-xs text-slate-500">
            Manage agency tenants, staff accounts, intake URLs, and operational active status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded bg-[#00a65a] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#008d4c]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Provision New Agency</span>
          </button>
        </div>
      </div>

      {/* 3. Search and Stats Strip */}
      <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by agency name, slug, or prefix..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded border border-slate-300 bg-white pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 border border-emerald-200">
            Total Agencies: <strong className="font-bold">{companies.length}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded bg-sky-50 px-2.5 py-1 font-semibold text-sky-800 border border-sky-200">
            Active: <strong className="font-bold">{activeCount}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded bg-red-50 px-2.5 py-1 font-semibold text-red-800 border border-red-200">
            Suspended: <strong className="font-bold">{suspendedCount}</strong>
          </span>
        </div>
      </div>

      {/* 4. Companies Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex min-h-[260px] items-center justify-center rounded border border-slate-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#00a65a]" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="col-span-full rounded border border-slate-200 bg-white p-10 text-center text-xs text-slate-500">
            No agencies found matching your search.
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company.id}
              className={`flex flex-col justify-between rounded border bg-white p-4 shadow-2xs transition-all ${
                company.isActive
                  ? "border-slate-200 hover:border-emerald-300"
                  : "border-red-200 bg-red-50/15"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-emerald-300 bg-emerald-50 text-sm font-extrabold text-[#00a65a]">
                      {company.prefix}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 leading-tight">
                        {company.name}
                      </h2>
                      <div className="mt-0.5 font-mono text-[11px] text-slate-500">
                        prefix: <span className="font-bold text-slate-800">{company.prefix}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      company.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {company.isActive ? "ACTIVE" : "SUSPENDED"}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Public Portal:</span>
                    <a
                      href={`/apply/${company.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-blue-600 hover:underline"
                    >
                      /apply/{company.slug}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  {company.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="text-[11px] text-slate-500 truncate">
                      {company.address}
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="mt-3 grid grid-cols-3 gap-2 rounded border border-slate-100 bg-[#fafbfc] p-2 text-center text-xs">
                  <div>
                    <div className="font-bold text-slate-900">
                      {company._count?.applications ?? 0}
                    </div>
                    <div className="text-[10px] text-slate-500">Submissions</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {company._count?.inviteLinks ?? 0}
                    </div>
                    <div className="text-[10px] text-slate-500">Invite Links</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {company._count?.users ?? 0}
                    </div>
                    <div className="text-[10px] text-slate-500">Staff</div>
                  </div>
                </div>

                {/* Users preview */}
                {company.users && company.users.length > 0 && (
                  <div className="mt-2.5 border-t border-slate-100 pt-2 text-[11px]">
                    <span className="font-semibold text-slate-500">Admin:</span>{" "}
                    <span className="text-slate-800">
                      {company.users[0].name} ({company.users[0].email})
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/super-admin/submissions?companyId=${company.id}`}
                    className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Submissions
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(company)}
                    className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold shadow-2xs transition-colors ${
                      company.isActive
                        ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    <span>{company.isActive ? "Suspend" : "Activate"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Provision New Agency Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <span>Provision New Visa Agency</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sets up an isolated tenant with custom URL slug, reference prefix, and initial agency administrator.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCompany} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Agency Name *
                </Label>
                <Input
                  required
                  placeholder="e.g. Sky Travels Ltd"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  URL Slug * (lowercase, letters & hyphens)
                </Label>
                <Input
                  required
                  placeholder="e.g. sky-travels"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Reference Prefix * (2-5 uppercase letters)
                </Label>
                <Input
                  required
                  placeholder="e.g. SKY"
                  maxLength={5}
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Support Phone
                </Label>
                <Input
                  placeholder="+880-1700-112233"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Address
                </Label>
                <Input
                  placeholder="Gulshan, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Logo URL (Optional)
                </Label>
                <Input
                  placeholder="/logo.png or https://..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                Initial Agency Administrator Credentials
              </h3>
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">
                    Admin Name *
                  </Label>
                  <Input
                    required
                    placeholder="e.g. John Doe"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Admin Email *
                    </Label>
                    <Input
                      type="email"
                      required
                      placeholder="admin@agency.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">
                      Temporary Password * (min 8 chars)
                    </Label>
                    <Input
                      type="password"
                      required
                      minLength={8}
                      placeholder="StrongPassword123!"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 bg-[#00a65a] text-xs font-semibold text-white hover:bg-[#008d4c]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Provisioning Agency...
                  </>
                ) : (
                  "Create Agency"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
