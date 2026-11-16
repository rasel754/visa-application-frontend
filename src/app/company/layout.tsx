"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  ExternalLink,
  FileText,
  Globe,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  Loader2,
  LogOut,
  Menu,
  Search,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
import { useAdminMe } from "@/hooks/useSubmissions";
import { ApiRequestError, api } from "@/lib/api";
import { ERROR_MESSAGES } from "@/lib/error-messages";
import { AdminStats } from "@/lib/types";

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: meData, isLoading } = useAdminMe();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Stats for sidebar counter badge
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sidebar search
  const [sidebarSearch, setSidebarSearch] = useState("");

  const user = meData?.user || meData?.admin;
  const company = user?.company;

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === "SUPER_ADMIN") {
        router.replace("/super-admin/dashboard");
      }
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      api
        .fetchCompanyStats()
        .then((s) => setStats(s))
        .catch(() => {
          // ignore background stats load error
        });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.logoutAdmin();
    } catch {
      // Ignore
    }
    queryClient.clear();
    router.replace("/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError("Please choose a new password with at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      await api.changeAdminPassword(currentPassword, newPassword);
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setPasswordModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        const fieldMsg = Object.values(err.fieldErrors)[0];
        setPasswordError(fieldMsg ?? err.message);
      } else {
        setPasswordError(ERROR_MESSAGES.serverError);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSidebarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sidebarSearch.trim()) return;
    router.push(`/company/applications?search=${encodeURIComponent(sidebarSearch.trim())}`);
    setMobileMenuOpen(false);
  };

  // Derive initials for avatar
  const displayName = user?.name || company?.name || "AGENCY ADMIN";
  const nameParts = displayName.trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  const brandName = company?.name || "IGL Visa Help";
  const brandLogo = company?.logoUrl || "/logo.png";
  const totalSubmissions = stats?.total ?? 0;

  if (isLoading || !user || user.role === "SUPER_ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00a65a]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6f9] text-slate-800 print:bg-white">
      {/* 1. TOP WHITE NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-2xs print:hidden">
        <div className="flex h-14 w-full items-center justify-between px-3 sm:px-5">
          {/* Brand with Logo + 3x3 Grid Launcher */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="rounded p-1 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link href="/company/dashboard" className="flex items-center gap-2.5">
              <Image
                src={brandLogo}
                alt={brandName}
                width={32}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
              <span className="text-base font-bold tracking-tight text-slate-900 truncate max-w-[200px] sm:max-w-none">
                {brandName}
              </span>
            </Link>

            {/* 3x3 App Launcher Icon Button */}
            <button
              type="button"
              onClick={() => toast.info("App Launcher: Agency Workspace Active")}
              className="hidden rounded p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
              title="ERP Modules"
              aria-label="ERP Modules"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Admin Office Badge */}
            <div className="hidden items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/90 px-3 py-1 text-xs font-medium text-slate-700 md:inline-flex">
              <Building2 className="h-3.5 w-3.5 text-sky-600" />
              <span>
                Admin Office:{" "}
                <strong className="font-semibold text-slate-900">
                  {company?.name ? `${company.name} Admin` : user.name || "IGL Visa Help Admin"}
                </strong>
              </span>
            </div>

            {/* Change Password Button */}
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
            >
              <KeyRound className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Change Password</span>
            </button>

            {/* Log Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-3.5 w-3.5 rotate-180" />
              <span>[→ Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WRAPPER (SIDEBAR + CONTENT) */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-60 shrink-0 transform flex-col justify-between bg-[#073e2e] text-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 print:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col">
            {/* Mobile close button */}
            <div className="flex items-center justify-between border-b border-emerald-900/60 p-3 md:hidden">
              <span className="text-xs font-bold text-emerald-200 truncate">{brandName} ERP</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded p-1 text-emerald-300 hover:bg-emerald-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center border-b border-emerald-900/40 px-4 py-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#10b981] bg-[#053225] text-lg font-bold tracking-wider text-white shadow-inner">
                {initials}
              </div>
              <h3 className="mt-2.5 text-xs font-bold uppercase tracking-wider text-white truncate max-w-[200px]">
                {displayName}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
                <span>Online</span>
              </div>
            </div>

            {/* Search Clients Box */}
            <div className="px-3 py-3">
              <form onSubmit={handleSidebarSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search Clients (11 digit)..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full rounded-l bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  title="Search clients"
                  className="flex shrink-0 items-center justify-center rounded-r bg-[#00a65a] px-2.5 text-white transition-colors hover:bg-[#008d4c]"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Nav Links */}
            <nav className="space-y-0.5 px-2 py-1">
              {/* Dashboard */}
              <Link
                href="/company/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded px-3 py-2 text-xs font-medium transition-colors ${
                  pathname === "/company/dashboard"
                    ? "bg-[#0e5842] text-white shadow-2xs font-semibold"
                    : "text-emerald-100 hover:bg-[#0b4d3a] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4 shrink-0 opacity-90" />
                  <span>Dashboard</span>
                </div>
              </Link>

              {/* Applications / Submissions */}
              <Link
                href="/company/applications"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded px-3 py-2 text-xs font-medium transition-colors ${
                  pathname.startsWith("/company/applications")
                    ? "bg-[#0e5842] text-white shadow-2xs font-semibold"
                    : "text-emerald-100 hover:bg-[#0b4d3a] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 opacity-90" />
                  <span>Submissions</span>
                </div>
                {totalSubmissions > 0 && (
                  <span className="rounded bg-[#00a65a] px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {totalSubmissions}
                  </span>
                )}
              </Link>

              {/* Staff Management */}
              <Link
                href="/company/staff"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded px-3 py-2 text-xs font-medium transition-colors ${
                  pathname.startsWith("/company/staff")
                    ? "bg-[#0e5842] text-white shadow-2xs font-semibold"
                    : "text-emerald-100 hover:bg-[#0b4d3a] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 shrink-0 opacity-90" />
                  <span>Staff Management</span>
                </div>
              </Link>

              {/* Public Intake Portal */}
              {company?.slug && (
                <a
                  href={`/apply/${company.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded px-3 py-2 text-xs font-medium text-emerald-100 transition-colors hover:bg-[#0b4d3a] hover:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-4 w-4 shrink-0 opacity-90" />
                    <span>Public Portal</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-[#0b4d3a] px-1.5 py-0.5 text-[10px] font-mono text-emerald-200">
                    <ExternalLink className="h-2.5 w-2.5" />
                    <span>Open</span>
                  </span>
                </a>
              )}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-emerald-900/40 p-3 text-center">
            <p className="font-mono text-[10px] text-emerald-300/60">
              © 2026 IGL ERP System • 2026
            </p>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="min-w-0 flex-1 p-3.5 sm:p-5 print:p-0">
          {children}
        </main>
      </div>

      {/* 3. BOTTOM FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-6 py-2.5 text-xs text-slate-500 print:hidden">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div>
            © 2026 <strong className="text-slate-700">IGL Visa Help ERP</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <button
              type="button"
              onClick={() => toast.info(`Agency Support Desk: Connected for ${company?.name || "your agency"}`)}
              className="hover:text-slate-800"
            >
              Support Desk
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => toast.info("Documentation: Visa Application Intake System v4.2")}
              className="hover:text-slate-800"
            >
              Documentation
            </button>
            <span>•</span>
            <span className="font-mono text-slate-600">Release v4.2.1-stable</span>
          </div>
        </div>
      </footer>

      {/* Change Password Dialog */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password (minimum 8 characters).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {passwordError}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="agency-current-pw">Current Password</Label>
              <Input
                id="agency-current-pw"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agency-new-pw">New Password</Label>
              <Input
                id="agency-new-pw"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordModalOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingPassword}
                className="h-9 bg-[#00a65a] text-xs font-semibold hover:bg-[#008d4c]"
              >
                {savingPassword ? "Saving..." : "Save Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
