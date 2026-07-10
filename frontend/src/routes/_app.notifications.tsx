import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Lumen" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="Alerts & intelligence"
        description="Curated across your monitored signals"
      />

      <SectionCard title="Notifications Unavailable">
        <p className="text-muted-foreground">
          Notifications are generated from real research data.
          Run the data collector to fetch grants, patents, and publications!
        </p>
      </SectionCard>
    </div>
  );
}
