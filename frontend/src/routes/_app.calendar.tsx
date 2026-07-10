import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({ meta: [{ title: "Calendar & Deadlines — Lumen" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Calendar"
        title="Deadlines & milestones"
        description="Every important date across your pipeline"
      />

      <SectionCard title="Calendar Unavailable">
        <p className="text-muted-foreground">
          To see deadlines in the calendar, you need to first fetch grants from the backend via the data collector!
        </p>
      </SectionCard>
    </div>
  );
}
