import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Filter, Search, Shield } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_app/patents")({
  head: () => ({ meta: [{ title: "Patent Intelligence — Lumen" }] }),
  component: PatentsPage,
});

const filings = Array.from({ length: 10 }).map((_, i) => ({
  year: 2016 + i,
  filings: Math.round(20 + Math.sin(i) * 6 + i * 4),
  granted: Math.round(12 + Math.cos(i) * 4 + i * 2.5),
}));

const clusters = [
  { name: "Electrolyzer flow control", count: 42, color: "var(--color-chart-1)" },
  { name: "GNN for materials", count: 31, color: "var(--color-chart-2)" },
  { name: "Perovskite passivation", count: 22, color: "var(--color-chart-3)" },
  { name: "Verified RL", count: 18, color: "var(--color-chart-4)" },
  { name: "Solid-state cathodes", count: 14, color: "var(--color-chart-5)" },
];

function PatentsPage() {
  const { token } = useAuth();
  const { data: dbPatents } = useQuery({
    queryKey: ["patents"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/v1/data/patents", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch patents");
      return res.json();
    },
    retry: 1,
  });

  const displayPatents = dbPatents && dbPatents.length > 0 ? dbPatents : [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Patent Intelligence"
        title="Landscape, clusters and competitor filings"
        description="127 filings tracked across your monitored technologies with weekly updates."
      />

      <SectionCard>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search patents by keyword, assignee, CPC…"
              className="h-12 w-full rounded-xl border border-border/60 bg-background/60 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-border/60 px-3 text-sm font-medium">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="inline-flex h-12 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow hover-lift">
            Search
          </button>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Filings timeline" description="Yearly filings and grants in your clusters">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={filings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" fontSize={12} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis fontSize={12} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="filings" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="granted" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Innovation clusters" description="AI-detected patent clusters">
          <ul className="space-y-3">
            {clusters.map((c) => (
              <li key={c.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-semibold">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.count} filings</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${(c.count / 45) * 100}%`, background: c.color }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Recent patents" description="Filings and grants relevant to your profile">
        {displayPatents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3">Patent</th>
                  <th className="py-3">Assignee</th>
                  <th className="py-3">Filed</th>
                  <th className="py-3">Citations</th>
                  <th className="py-3">Status</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {displayPatents.map((p: any) => (
                  <tr key={p.id} className="align-top">
                    <td className="py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-muted-foreground">{p.application_number || p.id}</div>
                          <div className="truncate font-semibold">{p.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-foreground/80">{p.assignee}</td>
                    <td className="py-3.5 text-foreground/80">{p.filing_date ? new Date(p.filing_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}</td>
                    <td className="py-3.5 font-semibold">{p.citations}</td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{p.status}</span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                        View <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run the data collector to fetch real patent data from PatentsView and other sources.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
