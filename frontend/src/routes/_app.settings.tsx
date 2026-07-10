import { createFileRoute } from "@tanstack/react-router";
import { Bell, Key, Lock, Palette, Shield, User, Zap, LogOut } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Lumen" }] }),
  component: SettingsPage,
});

const tabs = [
  { icon: User, label: "Profile" },
  { icon: Palette, label: "Appearance" },
  { icon: Bell, label: "Notifications" },
  { icon: Shield, label: "Security" },
  { icon: Key, label: "API keys" },
  { icon: Lock, label: "Privacy" },
  { icon: Zap, label: "Integrations" },
];

function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orcid, setOrcid] = useState("");
  const [organization, setOrganization] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setOrcid(user.orcid || "");
      setOrganization(user.organization || "");
      setDomain(user.domain || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        email,
        orcid,
        organization,
        domain,
      });
      toast.success("Profile saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (n: string) => {
    if (!n) return "LU";
    return n.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader eyebrow="Settings" title="Preferences & account" description="Tune Lumen to your workflow." />
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <SectionCard>
          <ul className="space-y-1">
            {tabs.map((t, i) => {
              const Icon = t.icon;
              return (
                <li key={t.label}>
                  <button className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm ${i === 0 ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted"}`}>
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <hr className="my-4 border-border/60" />
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </SectionCard>
        
        <div className="space-y-6">
          <form onSubmit={handleSubmit}>
            <SectionCard 
              title="Profile" 
              description="Public research profile"
              actions={
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              }
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="grid h-20 w-20 place-items-center rounded-2xl gradient-primary text-xl font-bold text-primary-foreground">
                  {user ? getInitials(name) : "LU"}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{name || "Research Profile"}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.role.toUpperCase().replace("_", " ")} {organization ? `· ${organization}` : ""}
                  </div>
                  <button type="button" className="mt-2 rounded-xl border border-border/60 px-3 py-1.5 text-xs font-semibold">Change photo</button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Full name</span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-border/60 bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Email address</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-border/60 bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Organization / Institution</span>
                  <input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Regents Research Lab"
                    className="mt-1 h-11 w-full rounded-xl border border-border/60 bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted-foreground">Research Domain</span>
                  <input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. Materials + Machine Learning"
                    className="mt-1 h-11 w-full rounded-xl border border-border/60 bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-white"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-semibold text-muted-foreground">ORCID iD</span>
                  <input
                    value={orcid}
                    onChange={(e) => setOrcid(e.target.value)}
                    placeholder="e.g. 0000-0002-1825-0097"
                    className="mt-1 h-11 w-full rounded-xl border border-border/60 bg-background/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-white"
                  />
                </label>
              </div>
            </SectionCard>
          </form>

          <SectionCard title="Notifications">
            {["New funding matches", "Patent citations", "Weekly AI brief", "Team activity"].map((n, i) => (
              <Toggle key={n} label={n} on={i !== 3} />
            ))}
          </SectionCard>

          <SectionCard title="Appearance">
            <div className="grid grid-cols-3 gap-3">
              {["Light", "Dark", "System"].map((t, i) => (
                <button key={t} className={`rounded-2xl border p-4 text-left text-sm ${i === 2 ? "border-primary ring-2 ring-primary/30" : "border-border/60"}`}>
                  <div className="mb-2 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-[color:var(--ai)]/30" />
                  <div className="font-semibold">{t}</div>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="API keys" description="For programmatic access to Lumen">
            <div className="rounded-xl border border-border/60 p-3 font-mono text-xs">lmn_live_••••••••••••••••8f42</div>
            <div className="mt-3 flex gap-2">
              <button type="button" className="rounded-xl border border-border/60 px-3 py-1.5 text-xs font-semibold">Rotate</button>
              <button type="button" className="rounded-xl gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Create key</button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, on }: { label: string; on?: boolean }) {
  const [active, setActive] = useState(!!on);
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-b-0">
      <span className="text-sm">{label}</span>
      <button 
        type="button"
        onClick={() => setActive(!active)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${active ? "gradient-primary" : "bg-muted"}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${active ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}