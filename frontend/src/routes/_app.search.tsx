import { createFileRoute } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/search")({
  head: () => ({ meta: [{ title: "Global Search — Lumen" }] }),
  component: SearchPage,
});

const groups = [
  {
    label: "Funding",
    color: "text-primary bg-primary/10",
    items: [
      { title: "NSF Convergence Accelerator — AI for Materials", sub: "Grant · $5M · Due Mar 14" },
      { title: "Horizon Europe — Green Hydrogen Innovation", sub: "Grant · €12M · Due Apr 02" },
    ],
  },
  {
    label: "Patents",
    color: "text-[color:var(--info)] bg-[color:var(--info)]/10",
    items: [
      { title: "EP4,102,884 — GNN for Catalyst Discovery", sub: "Published · 21 citations" },
      { title: "US11,842,913 — Adaptive Electrolyzer Stack", sub: "Granted · 34 citations" },
    ],
  },
  {
    label: "Researchers",
    color: "text-[color:var(--ai)] bg-[color:var(--ai)]/10",
    items: [
      { title: "Dr. Priya Menon", sub: "Stanford · Materials + ML · h-index 42" },
      { title: "Prof. Kenji Watanabe", sub: "Tokyo Tech · Perovskites · h-index 68" },
    ],
  },
  {
    label: "Publications",
    color: "text-[color:var(--success)] bg-[color:var(--success)]/10",
    items: [
      { title: "Graph Neural Networks for Heterogeneous Catalysis", sub: "Nature Comm. · 2024 · 312 cites" },
      { title: "Verifiable RL in Industrial Robotics", sub: "CoRL 2024 · 118 cites" },
    ],
  },
];

function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Intelligent Search"
        title="Search everything"
        description="Funding, patents, technologies, researchers, publications and organizations."
      />
      <div className="glass-strong rounded-3xl p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            defaultValue="graph neural networks catalyst"
            className="h-14 w-full rounded-2xl border border-border/60 bg-background/60 pl-12 pr-32 text-base outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-xl gradient-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow">
            <Sparkles className="h-3.5 w-3.5" /> AI Answer
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 px-1 text-xs text-muted-foreground">
          <span>Try:</span>
          {["perovskite tandems", "DARPA autonomy", "spinouts in Europe", "Prof. Menon"].map((s) => (
            <button key={s} className="rounded-full border border-border/60 bg-card/60 px-2.5 py-0.5 hover:text-primary">
              {s}
            </button>
          ))}
        </div>
      </div>

      <SectionCard title="AI answer" description="Synthesized across 1,240 sources">
        <p className="text-sm leading-relaxed">
          Graph neural networks are the fastest-growing method in heterogeneous catalyst discovery,
          with a <strong>+214% publication growth</strong> in 12 months. Key contributors are UC
          Berkeley, MIT and DeepMind. Three open grants ($19.4M total) fund this line and 42
          patents were filed in the last year.
        </p>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <SectionCard key={g.label} title={g.label}>
            <ul className="space-y-2">
              {g.items.map((it) => (
                <li key={it.title} className="rounded-xl border border-border/60 p-3">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${g.color}`}>
                      {g.label}
                    </span>
                    <span className="truncate text-sm font-semibold">{it.title}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{it.sub}</div>
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}