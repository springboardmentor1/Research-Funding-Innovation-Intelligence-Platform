import { Sparkles, X, ArrowUp } from "lucide-react";
import { useState } from "react";

const prompts = [
  "Find grants matching my last 3 papers",
  "Summarize this week's patent citations",
  "What technologies are gaining momentum in energy?",
  "Draft a commercialization brief for EP4,102,884",
];

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI assistant"
        className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-2xl gradient-ai text-primary-foreground shadow-2xl animate-pulse-ring lg:bottom-6 lg:right-6"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>
      {open && (
        <div className="fixed bottom-40 right-4 z-40 w-[min(92vw,380px)] overflow-hidden rounded-3xl glass-strong lg:bottom-24 lg:right-6">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl gradient-ai text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Lumen AI</div>
              <div className="text-[11px] text-muted-foreground">Context: Regents Research Lab</div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Try asking</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  className="rounded-full border border-border/70 bg-card/50 px-3 py-1.5 text-xs text-foreground/80 hover:bg-primary/10 hover:text-primary"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-border/60 p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 pl-3 pr-1">
              <input
                placeholder="Ask Lumen anything…"
                aria-label="Message Lumen AI"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                aria-label="Send"
                className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}