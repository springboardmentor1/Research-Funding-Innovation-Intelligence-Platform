import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, UserRole } from "../context/AuthContext";
import { Sparkles, ArrowRight, User, Briefcase, Zap, Shield } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — Lumen" }] }),
  component: RegisterPage,
});

const rolesList: { value: UserRole; label: string; description: string; icon: any }[] = [
  { value: "researcher", label: "Researcher", description: "Discover grants and track citations", icon: User },
  { value: "startup_founder", label: "Startup Founder", description: "Evaluate patents and commercialization", icon: Zap },
  { value: "innovation_manager", label: "Innovation Manager", description: "Scan technology trends and pipelines", icon: Briefcase },
  { value: "administrator", label: "Administrator", description: "Manage intelligence pipeline models", icon: Shield },
];

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("researcher");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register(name, email, password, selectedRole);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#07090e] px-4 py-12 text-foreground">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[color:var(--ai)]/20 blur-[100px]" />

      <div className="relative w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[color:var(--ai)] text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started with AI-driven innovation intelligence
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Elena Ríos"
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@domain.com"
                  className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Choose your focus area / Role
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {rolesList.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`flex text-left items-start gap-3 rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-white/10 bg-white/[0.01] hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${isSelected ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">{r.label}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground leading-snug">{r.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl gradient-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? "Creating account..." : "Register"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
