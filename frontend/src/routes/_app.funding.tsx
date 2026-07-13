import { createFileRoute } from "@tanstack/react-router";
import {
  Bookmark,
  Calendar,
  Download,
  Filter,
  Globe2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_app/funding")({
  head: () => ({
    meta: [
      { title: "Funding Discovery — Lumen" },
      { name: "description", content: "AI-ranked grants, calls and awards matched to your research profile." },
    ],
  }),
  component: FundingPage,
});

const filters = ["All", "AI/ML", "Energy", "Health", "Materials", "Quantum", "Manufacturing"];

function FundingPage() {
  const { token } = useAuth();
  const { data: dbGrants } = useQuery({
    queryKey: ["grants"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/v1/data/grants", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch grants");
      return res.json();
    },
    retry: 1,
  });

  const displayGrants = dbGrants && dbGrants.length > 0 ? dbGrants : [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Funding Discovery"
        title="Grants, awards and calls matched to you"
        description="AI-ranked from 42,000+ live opportunities across 96 agencies."
        actions={
          <>
            <button className="inline-flex h-11 items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 text-sm font-medium">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-md hover-lift">
              <Sparkles className="h-4 w-4" /> Ask AI
            </button>
          </>
        }
      />

      <SectionCard>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search agency, program, keyword…"
              className="h-12 w-full rounded-xl border border-border/60 bg-background/60 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip icon={<Globe2 className="h-3.5 w-3.5" />}>Region: Global</Chip>
            <Chip icon={<Wallet className="h-3.5 w-3.5" />}>Amount: any</Chip>
            <Chip icon={<Calendar className="h-3.5 w-3.5" />}>Deadline: 90d</Chip>
            <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 px-3 text-xs font-semibold">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Advanced
            </button>
          </div>
        </div>
        <div className="mt-4 no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {filters.map((t, i) => (
            <button
              key={t}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                i === 0
                  ? "gradient-primary text-primary-foreground"
                  : "border border-border/60 bg-card/60 text-foreground/80 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          {displayGrants.length > 0 ? (
            displayGrants.map((f: any) => (
              <FundingCard key={f.id} f={f} />
            ))
          ) : (
            <SectionCard className="md:col-span-2" title="No Funding Data">
              <p className="text-sm text-muted-foreground">
                Run the data collector to fetch real funding opportunities from Grants.gov and other sources.
              </p>
            </SectionCard>
          )}
        </div>
        <div className="space-y-4">
          <SectionCard title="AI insight" description="Why these matches">
            <p className="text-sm text-muted-foreground">
              Your published work in <span className="font-semibold text-foreground">graph neural networks</span>{" "}
              and <span className="font-semibold text-foreground">catalyst discovery</span> aligns
              strongly with three open calls totalling{" "}
              <span className="font-semibold text-foreground">$19.4M</span>. Add a clinical co-PI to
              unlock 4 more matches.
            </p>
            <button className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
              <Sparkles className="h-3.5 w-3.5" /> Improve my profile
            </button>
          </SectionCard>
          <SectionCard title="Saved opportunities">
            <ul className="space-y-2 text-sm">
              {["NSF Convergence Accelerator", "Horizon Europe — Hydrogen"].map((s) => (
                <li key={s} className="flex items-center gap-2 rounded-lg border border-border/60 p-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <span className="truncate">{s}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Filters" description="Refine results" actions={<Filter className="h-4 w-4 text-muted-foreground" />}>
            <FilterGroup title="Amount">
              {[">$1M", "$1M–$5M", "$5M+"].map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" /> {a}
                </label>
              ))}
            </FilterGroup>
            <FilterGroup title="Deadline">
              {["30 days", "90 days", "6 months"].map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="deadline" /> {a}
                </label>
              ))}
            </FilterGroup>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Chip({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/60 bg-card/60 px-3 text-xs font-medium">
      {icon}
      {children}
    </button>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FundingCard({ f }: { f: any }) {
  const formatAmount = (amount: number | string | null | undefined) => {
    if (!amount) return "N/A";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(1)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  const formatDeadline = (deadline: string | Date | null | undefined) => {
    if (!deadline) return "N/A";
    const date = new Date(deadline);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const tags = f.tags ? (typeof f.tags === "string" ? f.tags.split(",") : f.tags) : [];

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-all hover-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {f.agency}
          </div>
          <h3 className="mt-1 text-base font-semibold leading-snug group-hover:text-primary">{f.title}</h3>
        </div>
        <div className="grid place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-[color:var(--ai)]/15 px-3 py-2 text-center">
          <div className="text-lg font-black text-primary">{f.match_score || 85}</div>
          <div className="text-[10px] font-semibold text-muted-foreground">MATCH</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t: string, i: number) => (
          <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/70">
            {t.trim()}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-y border-border/60 py-3 text-xs">
        <div>
          <div className="text-muted-foreground">Amount</div>
          <div className="font-semibold">{formatAmount(f.amount || f.max_amount)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Deadline</div>
          <div className="font-semibold">{formatDeadline(f.deadline || f.close_date)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Stage</div>
          <div className="font-semibold">{f.stage}</div>
        </div>
      </div>
      <p className="mt-3 flex items-start gap-2 rounded-xl bg-[color:var(--ai)]/8 p-3 text-xs text-foreground/80">
        <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--ai)]" />
        <span>{f.ai_brief || f.description || "AI-generated summary"}</span>
      </p>
      <div className="mt-4 flex items-center justify-between">
        <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary">
          <Bookmark className="h-3.5 w-3.5" /> Save
        </button>
        <button className="rounded-xl gradient-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow hover-lift">
          Start application
        </button>
      </div>
    </article>
  );
}
