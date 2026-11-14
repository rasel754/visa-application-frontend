"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  KeyRound,
  LayoutDashboard,
  Link2,
  Loader2,
  LogOut,
  Menu,
  ShieldAlert,
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

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: FileText },
  { href: "/admin/links", label: "Unique Links", icon: Link2 },
  { href: "/admin/otp", label: "OTP Activity", icon: ShieldAlert },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useAdminMe();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (isError || !data?.admin)) {
      router.replace("/admin/login");
    }
  }, [isLoading, isError, data, router]);

  const handleLogout = async () => {
    try {
      await api.logoutAdmin();
    } catch {
      // Ignore logout network error and clear local cache
    }
    queryClient.clear();
    router.replace("/admin/login");
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

  if (isLoading || !data?.admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link href="/admin" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="IGL Group Logo"
                width={32}
                height={43}
                className="h-9 w-auto object-contain"
                priority
              />
              <div>
                <span className="block text-base font-bold text-slate-900">
                  IGL Visa Help
                </span>
                <span className="block text-xs text-slate-500">
                  Admin Office
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-medium text-slate-600 sm:inline">
              {data.admin.name}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPasswordModalOpen(true)}
              className="h-9"
            >
              <KeyRound className="mr-1.5 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Change Password</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-9 border-red-200 text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row print:block print:max-w-none print:p-0">
        {/* Sidebar */}
        <aside
          className={`w-full shrink-0 md:block md:w-56 print:hidden ${
            mobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <nav className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-blue-700 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 print:w-full">{children}</main>
      </div>

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
              <Label htmlFor="current-pw">Current Password</Label>
              <Input
                id="current-pw"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New Password</Label>
              <Input
                id="new-pw"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingPassword}
                className="bg-blue-700 hover:bg-blue-800"
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

