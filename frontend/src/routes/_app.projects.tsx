import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects — Lumen" }] }),
  component: ProjectsPage,
});

const columns = [
  { title: "Backlog", items: ["Scan Q2 hydrogen calls", "Refresh patent taxonomy"] },
  { title: "In progress", items: ["NSF Convergence draft", "License outreach – US 3M", "Spinout market analysis"] },
  { title: "Review", items: ["DARPA AIR proposal", "Innovation scorecard v4"] },
  { title: "Done", items: ["EP4,102,884 filing", "Q1 executive report"] },
];

function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader eyebrow="Projects" title="Research & funding projects" description="Kanban view across your workspace." actions={<button className="inline-flex h-11 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow"><Plus className="h-4 w-4" /> New project</button>} />
      <div className="no-scrollbar grid gap-4 overflow-x-auto lg:grid-cols-4">
        {columns.map((c) => (
          <SectionCard key={c.title} title={c.title} description={`${c.items.length} items`}>
            <ul className="space-y-2">
              {c.items.map((it) => (
                <li key={it} className="rounded-xl border border-border/60 bg-card/60 p-3 text-sm hover-lift">
                  <div className="font-semibold">{it}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Funding</span>
                    <span>Due Apr 12</span>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}