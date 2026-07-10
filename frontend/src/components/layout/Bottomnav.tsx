import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Wallet, Sparkles, Shield, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/funding", label: "Funding", icon: Wallet },
  { to: "/assistant", label: "Ask AI", icon: Sparkles, ai: true },
  { to: "/patents", label: "Patents", icon: Shield },
  { to: "/notifications", label: "Alerts", icon: Bell },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.to;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                    it.ai && "gradient-ai text-primary-foreground shadow-lg",
                    !it.ai && active && "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}