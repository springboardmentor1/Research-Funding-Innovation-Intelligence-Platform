import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBarChart, FileSpreadsheet, FileText, Sparkles } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports & Exports — Lumen" }] }),
  component: ReportsPage,
});

const reports = [
  { title: "Funding pipeline report", desc: "Matched, applied, awarded funnel with forecast.", period: "Q1 2026", icon: FileBarChart },
  { title: "Research performance", desc: "Publications, citations and impact across teams.", period: "YTD", icon: FileText },
  { title: "Patent portfolio", desc: "Filings, grants, citations and competitor overlap.", period: "12 mo", icon: FileText },
  { title: "Innovation scorecard", desc: "Composite scores and improvement plan.", period: "Monthly", icon: Sparkles },
  { title: "Commercialization brief", desc: "Licensing, spinouts and partner opportunities.", period: "On demand", icon: FileText },
  { title: "Executive summary", desc: "Board-ready one-pager with AI narrative.", period: "Monthly", icon: FileBarChart },
];

function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader eyebrow="Reports & Exports" title="Portfolio-ready reports" description="Generate PDF, Excel or CSV with one click." actions={<button className="inline-flex h-11 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow"><Sparkles className="h-4 w-4" /> New AI report</button>} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <article key={r.title} className="glass rounded-3xl p-5 hover-lift">
              <div className="mb-3 flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">{r.period}</span>
              </div>
              <h3 className="text-base font-semibold">{r.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon={<FileText className="h-3.5 w-3.5" />}>PDF</Btn>
                <Btn icon={<FileSpreadsheet className="h-3.5 w-3.5" />}>Excel</Btn>
                <Btn icon={<Download className="h-3.5 w-3.5" />}>CSV</Btn>
              </div>
            </article>
          );
        })}
      </div>

      <SectionCard title="Recent exports">
        <ul className="divide-y divide-border/60 text-sm">
          {[
            { name: "Funding Pipeline — Feb 2026.pdf", size: "1.4 MB", when: "2h ago" },
            { name: "Patent Portfolio — Jan 2026.xlsx", size: "820 KB", when: "Yesterday" },
            { name: "Innovation Scorecard.csv", size: "42 KB", when: "3 days ago" },
          ].map((e) => (
            <li key={e.name} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 py-3">
              <div className="min-w-0 truncate font-medium">{e.name}</div>
              <div className="text-xs text-muted-foreground">{e.size}</div>
              <div className="text-xs text-muted-foreground">{e.when}</div>
              <button className="rounded-lg border border-border/60 px-2 py-1 text-xs">Download</button>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

function Btn({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary">
      {icon}
      {children}
    </button>
  );
}