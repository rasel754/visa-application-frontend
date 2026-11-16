"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminMe } from "@/hooks/useSubmissions";
import { ApiRequestError, api } from "@/lib/api";
import { ERROR_MESSAGES } from "@/lib/error-messages";

const loginFormSchema = z.object({
  email: z.string().trim().email(ERROR_MESSAGES.wrongEmail),
  password: z.string().min(1, "Please enter your password."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function UnifiedLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: meData, isLoading: checkingAuth } = useAdminMe();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const user = meData?.user || meData?.admin;
    if (user) {
      if (user.role === "SUPER_ADMIN") {
        router.replace("/super-admin/dashboard");
      } else {
        router.replace("/company/dashboard");
      }
    }
  }, [meData, router]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await api.loginAdmin(values.email, values.password);
      queryClient.setQueryData(["admin-me"], res);

      const userRole = res.user?.role || res.admin?.role;
      if (userRole === "SUPER_ADMIN") {
        router.replace("/super-admin/dashboard");
      } else {
        router.replace("/company/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        setServerError(err.message);
      } else {
        setServerError(ERROR_MESSAGES.serverError);
      }
    }
  };

  const handleDemoFill = (role: "super" | "company") => {
    if (role === "super") {
      setValue("email", "superadmin@iglvisahelp.com");
      setValue("password", "SuperAdminStrongPass2026!");
    } else {
      setValue("email", "admin@iglvisahelp.com");
      setValue("password", "ChangeMeStrong123!");
    }
  };

  if (checkingAuth || meData?.user || meData?.admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="IGL Platform Logo"
            width={60}
            height={81}
            className="h-16 w-auto object-contain"
            priority
          />
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            IGL Visa Platform
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Multi-Tenant Agency & Super Admin Portal
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email" className="text-sm font-semibold text-slate-800">
              Email Address
            </Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="admin@youragency.com"
              className="h-12 text-base"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password" className="text-sm font-semibold text-slate-800">
              Password
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-12 pr-11 text-base"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-800"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-12 w-full bg-blue-700 text-base font-semibold text-white hover:bg-blue-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              "Sign In to Platform"
            )}
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Quick Login Credentials</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill("super")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100"
            >
              <div className="font-semibold text-slate-800">Super Admin</div>
              <div className="truncate text-slate-500">superadmin@igl...</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("company")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100"
            >
              <div className="font-semibold text-slate-800">Agency Admin</div>
              <div className="truncate text-slate-500">admin@iglvisa...</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
