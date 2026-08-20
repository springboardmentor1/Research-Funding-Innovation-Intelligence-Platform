import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Card from "../components/Card";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import { OpportunityStatusBadge } from "../components/StatusBadges";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../utils/validators";

function formatAmount(min, max, currency) {
  if (min == null && max == null) return "Amount not specified";
  const fmt = (n) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
  if (min != null && max != null) return `${currency} ${fmt(min)} – ${fmt(max)}`;
  return `${currency} ${fmt(min ?? max)}`;
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === "administrator" || user?.role === "innovation_manager";

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [myApplication, setMyApplication] = useState(null);
  const [applyNotes, setApplyNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      axiosClient.get(`/funding-opportunities/${id}`),
      axiosClient.get("/bookmarks/me", { params: { page: 1, page_size: 100 } }),
      axiosClient.get("/applications/me", { params: { page: 1, page_size: 100 } }),
    ])
      .then(([oppRes, bookmarksRes, appsRes]) => {
        setOpportunity(oppRes.data);
        setBookmarked(bookmarksRes.data.items.some((b) => b.opportunity_id === id));
        setMyApplication(appsRes.data.items.find((a) => a.opportunity_id === id) || null);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleToggleBookmark = async () => {
    try {
      if (bookmarked) {
        await axiosClient.delete(`/bookmarks/${id}`);
      } else {
        await axiosClient.post(`/bookmarks/${id}`);
      }
      setBookmarked((v) => !v);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await axiosClient.post(`/applications/opportunities/${id}`, { notes: applyNotes });
      setMyApplication(data);
      setMessage("Application submitted successfully.");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      const { data } = await axiosClient.patch(`/applications/${myApplication.id}/withdraw`);
      setMyApplication(data);
      setMessage("Application withdrawn.");
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this funding opportunity? This cannot be undone.")) return;
    try {
      await axiosClient.delete(`/funding-opportunities/${id}`);
      navigate("/funding", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <Layout maxWidth="max-w-3xl" className="py-16">
        <Loading className="text-center text-sm text-ink-900/50" />
      </Layout>
    );
  }

  if (!opportunity) {
    return (
      <Layout maxWidth="max-w-3xl" className="py-16 text-center text-sm text-signal-rose">
        {error || "Not found."}
      </Layout>
    );
  }

  return (
    <Layout maxWidth="max-w-3xl">
      <Link to="/funding" className="mb-4 inline-block text-sm text-ink-900/50 hover:text-ink-900">
        ← Back to Funding Discovery
      </Link>

      {message && (
        <div className="mb-4 rounded-lg border border-signal-emerald/20 bg-signal-emerald/5 px-4 py-3 text-sm text-signal-emeraldDark">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
          {error}
        </div>
      )}

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <OpportunityStatusBadge status={opportunity.status} />
              <span className="tag-chip">{opportunity.funding_source_type.replace(/_/g, " ")}</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">{opportunity.title}</h1>
            <p className="mt-1 text-sm text-ink-900/50">{opportunity.organization_name}</p>
          </div>
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`shrink-0 rounded-lg border p-2.5 transition ${
              bookmarked
                ? "border-signal-amber bg-signal-amberSoft text-signal-amber"
                : "border-ink-900/10 text-ink-900/30 hover:text-signal-amber"
            }`}
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Funding amount</p>
            <p className="mt-1 font-mono text-sm text-ink-900">
              {formatAmount(opportunity.amount_min, opportunity.amount_max, opportunity.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Deadline</p>
            <p className="mt-1 text-sm text-ink-900">{opportunity.application_deadline || "Rolling / not specified"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Views</p>
            <p className="mt-1 font-mono text-sm text-ink-900">{opportunity.view_count}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink-900">Description</h2>
          <p className="mt-1 whitespace-pre-line text-sm text-ink-900/70">{opportunity.description}</p>
        </div>

        {opportunity.eligibility_criteria && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink-900">Eligibility criteria</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-ink-900/70">{opportunity.eligibility_criteria}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-1.5">
          {[...opportunity.research_domains, ...opportunity.technology_areas].map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>

        {opportunity.attachment_url && (
          <a
            href={`${import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "")}${opportunity.attachment_url}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary mt-6 inline-flex"
          >
            Download attachment
          </a>
        )}

        {isManager && (
          <div className="mt-6 flex gap-3 border-t border-ink-900/8 pt-4">
            <Link to={`/funding/${id}/edit`} className="btn-secondary">Edit opportunity</Link>
            <button onClick={handleDelete} className="rounded-lg border border-signal-rose/30 px-4 py-2.5 text-sm font-semibold text-signal-rose transition hover:bg-signal-rose/5">
              Delete
            </button>
          </div>
        )}
      </Card>

      {/* Application section (non-managers) */}
      {!isManager && (
        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold text-ink-900">Your application</h2>

          {myApplication && myApplication.status !== "withdrawn" ? (
            <div className="mt-3">
              <p className="text-sm text-ink-900/70">
                Status: <span className="font-semibold capitalize">{myApplication.status.replace("_", " ")}</span>
              </p>
              {myApplication.reviewer_comment && (
                <p className="mt-1 text-sm text-ink-900/60">Reviewer comment: {myApplication.reviewer_comment}</p>
              )}
              {["submitted", "under_review"].includes(myApplication.status) && (
                <button onClick={handleWithdraw} className="btn-secondary mt-3">Withdraw application</button>
              )}
            </div>
          ) : opportunity.status === "published" ? (
            <form onSubmit={handleApply} className="mt-3 space-y-3">
              <textarea
                rows={3}
                className="field-input resize-none"
                placeholder="Add a note to your application (optional)"
                value={applyNotes}
                onChange={(e) => setApplyNotes(e.target.value)}
              />
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? "Submitting…" : "Apply now"}
              </button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-ink-900/50">This opportunity is not currently accepting applications.</p>
          )}
        </Card>
      )}
    </Layout>
  );
}
