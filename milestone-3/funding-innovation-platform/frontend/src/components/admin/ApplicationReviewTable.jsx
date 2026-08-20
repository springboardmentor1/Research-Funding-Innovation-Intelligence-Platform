import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Card from "../Card";
import EmptyState from "../EmptyState";
import Loading from "../Loading";
import Pagination from "../Pagination";
import { ApplicationStatusBadge } from "../StatusBadges";
import { extractErrorMessage } from "../../utils/validators";

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const REVIEW_ACTIONS = ["under_review", "accepted", "rejected"];

export default function ApplicationReviewTable() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});

  const load = () => {
    setLoading(true);
    axiosClient
      .get("/applications", { params: { status: status || undefined, page, page_size: 10 } })
      .then(({ data }) => setData(data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, page]);

  const handleReview = async (applicationId, newStatus) => {
    try {
      await axiosClient.patch(`/applications/${applicationId}/review`, {
        status: newStatus,
        reviewer_comment: comments[applicationId] || null,
      });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink-900">Review applications</h2>
        <select
          className="field-input max-w-xs"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {STATUS_FILTERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
          {error}
        </div>
      )}

      {loading && <Loading />}
      {!loading && data?.items.length === 0 && <EmptyState message="No applications match this filter." />}

      <div className="space-y-3">
        {!loading &&
          data?.items.map((app) => (
            <Card key={app.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/funding/${app.opportunity_id}`} className="font-semibold text-ink-900 hover:text-signal-emeraldDark">
                    {app.opportunity?.title || "Funding opportunity"}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-900/50">
                    Applicant: {app.applicant?.full_name} ({app.applicant?.email})
                  </p>
                </div>
                <ApplicationStatusBadge status={app.status} />
              </div>

              {app.notes && <p className="mt-2 text-sm text-ink-900/60">Applicant note: {app.notes}</p>}

              {app.status !== "withdrawn" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-900/5 pt-3">
                  <input
                    className="field-input flex-1 py-1.5 text-xs"
                    placeholder="Reviewer comment (optional)"
                    value={comments[app.id] || ""}
                    onChange={(e) => setComments((c) => ({ ...c, [app.id]: e.target.value }))}
                  />
                  {REVIEW_ACTIONS.filter((a) => a !== app.status).map((action) => (
                    <button
                      key={action}
                      onClick={() => handleReview(app.id, action)}
                      className="btn-secondary shrink-0 text-xs capitalize"
                    >
                      {action.replace("_", " ")}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ))}
      </div>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}
    </div>
  );
}
