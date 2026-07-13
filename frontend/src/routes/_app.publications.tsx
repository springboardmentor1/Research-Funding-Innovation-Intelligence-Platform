import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { BookOpen, ArrowRight } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_app/publications")({
  head: () => ({
    title: "Publications — Lumen",
  }),
  component: PublicationsPage,
});

function PublicationsPage() {
  const { user, token } = useAuth();

  const { data: publications, isLoading, error } = useQuery({
    queryKey: ["all-publications"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/api/v1/data/publications?limit=100", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error("Failed to fetch publications");
      return res.json();
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader
          title="Publications"
          description="Browse and manage research publications"
        />
        <SectionCard>Loading...</SectionCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6">
        <PageHeader
          title="Publications"
          description="Browse and manage research publications"
        />
        <SectionCard>Error loading publications.</SectionCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title="Publications"
        description="Browse and manage research publications"
      />
      <SectionCard title={`All Publications (${publications ? publications.length : 0})`}>
        {publications && publications.length > 0 ? (
          <div className="space-y-3">
            {publications.map((p: any) => (
              <div key={p.id} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{p.title}</h3>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] font-bold text-[color:var(--success)]">{p.citation_count || p.citations || 0} citations</div>
                      <div className="text-[11px] text-muted-foreground">{p.publication_year || p.year || "N/A"}</div>
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {p.authors_str || "Unknown"}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {p.journal || "Unknown"}
                  </p>
                  {p.abstract && (
                    <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                      {p.abstract}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No publications found.</p>
        )}
      </SectionCard>
    </div>
  );
}