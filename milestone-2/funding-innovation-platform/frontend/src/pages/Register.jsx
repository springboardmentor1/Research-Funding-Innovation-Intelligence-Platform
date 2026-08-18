import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  extractErrorMessage,
  validateEmail,
  validateFullName,
  validatePassword,
  validateUsername,
} from "../utils/validators";

const ROLE_OPTIONS = [
  { value: "researcher", label: "Researcher", blurb: "Discover funding, trends & patents" },
  { value: "startup_founder", label: "Startup Founder", blurb: "Find grants & commercialization paths" },
  { value: "innovation_manager", label: "Innovation Manager", blurb: "Track portfolios & pipelines" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    role: "researcher",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    const fullNameError = validateFullName(form.fullName);
    const emailError = validateEmail(form.email);
    const usernameError = validateUsername(form.username);
    const passwordError = validatePassword(form.password);
    if (fullNameError) next.fullName = fullNameError;
    if (emailError) next.email = emailError;
    if (usernameError) next.username = usernameError;
    if (passwordError) next.password = passwordError;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-emerald font-display text-sm font-bold text-white">
            I²
          </div>
          <span className="font-display text-lg font-semibold text-ink-900">Innovation Intelligence</span>
        </div>

        <div className="card-panel">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Create your account</h2>
          <p className="mt-1 text-sm text-ink-900/60">
            Join researchers, founders and innovation teams building on the platform.
          </p>

          {serverError && (
            <div className="mt-5 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  className="field-input"
                  placeholder="Ada Lovelace"
                  value={form.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <p className="mt-1 text-xs text-signal-rose">{errors.fullName}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  className="field-input"
                  placeholder="ada.lovelace"
                  value={form.username}
                  onChange={handleChange}
                />
                {errors.username && <p className="mt-1 text-xs text-signal-rose">{errors.username}</p>}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
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
                className="field-input"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <p className="mt-1 text-xs text-signal-rose">{errors.password}</p>}
            </div>

            <div>
              <span className="field-label">I am joining as a…</span>
              <div className="grid gap-2 sm:grid-cols-3">
                {ROLE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm transition ${
                      form.role === option.value
                        ? "border-signal-emerald bg-signal-emerald/5"
                        : "border-ink-900/10 hover:border-ink-900/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={form.role === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="block font-semibold text-ink-900">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-ink-900/50">{option.blurb}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-900/60">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-signal-emeraldDark hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
