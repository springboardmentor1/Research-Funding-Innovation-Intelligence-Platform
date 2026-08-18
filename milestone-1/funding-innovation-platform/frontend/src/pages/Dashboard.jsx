import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const MODULE_PREVIEW = [
  { label: "Funding Discovery", status: "Milestone 2", tone: "bg-surface-100 text-ink-900/60" },
  { label: "Research Trend Intelligence", status: "Milestone 2", tone: "bg-surface-100 text-ink-900/60" },
  { label: "Patent Landscape Analysis", status: "Milestone 3", tone: "bg-surface-100 text-ink-900/60" },
  { label: "Innovation Scoring Engine", status: "Milestone 3", tone: "bg-surface-100 text-ink-900/60" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    axiosClient
      .get("/research-profile/me")
      .then(({ data }) => {
        if (mounted) setProfile(data);
      })
      .catch(() => {
        if (mounted) setProfileMissing(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const completeness = profile
    ? [
        profile.biography,
        profile.organization,
        profile.research_domains?.length,
        profile.keywords?.length,
        profile.technology_areas?.length,
      ].filter(Boolean).length
    : 0;
  const completenessPct = Math.round((completeness / 5) * 100);

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-signal-emeraldDark">Overview</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
            Welcome, {user?.full_name?.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-ink-900/60">
            Here's the current state of your innovation intelligence workspace.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile completeness card */}
          <div className="card-panel lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink-900">Research Profile</h2>
                <p className="mt-1 text-sm text-ink-900/60">
                  {loading
                    ? "Checking your profile status…"
                    : profileMissing
                    ? "You haven't set up your research profile yet."
                    : "Your profile powers funding matches and trend recommendations."}
                </p>
              </div>
              <Link to="/profile" className="btn-secondary">
                {profileMissing ? "Set up profile" : "Edit profile"}
              </Link>
            </div>

            {!loading && !profileMissing && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs text-ink-900/50">
                  <span>Profile completeness</span>
                  <span className="font-mono">{completenessPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100">
                  <div
                    className="h-full rounded-full bg-signal-emerald transition-all"
                    style={{ width: `${completenessPct}%` }}
                  />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Domains</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profile.research_domains?.length ? (
                        profile.research_domains.slice(0, 4).map((d) => (
                          <span key={d} className="tag-chip">{d}</span>
                        ))
                      ) : (
                        <span className="text-xs text-ink-900/40">None added yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Publications</p>
                    <p className="mt-2 font-mono text-2xl text-ink-900">{profile.publications?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Patents</p>
                    <p className="mt-2 font-mono text-2xl text-ink-900">{profile.patents?.length || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && profileMissing && (
              <div className="mt-6 rounded-lg border border-dashed border-ink-900/15 bg-surface-50 p-6 text-center">
                <p className="text-sm text-ink-900/60">
                  Add your research domains, keywords and publications to unlock funding
                  recommendations in upcoming milestones.
                </p>
                <Link to="/profile" className="btn-primary mt-4 inline-flex">
                  Create research profile
                </Link>
              </div>
            )}
          </div>

          {/* Account card */}
          <div className="card-panel">
            <h2 className="font-display text-lg font-semibold text-ink-900">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-900/50">Email</dt>
                <dd className="font-medium text-ink-900">{user?.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-900/50">Username</dt>
                <dd className="font-medium text-ink-900">@{user?.username}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-900/50">Role</dt>
                <dd className="font-medium capitalize text-ink-900">{user?.role?.replace("_", " ")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-900/50">Status</dt>
                <dd className="font-medium text-signal-emeraldDark">
                  {user?.is_active ? "Active" : "Inactive"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Upcoming modules */}
        <div className="mt-8 card-panel">
          <h2 className="font-display text-lg font-semibold text-ink-900">Platform Roadmap</h2>
          <p className="mt-1 text-sm text-ink-900/60">
            Milestone 1 delivers authentication, RBAC, and research profile management.
            These modules activate in upcoming milestones.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {MODULE_PREVIEW.map((mod) => (
              <div key={mod.label} className="flex items-center justify-between rounded-lg border border-ink-900/8 px-4 py-3">
                <span className="text-sm font-medium text-ink-900">{mod.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${mod.tone}`}>{mod.status}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
