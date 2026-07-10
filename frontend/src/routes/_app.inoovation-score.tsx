import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/inoovation-score")({
  head: () => ({ meta: [{ title: "Innovation Score — Lumen" }] }),
  component: InnovationScorePage,
});

function InnovationScorePage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Innovation Scoring Engine"
        title="Your innovation score"
        description="Composite of novelty, patent strength, tech maturity, market potential, funding fit and team"
      />

      <SectionCard title="Innovation Scoring Unavailable">
        <p className="text-muted-foreground">
          Innovation scoring requires real research publications and patents from the backend.
          Run the data collector to fetch publications and patents, then we'll calculate your score!
        </p>
      </SectionCard>
    </div>
  );
}
