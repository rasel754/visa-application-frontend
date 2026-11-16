"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Building2, Home, Loader2, Phone } from "lucide-react";
import { PublicHeader } from "@/components/form/PublicHeader";
import { SectionWizard } from "@/components/form/SectionWizard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Company } from "@/lib/types";

export default function WhiteLabeledApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const companySlug = resolvedParams.companySlug;
  const queryToken = resolvedSearchParams.token;

  const [company, setCompany] = useState<Company | null>(null);
  const [activeToken, setActiveToken] = useState<string | undefined>(queryToken);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPortal() {
      setLoading(true);
      setErrorMessage(null);

      // 1. First attempt: check if slug is a valid Company
      try {
        const comp = await api.fetchPublicCompany(companySlug);
        if (isMounted) {
          setCompany(comp);
          setActiveToken(queryToken);
          setLoading(false);
          return;
        }
      } catch {
        // If not a company slug, check if it is a legacy one-time intake token
      }

      // 2. Second attempt: check if slug is actually an intake token
      try {
        const linkRes = await api.resolveIntakeLink(companySlug);
        if (isMounted && linkRes.valid) {
          const comp = linkRes.company ?? (await api.fetchPublicCompany("igl-visa-help"));
          setCompany(comp);
          setActiveToken(companySlug); // the slug itself was the token
          setLoading(false);
          return;
        }
      } catch (tokenErr: unknown) {
        if (isMounted) {
          if (tokenErr && typeof tokenErr === "object" && "message" in tokenErr) {
            setErrorMessage(String(tokenErr.message));
          }
        }
      }

      if (isMounted) {
        setErrorMessage(
          "The requested visa agency or application link could not be found or has expired.",
        );
        setLoading(false);
      }
    }

    if (companySlug) {
      loadPortal();
    }
    return () => {
      isMounted = false;
    };
  }, [companySlug, queryToken]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-9 w-9 animate-spin text-blue-700" />
        <p className="mt-3 text-sm font-medium text-slate-600">
          Loading agency portal...
        </p>
      </div>
    );
  }

  if (errorMessage || !company) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <PublicHeader mode="apply" />
        <main className="mx-auto flex flex-1 max-w-lg items-center px-4 py-16">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Agency Unavailable
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {errorMessage || "The requested visa agency could not be found or has been suspended."}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Return Home
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader mode={activeToken ? "token" : "apply"} company={company} />

      <main className="mx-auto max-w-[800px] px-4 py-6">
        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-900 sm:text-sm">
          <div className="flex items-center gap-2 font-semibold text-blue-950">
            <Building2 className="h-4 w-4 text-blue-700" />
            <span>Official Application for {company.name}</span>
          </div>
          {company.phone && (
            <div className="mt-1 flex items-center gap-1.5 text-slate-600">
              <Phone className="h-3.5 w-3.5 text-slate-500" />
              <span>Agency Support: {company.phone}</span>
            </div>
          )}
        </div>

        <SectionWizard companySlug={company.slug} intakeToken={activeToken} />
      </main>
    </div>
  );
}
