import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Lumen" }] }),
  component: AnalyticsPage,
});

const pipeline = [
  { stage: "Discovered", value: 128 },
  { stage: "Shortlisted", value: 42 },
  { stage: "Applied", value: 18 },
  { stage: "Awarded", value: 6 },
];

const trend = Array.from({ length: 12 }).map((_, i) => ({
  m: ["J","F","M","A","M","J","J","A","S","O","N","D"][i],
  value: 40 + Math.round(Math.sin(i / 2) * 12 + i * 3),
}));

const mix = [
  { name: "AI/ML", value: 34 },
  { name: "Energy", value: 26 },
  { name: "BioTech", value: 18 },
  { name: "Materials", value: 14 },
  { name: "Quantum", value: 8 },
];

const colors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader eyebrow="Analytics" title="Portfolio & performance" description="Executive view of your funding, research and innovation KPIs." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total funding", value: "$18.6M", delta: "+22%" },
          { label: "Win rate", value: "38%", delta: "+4pp" },
          { label: "Avg. proposal cycle", value: "42 d", delta: "-11%" },
          { label: "AI-influenced wins", value: "62%", delta: "+18pp" },
        ].map((k) => (
          <div key={k.label} className="glass rounded-2xl p-4">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-1 text-2xl font-bold">{k.value}</div>
            <div className="text-xs font-semibold text-[color:var(--success)]">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Funding pipeline">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" fontSize={12} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis fontSize={12} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {pipeline.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Domain mix">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={mix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {mix.map((_, i) => (
                    <Cell key={i} fill={colors[i]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {mix.map((m, i) => (
              <li key={m.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
                <span className="truncate">{m.name}</span>
                <span className="ml-auto text-muted-foreground">{m.value}%</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Innovation score trend">
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" fontSize={12} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <YAxis fontSize={12} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
}