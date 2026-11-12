import { PublicHeader } from "@/components/form/PublicHeader";
import { SectionWizard } from "@/components/form/SectionWizard";

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader mode="apply" />

      <main className="mx-auto max-w-[800px] px-4 py-6">
        <SectionWizard />
      </main>
    </div>
  );
}
