import { PublicHeader } from "@/components/form/PublicHeader";
import { SectionWizard } from "@/components/form/SectionWizard";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const intakeToken = resolvedSearchParams?.token;

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader mode={intakeToken ? "token" : "apply"} />

      <main className="mx-auto max-w-[800px] px-4 py-6">
        <SectionWizard
          companySlug={intakeToken ? undefined : "igl-visa-help"}
          intakeToken={intakeToken}
        />
      </main>
    </div>
  );
}
