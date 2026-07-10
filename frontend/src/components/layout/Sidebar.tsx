import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Shield,
  Cpu,
  Sparkles,
  Rocket,
  MessageSquare,
  Search,
  Bell,
  FileBarChart,
  BarChart3,
  Bookmark,
  Calendar,
  Users,
  UserCog,
  FolderKanban,
  Settings,
  HelpCircle,
  Beaker,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; tone?: "ai" | "primary" | "warning" };

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const isAdmin = user?.role === "administrator";

  const groups: { label: string; items: Item[] }[] = [
    {
      label: "Workspace",
      items: [
        { to: "/", label: "Dashboard", icon: LayoutDashboard },
        { to: "/search", label: "Global Search", icon: Search },
        { to: "/assistant", label: "AI Assistant", icon: Sparkles, tone: "ai", badge: "New" },
      ],
    },
    {
      label: "Intelligence",
      items: [
        { to: "/funding", label: "Funding Discovery", icon: Wallet, badge: "12" },
        { to: "/trends", label: "Research Trends", icon: TrendingUp },
        { to: "/patents", label: "Patent Intelligence", icon: Shield },
        { to: "/technology", label: "Technology Radar", icon: Cpu },
        { to: "/innovation-score", label: "Innovation Score", icon: Beaker, tone: "ai" },
        { to: "/commercialization", label: "Commercialization", icon: Rocket },
      ],
    },
    {
      label: "Manage",
      items: [
        { to: "/analytics", label: "Analytics", icon: BarChart3 },
        { to: "/reports", label: "Reports & Exports", icon: FileBarChart },
        { to: "/notifications", label: "Notifications", icon: Bell, badge: "4" },
        { to: "/saved", label: "Saved & Bookmarks", icon: Bookmark },
        { to: "/calendar", label: "Calendar", icon: Calendar },
        { to: "/team", label: "Team Workspace", icon: Users },
        { to: "/projects", label: "Projects", icon: FolderKanban },
        { to: "/messages", label: "Messages", icon: MessageSquare },
        ...(isAdmin ? [{ to: "/users", label: "User Management", icon: UserCog, badge: "Admin" }] : []),
      ],
    },
    {
      label: "Account",
      items: [
        { to: "/settings", label: "Settings", icon: Settings },
        { to: "/help", label: "Help & Docs", icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside className="glass-strong flex h-full w-72 flex-col rounded-none border-r border-border/60 lg:rounded-r-3xl">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-lg">
          <Beaker className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-bold tracking-tight">Lumen</div>
          <div className="truncate text-xs text-muted-foreground">Research & Innovation Intelligence</div>
        </div>
      </div>
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-6">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {g.label}
            </div>
            <ul className="space-y-1">
              {g.items.map((item) => {
                const active = pathname === item.to;
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                        "text-foreground/70 hover:bg-sidebar-accent hover:text-foreground",
                        active && "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4.5 w-4.5 h-[18px] w-[18px] shrink-0 transition-colors",
                          item.tone === "ai" && "text-[color:var(--ai)]",
                          active && "text-primary",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            item.tone === "ai"
                              ? "bg-[color:var(--ai)]/15 text-[color:var(--ai)]"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="mx-3 mb-4 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-[color:var(--ai)]/10 to-transparent p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Upgrade to Lumen Pro
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Unlimited AI briefs, patent alerts and portfolio-level analytics.
        </p>
        <button className="mt-3 w-full rounded-xl gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-md hover-lift">
          See plans
        </button>
      </div>
    </aside>
  );
}