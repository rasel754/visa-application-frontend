import { PublicHeader } from "@/components/form/PublicHeader";
import { SectionWizard } from "@/components/form/SectionWizard";

export default async function ApplyWithTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader mode="token" />

      <main className="mx-auto max-w-[800px] px-4 py-6">
        <SectionWizard intakeToken={token} />
      </main>
    </div>
  );
}
