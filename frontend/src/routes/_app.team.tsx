import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Team Workspace — Lumen" }] }),
  component: TeamPage,
});

const team = [
  { name: "Dr. Elena Ríos", role: "PI · Materials + ML", status: "Owner" },
  { name: "Priya Menon", role: "Postdoc · GNNs", status: "Admin" },
  { name: "Marcus Lee", role: "Grants manager", status: "Editor" },
  { name: "Yuki Tanaka", role: "PhD · Perovskites", status: "Viewer" },
  { name: "Amina Khaled", role: "IP counsel", status: "Reviewer" },
];

function TeamPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader eyebrow="Team" title="Workspace & collaboration" description="Manage members, roles and permissions." actions={<button className="inline-flex h-11 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow"><UserPlus className="h-4 w-4" /> Invite</button>} />
      <SectionCard>
        <ul className="divide-y divide-border/60">
          {team.map((m) => (
            <li key={m.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 py-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-xs font-bold text-primary-foreground">
                {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.role}</div>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">{m.status}</span>
              <button className="rounded-lg border border-border/60 px-2.5 py-1 text-xs">Manage</button>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}