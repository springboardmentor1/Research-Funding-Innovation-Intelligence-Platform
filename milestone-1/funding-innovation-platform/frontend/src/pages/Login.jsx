import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage, validateEmail } from "../utils/validators";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    const emailError = validateEmail(form.email);
    if (emailError) next.email = emailError;
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(form);
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-xl2 shadow-panel md:grid-cols-2">
        {/* Left panel: brand / value framing */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-ink-900 to-ink-950 p-10 text-white md:flex">
          <div>
            <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-signal-emerald font-display text-lg font-bold">
              I²
            </div>
            <h1 className="font-display text-3xl font-semibold leading-tight">
              Research funding meets innovation intelligence.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Track funding opportunities, research trends, and patent landscapes
              in one centralized workspace built for researchers and innovators.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-4 text-xs text-white/50">
            <div>
              <dt className="font-mono text-lg text-white">04</dt>
              <dd>User roles</dd>
            </div>
            <div>
              <dt className="font-mono text-lg text-white">RBAC</dt>
              <dd>Access control</dd>
            </div>
            <div>
              <dt className="font-mono text-lg text-white">JWT</dt>
              <dd>Secure sessions</dd>
            </div>
          </dl>
        </div>

        {/* Right panel: form */}
        <div className="bg-white p-8 sm:p-10">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-900/60">Sign in to your innovation intelligence workspace.</p>

          {serverError && (
            <div className="mt-5 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="field-input"
                placeholder="you@university.edu"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className="mt-1 text-xs text-signal-rose">{errors.email}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="field-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <p className="mt-1 text-xs text-signal-rose">{errors.password}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-900/60">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-signal-emeraldDark hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
