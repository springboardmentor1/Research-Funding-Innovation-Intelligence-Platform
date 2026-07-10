import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, Paperclip, Sparkles, FileText, Compass, BookOpen, Rocket } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/assistant")({
  head: () => ({ meta: [{ title: "AI Research Assistant — Lumen" }] }),
  component: AssistantPage,
});

const suggested = [
  { icon: Compass, label: "Find funding for my last 3 papers" },
  { icon: BookOpen, label: "Summarize this week's citations" },
  { icon: FileText, label: "Draft a commercialization brief" },
  { icon: Rocket, label: "Identify licensees for EP4,102,884" },
];

const conversation = [
  { role: "user", text: "What are the strongest grants matching my catalyst work this quarter?" },
  {
    role: "assistant",
    text: "You have three high-fit opportunities totaling **$19.4M**. The strongest is the NSF Convergence Accelerator (**96% match**), driven by direct overlap with your GNN-catalyst papers and repeat citations from the program directors. Two Horizon Europe calls close in April; adding a German co-PI would qualify you as lead.",
  },
  { role: "user", text: "Draft an outreach note to a German co-PI." },
];

function AssistantPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="AI Research Assistant"
        title="Lumen AI"
        description="Ask about funding, patents, trends, or your own portfolio. Every answer is cited."
      />
      <div className="glass flex h-[calc(100dvh-260px)] min-h-[520px] flex-col overflow-hidden rounded-3xl">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {conversation.map((m, i) => (
              <MessageBubble key={i} role={m.role as "user" | "assistant"} text={m.text} />
            ))}
            <AssistantTyping />
          </div>
        </div>
        <div className="border-t border-border/60 p-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggested.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-card/70 p-2 shadow-lg focus-within:ring-2 focus-within:ring-primary/30">
              <button aria-label="Attach" className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted">
                <Paperclip className="h-4 w-4" />
              </button>
              <textarea
                rows={1}
                placeholder="Message Lumen AI…"
                aria-label="Message"
                className="min-h-[40px] flex-1 resize-none bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                aria-label="Send message"
                className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Lumen AI cites 60M+ papers, 90M patents and 42k live grants. Verify before acting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground shadow">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-ai text-primary-foreground shadow">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md text-sm leading-relaxed text-foreground/90">
        {text.split("**").map((chunk, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="font-semibold text-foreground">
              {chunk}
            </strong>
          ) : (
            <span key={i}>{chunk}</span>
          ),
        )}
      </div>
    </div>
  );
}

function AssistantTyping() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-ai text-primary-foreground">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex gap-1 rounded-2xl rounded-tl-md bg-muted px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}