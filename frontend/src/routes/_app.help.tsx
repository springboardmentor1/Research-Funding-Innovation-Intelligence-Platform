import { createFileRoute } from "@tanstack/react-router";
import { Book, LifeBuoy, MessageSquare, PlayCircle, ArrowRight } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/help")({
  head: () => ({ meta: [{ title: "Help & Docs — Lumen" }] }),
  component: HelpPage,
});

const cards = [
  { icon: Book, title: "Documentation", body: "Guides, API and integration references." },
  { icon: PlayCircle, title: "Tutorials", body: "Short videos to master Lumen in 30 minutes." },
  { icon: MessageSquare, title: "Feedback", body: "Suggest features, upvote roadmap items." },
  { icon: LifeBuoy, title: "Contact support", body: "Response within 4 business hours." },
];

const faqs = [
  { q: "How is my innovation score calculated?", a: "A weighted composite across novelty, patent strength, tech maturity, market potential, funding fit and team quality." },
  { q: "Where does funding data come from?", a: "42,000+ live opportunities across 96 agencies, refreshed hourly." },
  { q: "Can I export reports to my board format?", a: "Yes — PDF, Excel, CSV, and custom-branded PowerPoint on Pro." },
  { q: "Is my data used to train models?", a: "No. Your uploads and prompts are private by default and never used for training." },
];

function HelpPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader eyebrow="Help Center" title="How can we help?" description="Docs, tutorials, FAQs, and direct support." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <a key={c.title} className="glass rounded-3xl p-5 hover-lift">
              <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-3 font-semibold">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.body}</div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </a>
          );
        })}
      </div>

      <SectionCard title="Frequently asked questions">
        <ul className="divide-y divide-border/60">
          {faqs.map((f) => (
            <li key={f.q} className="py-4">
              <div className="text-sm font-semibold">{f.q}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}