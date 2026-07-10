import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Shield,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Lumen" },
      {
        name: "description",
        content: "Your research funding, patents, innovation score and AI insights at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

const toneMap = {
  success: "text-[color:var(--success)] bg-[color:var(--success)]/10",
  primary: "text-primary bg-primary/10",
  info: "text-[color:var(--info)] bg-[color:var(--info)]/10",
  ai: "text-[color:var(--ai)] bg-[color:var(--ai)]/10",
  warning: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
} as const;

const iconMap = { wallet: Wallet, sparkles: Sparkles, shield: Shield, book: BookOpen };

function Dashboard() {
  const { user, token } = useAuth();
  const welcomeName = user ? user.name : "User";

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/v1/data/dashboard-stats", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    retry: 1,
  });

  const { data: dbGrants } = useQuery({
    queryKey: ["grants-limit"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/v1/data/grants?limit=3", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("Failed to fetch grants");
      return res.json();
    },
    retry: 1,
  });

  const dynamicKpis = [
    { id: "1", label: "Active Grants", value: stats ? `$${(stats.grants_amount_sum / 1e6).toFixed(1)}M` : "N/A", delta: stats ? `${stats.grants_count} opportunities` : "", icon: "wallet", tone: "success" },
    { id: "2", label: "Innovation Score", value: "N/A", delta: "", icon: "sparkles", tone: "ai" },
    { id: "3", label: "Patent Filings", value: stats ? String(stats.patents_count) : "0", delta: "", icon: "shield", tone: "info" },
    { id: "4", label: "Publications", value: stats ? String(stats.publications_count) : "0", delta: stats ? `${stats.citations_count} citations` : "", icon: "book", tone: "primary" },
  ];

  const displayGrants = dbGrants && dbGrants.length > 0
    ? dbGrants.map((dg: any) => ({
        id: dg.opportunity_id || dg.id,
        agency: dg.funding_agency || dg.agency || "US Gov",
        title: dg.title,
        match: String(dg.match_score || "94"),
        tags: [dg.category || "Research"],
        amount: (dg.max_amount || dg.amount) ? `$${((dg.max_amount || dg.amount) / 1e6).toFixed(1)}M` : "TBD",
        deadline: dg.close_date || dg.deadline || "Open",
        stage: dg.stage || "Grants.gov opportunity",
        ai: dg.description || dg.ai_brief ? (dg.description || dg.ai_brief).substring(0, 120) + "..." : "",
      }))
    : [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-[color:var(--ai)]/10 to-[color:var(--info)]/10 p-6 sm:p-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[color:var(--ai)]/20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/60 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI briefing ready
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Good morning, {welcomeName}.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Review your latest research insights, funding opportunities, and patent updates.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/funding"
                className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover-lift"
              >
                Review matches <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/patents"
                className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-card"
              >
                Patent Insights
              </Link>
            </div>
          </div>
          <div className="glass grid grid-cols-2 gap-3 rounded-2xl p-4 lg:w-[360px]">
            {dynamicKpis.map((k) => {
              const Icon = iconMap[k.icon as keyof typeof iconMap];
              return (
                <div key={k.id} className="rounded-xl bg-background/60 p-3">
                  <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneMap[k.tone]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{k.label}</div>
                  <div className="text-lg font-bold leading-tight">{k.value}</div>
                  <div className="text-[11px] font-semibold text-[color:var(--success)]">{k.delta}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Row 2: funding recommendations */}
      {displayGrants.length > 0 && (
        <SectionCard
          title="Recommended funding"
          description="Ranked by AI match against your profile and outputs"
          actions={
            <Link to="/funding" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayGrants.map((f) => (
              <FundingMini key={f.id} f={f} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Row 3: placeholders if no data */}
      {displayGrants.length === 0 && (
        <SectionCard title="Data Collection">
          <p className="text-muted-foreground">Run the data collector to fetch real funding, publications, and patents from external sources.</p>
        </SectionCard>
      )}
    </div>
  );
}

function FundingMini({ f }: { f: any }) {
  return (
    <Link
      to="/funding"
      className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card/60 p-4 transition-all hover-lift"
    >
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {f.agency}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ai)]/10 px-2 py-0.5 text-[10px] font-bold text-[color:var(--ai)]">
            <Zap className="h-3 w-3" /> {f.match}% match
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
          {f.title}
        </h3>
        {f.ai && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{f.ai}</p>}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
        <div>
          <div className="font-semibold">{f.amount}</div>
          <div className="text-muted-foreground">Due {f.deadline}</div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
      </div>
    </Link>
  );
}
