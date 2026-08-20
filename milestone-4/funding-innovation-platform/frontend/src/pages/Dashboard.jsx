import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Card from "../components/Card";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "administrator";

  const [profile, setProfile] = useState(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }
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
  }, [isAdmin]);

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
    <Layout>
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
        {/* Admin workspace card, or profile completeness card for everyone else */}
        {isAdmin ? (
          <Card className="lg:col-span-2">
            <h2 className="font-display text-lg font-semibold text-ink-900">Administrator Workspace</h2>
            <p className="mt-1 text-sm text-ink-900/60">
              Manage the platform, review analytics, and generate reports.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link to="/admin" className="rounded-lg border border-ink-900/8 px-4 py-3 text-sm font-medium text-ink-900 hover:border-signal-emerald/40">
                Manage Users
              </Link>
              <Link to="/admin" className="rounded-lg border border-ink-900/8 px-4 py-3 text-sm font-medium text-ink-900 hover:border-signal-emerald/40">
                Platform Analytics
              </Link>
              <Link to="/admin" className="rounded-lg border border-ink-900/8 px-4 py-3 text-sm font-medium text-ink-900 hover:border-signal-emerald/40">
                Reports & Export
              </Link>
            </div>
          </Card>
        ) : (
        <Card className="lg:col-span-2">
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
        </Card>
        )}

        {/* Account card */}
        <Card>
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
        </Card>
      </div>

      <RoleDashboardSection role={user?.role} />
    </Layout>
  );
}

function RoleDashboardSection({ role }) {
  if (role === "administrator") return <AdminSnapshot />;
  if (role === "innovation_manager") return <InnovationManagerSnapshot />;
  return <RecommendedFundingSnapshot />;
}

function AdminSnapshot() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    let mounted = true;
    axiosClient
      .get("/admin/analytics/overview")
      .then(({ data }) => mounted && setOverview(data))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    { label: "Total Users", value: overview?.total_users },
    { label: "Funding Opportunities", value: overview?.total_opportunities },
    { label: "Applications", value: overview?.total_applications },
    { label: "Bookmarks", value: overview?.total_bookmarks },
  ];

  return (
    <Card className="mt-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">Platform Snapshot</h2>
          <p className="mt-1 text-sm text-ink-900/60">Headline numbers across the whole platform.</p>
        </div>
        <Link to="/admin" className="btn-secondary">View full analytics</Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-ink-900/8 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">{s.label}</p>
            <p className="mt-1 font-mono text-2xl text-ink-900">{s.value ?? "—"}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InnovationManagerSnapshot() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    let mounted = true;
    axiosClient
      .get("/innovation-score/leaderboard")
      .then(({ data }) => mounted && setLeaders(data.slice(0, 5)))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card className="mt-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">Innovation Leaderboard</h2>
          <p className="mt-1 text-sm text-ink-900/60">Top researcher profiles by innovation score.</p>
        </div>
        <Link to="/innovation" className="btn-secondary">Open Innovation Hub</Link>
      </div>
      <div className="mt-5 space-y-2">
        {leaders.length === 0 && (
          <p className="text-sm text-ink-900/40">No scored profiles yet.</p>
        )}
        {leaders.map((entry, i) => (
          <div key={entry.profile_id} className="flex items-center justify-between rounded-lg border border-ink-900/8 px-4 py-3">
            <span className="text-sm font-medium text-ink-900">
              {i + 1}. {entry.researcher_full_name}
            </span>
            <span className="font-mono text-sm text-signal-emeraldDark">{entry.overall_score.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecommendedFundingSnapshot() {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    let mounted = true;
    axiosClient
      .get("/funding-opportunities/recommended/me")
      .then(({ data }) => mounted && setOpportunities(data.slice(0, 5)))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card className="mt-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">Recommended Funding</h2>
          <p className="mt-1 text-sm text-ink-900/60">Opportunities matched to your research profile.</p>
        </div>
        <Link to="/funding" className="btn-secondary">Browse all funding</Link>
      </div>
      <div className="mt-5 space-y-2">
        {opportunities.length === 0 && (
          <p className="text-sm text-ink-900/40">
            No recommendations yet — complete your research profile to unlock matches.
          </p>
        )}
        {opportunities.map((opp) => (
          <div key={opp.id} className="flex items-center justify-between rounded-lg border border-ink-900/8 px-4 py-3">
            <span className="text-sm font-medium text-ink-900">{opp.title}</span>
            <span className="text-xs text-ink-900/50">{opp.organization_name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
