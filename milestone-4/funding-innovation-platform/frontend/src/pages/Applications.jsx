import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import { ApplicationStatusBadge } from "../components/StatusBadges";
import { extractErrorMessage } from "../utils/validators";

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export default function Applications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const fileInputRefs = useRef({});

  const load = () => {
    setLoading(true);
    axiosClient
      .get("/applications/me", { params: { status: status || undefined, page, page_size: 10 } })
      .then(({ data }) => setData(data))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, page]);

  const handleWithdraw = async (id) => {
    try {
      await axiosClient.patch(`/applications/${id}/withdraw`);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleUploadDocument = async (applicationId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axiosClient.post(`/applications/${applicationId}/document`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <Layout maxWidth="max-w-4xl">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-signal-emeraldDark">Application Tracker</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Your applications</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
          {error}
        </div>
      )}

      <select
        className="field-input mb-6 max-w-xs"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
      >
        {STATUS_FILTERS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {loading && <Loading />}
      {!loading && data?.items.length === 0 && (
        <EmptyState
          message="You haven't applied to any funding opportunities yet."
          action={{ to: "/funding", label: "Browse funding opportunities" }}
        />
      )}

      <div className="space-y-4">
        {!loading &&
          data?.items.map((app) => (
            <Card key={app.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/funding/${app.opportunity_id}`} className="font-display text-base font-semibold text-ink-900 hover:text-signal-emeraldDark">
                    {app.opportunity?.title || "Funding opportunity"}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-900/50">{app.opportunity?.organization_name}</p>
                </div>
                <ApplicationStatusBadge status={app.status} />
              </div>

              {app.notes && <p className="mt-2 text-sm text-ink-900/60">Your note: {app.notes}</p>}
              {app.reviewer_comment && (
                <p className="mt-2 text-sm text-ink-900/60">Reviewer comment: {app.reviewer_comment}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-ink-900/5 pt-3">
                <span className="text-xs text-ink-900/40">
                  Submitted {new Date(app.submitted_at).toLocaleDateString()}
                </span>

                {app.document_url ? (
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "")}${app.document_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-signal-emeraldDark hover:underline"
                  >
                    View uploaded document
                  </a>
                ) : (
                  <>
                    <input
                      ref={(el) => (fileInputRefs.current[app.id] = el)}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => handleUploadDocument(app.id, e.target.files?.[0])}
                    />
                    <button
                      onClick={() => fileInputRefs.current[app.id]?.click()}
                      className="text-xs font-medium text-signal-emeraldDark hover:underline"
                    >
                      Upload supporting document
                    </button>
                  </>
                )}

                {["submitted", "under_review"].includes(app.status) && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    className="ml-auto text-xs font-medium text-signal-rose hover:underline"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </Card>
          ))}
      </div>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}
    </Layout>
  );
}
