import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Lumen" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#07090e] px-4 py-12 text-foreground">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[color:var(--ai)]/20 blur-[100px]" />

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[color:var(--ai)] text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your intelligence dashboard
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
              </div>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-4 pr-12 text-sm text-white placeholder-white/30 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl gradient-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create one for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
