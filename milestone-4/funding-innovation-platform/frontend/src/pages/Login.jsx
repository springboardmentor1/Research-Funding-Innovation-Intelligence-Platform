import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage, validateEmail } from "../utils/validators";

const ROLES = [
  {
    key: "researcher",
    label: "Researcher",
    heading: "Welcome back",
    subheading: "Sign in to your research workspace.",
    placeholder: "you@university.edu",
    redirect: "/dashboard",
    // Roles allowed when this tab is selected
    allowedRoles: ["researcher", "startup_founder", "innovation_manager"],
    errorMessage: "Please enter a valid Researcher email and password.",
  },
  {
    key: "administrator",
    label: "Administrator",
    heading: "Admin sign in",
    subheading: "Sign in to the platform administration panel.",
    placeholder: "admin@platform.com",
    redirect: "/admin",
    allowedRoles: ["administrator"],
    errorMessage: "Please enter a valid Administrator email and password.",
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeRole, setActiveRole] = useState("researcher");
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Controls the heading fade: toggled on every role switch to trigger the transition
  const [headingVisible, setHeadingVisible] = useState(true);
  const emailRef = useRef(null);

  const roleConfig = ROLES.find((r) => r.key === activeRole);

  const handleRoleChange = (key) => {
    if (key === activeRole) return;
    // Fade out heading, switch role, fade back in
    setHeadingVisible(false);
    setTimeout(() => {
      setActiveRole(key);
      setForm({ email: "", password: "" });
      setErrors({});
      setServerError("");
      setHeadingVisible(true);
    }, 150);
  };

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
      const data = await login(form);
      const returnedRole = data?.user?.role;

      // Route by the account's real role rather than the tab that happened
      // to be selected. The tabs are a UI convenience (heading/placeholder),
      // not an access gate -- actual permissions are enforced by the backend
      // (RBAC), so a valid administrator login must never be rejected just
      // because the "Researcher" tab was still active.
      const destinationByRole = returnedRole === "administrator" ? "/admin" : "/dashboard";
      const destination = location.state?.from?.pathname || destinationByRole;
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const activeIndex = ROLES.findIndex((r) => r.key === activeRole);

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

        {/* Right panel: role toggle + form */}
        <div className="bg-white p-8 sm:p-10">

          {/* Animated segmented toggle */}
          <div className="relative mb-6 flex rounded-lg border border-ink-900/10 bg-surface-50 p-1">
            {/* Sliding background indicator */}
            <span
              className="absolute inset-y-1 rounded-md bg-signal-emerald shadow-sm"
              style={{
                width: `calc(${100 / ROLES.length}% - 4px)`,
                left: `calc(${(activeIndex * 100) / ROLES.length}% + 4px)`,
                transition: "left 250ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            {ROLES.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => handleRoleChange(role.key)}
                className="relative z-10 flex-1 rounded-md py-2 text-sm font-semibold transition-colors duration-200"
                style={{
                  color: activeRole === role.key ? "#ffffff" : undefined,
                }}
              >
                <span
                  className={
                    activeRole === role.key
                      ? "text-white"
                      : "text-ink-900/50 hover:text-ink-900"
                  }
                  style={{ transition: "color 200ms ease" }}
                >
                  {role.label}
                </span>
              </button>
            ))}
          </div>

          {/* Heading with fade transition on role change */}
          <div
            style={{
              opacity: headingVisible ? 1 : 0,
              transition: "opacity 150ms ease",
            }}
          >
            <h2 className="font-display text-2xl font-semibold text-ink-900">{roleConfig.heading}</h2>
            <p className="mt-1 text-sm text-ink-900/60">{roleConfig.subheading}</p>
          </div>

          {/* Admin info banner */}
          {activeRole === "administrator" && (
            <div className="mt-4 rounded-lg border border-signal-amber/30 bg-signal-amberSoft px-4 py-3 text-xs text-signal-amber">
              Administrator access is restricted. Use your platform admin credentials.
            </div>
          )}

          {serverError && (
            <div className="mt-5 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="field-input"
                placeholder={roleConfig.placeholder}
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
              {submitting ? "Signing in…" : `Sign in as ${roleConfig.label}`}
            </button>
          </form>

          {activeRole === "researcher" && (
            <p className="mt-6 text-center text-sm text-ink-900/60">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-signal-emeraldDark hover:underline">
                Create one
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
