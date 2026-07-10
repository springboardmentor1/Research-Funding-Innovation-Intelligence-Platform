import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArrowUp, Search } from "lucide-react";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({ meta: [{ title: "Messages — Lumen" }] }),
  component: MessagesPage,
});

const chats = [
  { name: "Priya Menon", last: "Sent the revised GNN benchmarks.", time: "2m", unread: 2 },
  { name: "NSF Program Office", last: "Confirming your abstract format…", time: "1h", unread: 0 },
  { name: "Marcus Lee", last: "Board deck ready for review.", time: "3h", unread: 0 },
  { name: "Kenji Watanabe", last: "Happy to co-author. Timeline?", time: "1d", unread: 0 },
];

function MessagesPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader eyebrow="Messages" title="Team & collaborators" />
      <div className="glass grid h-[calc(100dvh-260px)] min-h-[520px] grid-cols-[minmax(0,320px)_minmax(0,1fr)] overflow-hidden rounded-3xl">
        <aside className="flex flex-col border-r border-border/60">
          <div className="border-b border-border/60 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search chats…" className="h-10 w-full rounded-xl border border-border/60 bg-background/60 pl-9 pr-3 text-sm outline-none" />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {chats.map((c, i) => (
              <li key={c.name}>
                <button className={`flex w-full items-start gap-3 border-b border-border/60 p-3 text-left ${i === 0 ? "bg-primary/5" : "hover:bg-muted"}`}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-xs font-bold">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-semibold">{c.name}</span>
                      <span className="text-[11px] text-muted-foreground">{c.time}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{c.last}</div>
                  </div>
                  {c.unread > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{c.unread}</span>}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <section className="flex flex-col">
          <header className="border-b border-border/60 p-4">
            <div className="text-sm font-semibold">Priya Menon</div>
            <div className="text-xs text-muted-foreground">Postdoc · GNNs · online</div>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <Bubble mine={false}>Pushed the latest benchmarks to the shared repo.</Bubble>
            <Bubble mine>Looks great. Can you rerun on the perovskite subset?</Bubble>
            <Bubble mine={false}>Kicking off now — should be ready in ~1h.</Bubble>
          </div>
          <footer className="border-t border-border/60 p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/60 pl-3 pr-1">
              <input placeholder="Message Priya…" className="h-11 flex-1 bg-transparent text-sm outline-none" />
              <button className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground"><ArrowUp className="h-4 w-4" /></button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

function Bubble({ mine, children }: { mine?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "gradient-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>{children}</div>
    </div>
  );
}