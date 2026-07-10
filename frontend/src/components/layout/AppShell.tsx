import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { FloatingAssistant } from "./FloatingAssistant";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 hero-bg" />
      <div className="flex min-h-dvh">
        <div className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
          <Sidebar />
        </div>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-72">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav onOpenSidebar={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
        </div>
      </div>
      <BottomNav />
      <FloatingAssistant />
    </div>
  );
}
