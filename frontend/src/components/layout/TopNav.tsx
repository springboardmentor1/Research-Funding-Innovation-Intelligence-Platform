import { Bell, Command, Menu, Moon, Search, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

// Helper function to get user initials
const getUserInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get display role
const getDisplayRole = (role: string) => {
  switch (role) {
    case "researcher":
      return "Researcher";
    case "startup_founder":
      return "Startup Founder";
    case "innovation_manager":
      return "Innovation Manager";
    case "administrator":
      return "Administrator";
    default:
      return "User";
  }
};

export function TopNav({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const [dark, setDark] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="grid h-11 w-11 place-items-center rounded-xl border border-border/60 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden text-sm text-muted-foreground lg:block">
          <span className="text-foreground/60">Workspace</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">Regents Research Lab</span>
        </div>
        <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search funding, patents, technologies, researchers…"
              aria-label="Global search"
              className="h-11 w-full rounded-xl border border-border/70 bg-card/60 pl-10 pr-16 text-sm outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-2"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
              <Command className="h-3 w-3" /> K
            </kbd>
          </div>
          <button
            onClick={() => setDark((v) => !v)}
            aria-label="Toggle theme"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border/60 hover:bg-muted"
          >
            {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          <button
            aria-label="Notifications"
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border/60 hover:bg-muted"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[color:var(--warning)] ring-2 ring-background" />
          </button>
          {user && (
            <div className="hidden items-center gap-3 rounded-xl border border-border/60 px-2.5 py-1.5 sm:flex">
              <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-xs font-bold text-primary-foreground">
                {getUserInitials(user.name)}
              </div>
              <div className="hidden pr-1 text-left leading-tight md:block">
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-[11px] text-muted-foreground">{getDisplayRole(user.role)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}