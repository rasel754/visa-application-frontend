"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { LiveServerTime } from "@/components/admin/LiveServerTime";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminMe } from "@/hooks/useSubmissions";
import { ApiRequestError, api } from "@/lib/api";
import { AdminUserSummary } from "@/lib/types";

export default function CompanyStaffPage() {
  const { data: meData } = useAdminMe();
  const currentUser = meData?.user || meData?.admin;
  const company = currentUser?.company;

  const [staffList, setStaffList] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add Staff Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Staff Confirmation Modal State
  const [staffToDelete, setStaffToDelete] = useState<AdminUserSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await api.fetchCompanyStaff();
      setStaffList(res.items);
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to load agency staff team.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a staff member name.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createCompanyStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      toast.success(`Staff account for "${name.trim()}" created successfully!`);
      setCreateModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      loadStaff();
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        const firstFieldMsg = Object.values(err.fieldErrors)[0];
        toast.error(firstFieldMsg ?? err.message);
      } else {
        toast.error("Failed to create staff account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteCompanyStaff(staffToDelete.id);
      toast.success(`Staff account "${staffToDelete.name}" removed successfully.`);
      setStaffToDelete(null);
      loadStaff();
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to remove staff account.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="flex flex-col gap-2 rounded border border-slate-200 bg-white px-3.5 py-2 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="font-bold text-emerald-700">▼</span>
          <span>
            Staff Management:{" "}
            <strong className="font-semibold text-slate-900">
              {company?.name ? `${company.name} (${company.prefix || "Agency"})` : "Your Agency"}
            </strong>{" "}
            authorized staff accounts and operator team
          </span>
        </div>

        <LiveServerTime />
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-2xs">
        {/* Header & Actions */}
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-700" />
            <h1 className="text-sm font-bold text-slate-900">
              Agency Staff Team
            </h1>
            <span className="text-xs text-slate-500">
              Manage accounts and access permissions for your agency team members.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadStaff}
              title="Refresh staff list"
              className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
            >
              <RefreshCw className="h-3 w-3 text-slate-500" />
              <span>Refresh</span>
            </button>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="h-8 gap-1.5 bg-[#00a65a] text-xs font-semibold text-white shadow-2xs hover:bg-[#008d4c]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Staff Member</span>
            </Button>
          </div>
        </div>

        {/* Filter & Counter Bar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-[#fafbfc]">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search staff by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 border border-emerald-200">
              Total Team Members: <strong>{staffList.length}</strong>
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-0">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#00a65a]" />
              <span className="ml-2 text-xs text-slate-500">Loading staff accounts...</span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="font-medium text-slate-700">No staff accounts found.</p>
              <p className="mt-1 text-slate-400">
                Click &quot;Add Staff Member&quot; to provision an account for your agency operator.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fafbfc] text-xs">
                  <TableHead className="w-[45%] font-bold text-slate-700">
                    Staff Member
                  </TableHead>
                  <TableHead className="font-bold text-slate-700">
                    Role & Access
                  </TableHead>
                  <TableHead className="font-bold text-slate-700">
                    Date Added
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => {
                  const isCurrent = currentUser?.id === staff.id;
                  const initials = staff.name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((n) => n[0]?.toUpperCase() ?? "")
                    .join("");

                  return (
                    <TableRow key={staff.id} className="text-xs hover:bg-slate-50/60">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 text-[11px] border border-emerald-200">
                            {initials || "ST"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span>{staff.name}</span>
                              {isCurrent && (
                                <span className="rounded bg-sky-100 px-1.5 py-0.2 text-[10px] font-semibold text-sky-800 border border-sky-200">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {staff.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          <span>Agency Staff</span>
                        </span>
                      </TableCell>

                      <TableCell className="font-mono text-[11px] text-slate-600">
                        {staff.createdAt
                          ? format(new Date(staff.createdAt), "dd-MMM-yyyy")
                          : "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        {isCurrent ? (
                          <span className="text-[11px] font-medium text-slate-400 italic">
                            Active session
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStaffToDelete(staff)}
                            className="h-8 gap-1 text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs"
                            title="Remove staff member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              <span>Add Agency Staff Member</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Create a login account for an operator or manager in your agency team.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStaff} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                Staff Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. Tanvir Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                Staff Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                required
                placeholder="e.g. tanvir@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                Temporary Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-xs"
              />
              <p className="text-[10px] text-slate-500">
                The staff member can change their password anytime from the agency portal header.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-semibold h-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Staff Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog
        open={Boolean(staffToDelete)}
        onOpenChange={(isOpen) => !isOpen && setStaffToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>Remove Staff Member</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 pt-1">
              Are you sure you want to remove{" "}
              <strong className="font-semibold text-slate-900">
                {staffToDelete?.name}
              </strong>{" "}
              ({staffToDelete?.email}) from your agency team?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-red-100 bg-red-50/70 p-3 text-xs text-red-800">
            This account will immediately lose access to your agency portal and will not be able to log in.
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStaffToDelete(null)}
              disabled={isDeleting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteStaff}
              disabled={isDeleting}
              className="text-xs font-semibold h-8"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Removing...
                </>
              ) : (
                "Confirm Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
