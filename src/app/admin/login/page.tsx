"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
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
  password: z.string().min(1, "Please write your password."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: meData, isLoading: checkingAuth } = useAdminMe();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (meData?.admin) {
      router.replace("/admin");
    }
  }, [meData, router]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await api.loginAdmin(values.email, values.password);
      queryClient.setQueryData(["admin-me"], res);
      router.replace("/admin");
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        setServerError(err.message);
      } else {
        setServerError(ERROR_MESSAGES.serverError);
      }
    }
  };

  if (checkingAuth || meData?.admin) {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-800 text-white shadow-sm">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            IGL Visa Help
          </h1>
          <p className="mt-1 text-sm text-slate-500">Admin Login</p>
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
            <Label htmlFor="admin-email" className="text-sm font-semibold text-slate-800">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="admin@iglvisahelp.com"
              className="h-12 text-base"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-sm font-semibold text-slate-800">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Write your password"
              className="h-12 text-base"
              {...register("password")}
            />
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
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

