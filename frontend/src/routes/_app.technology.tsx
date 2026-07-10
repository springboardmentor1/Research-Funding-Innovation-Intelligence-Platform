import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/technology")({
  head: () => ({ meta: [{ title: "Technology Radar — Lumen" }] }),
  component: TechnologyPage,
});

function TechnologyPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Technology Intelligence"
        title="Emerging technologies & maturity radar"
        description="Monitor adoption, momentum and competitive positioning across your domains"
      />

      <SectionCard title="Technology Radar Unavailable">
        <p className="text-muted-foreground">
          Technology radar requires real publication data.
          Run the data collector to fetch publications to build your tech radar!
        </p>
      </SectionCard>
    </div>
  );
}
