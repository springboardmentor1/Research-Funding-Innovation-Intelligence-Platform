import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/trends")({
  head: () => ({ meta: [{ title: "Research Trends — Lumen" }] }),
  component: TrendsPage,
});

function TrendsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Research Trend Intelligence"
        title="What's rising in your domains"
        description="Publication growth, citation velocity and emerging hotspots across 60M+ papers"
      />

      <SectionCard title="Trends Unavailable">
        <p className="text-muted-foreground">
          Research trends require real publication data.
          Run the data collector to fetch to see your trends!
        </p>
      </SectionCard>
    </div>
  );
}
