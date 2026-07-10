import { createFileRoute } from "@tanstack/react-router";
import { Rocket, Handshake, Factory, Building2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/commercialization")({
  head: () => ({ meta: [{ title: "Commercialization — Lumen" }] }),
  component: CommercializationPage,
});

const paths = [
  {
    icon: Rocket,
    title: "Spin out a venture",
    readiness: 78,
    body: "Your GNN-catalyst IP has strong technical moat and clear industrial pull. Suggested seed round: $3–5M.",
    action: "Draft pitch deck",
  },
  {
    icon: Handshake,
    title: "License to industry",
    readiness: 84,
    body: "3 chemical majors have publicly stated goals overlapping your patent claims. Estimated royalty range 2–4%.",
    action: "Identify licensees",
  },
  {
    icon: Factory,
    title: "Productize with partner",
    readiness: 61,
    body: "Integrate with an existing electrolyzer OEM to reach TRL 8 in 18 months. Co-development plan available.",
    action: "See partners",
  },
  {
    icon: Building2,
    title: "Industry consortium",
    readiness: 55,
    body: "Join a pre-competitive consortium to share dev cost; 2 open call windows in the next 90 days.",
    action: "Browse consortia",
  },
];

function CommercializationPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Commercialization"
        title="From lab to market"
        description="AI-guided routes to commercialize your research and IP."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {paths.map((p) => {
          const Icon = p.icon;
          return (
            <article key={p.title} className="glass rounded-3xl p-5 hover-lift">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl gradient-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">Readiness</span>
                      <span className="text-muted-foreground">{p.readiness}/100</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full gradient-ai" style={{ width: `${p.readiness}%` }} />
                    </div>
                  </div>
                  <button className="mt-4 rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary">
                    {p.action}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <SectionCard title="Market opportunities" description="Aligned industry demand signals">
        <ul className="divide-y divide-border/60">
          {[
            { name: "Green hydrogen electrolyzers", tam: "$22B by 2030", growth: "+38% CAGR" },
            { name: "AI-driven catalyst discovery", tam: "$4.1B by 2029", growth: "+27% CAGR" },
            { name: "Grid-scale battery diagnostics", tam: "$3.6B by 2028", growth: "+31% CAGR" },
          ].map((m) => (
            <li key={m.name} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 py-3 text-sm">
              <div className="min-w-0 truncate font-semibold">{m.name}</div>
              <div className="text-muted-foreground">{m.tam}</div>
              <div className="rounded-full bg-[color:var(--success)]/10 px-2 py-0.5 text-xs font-bold text-[color:var(--success)]">{m.growth}</div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}