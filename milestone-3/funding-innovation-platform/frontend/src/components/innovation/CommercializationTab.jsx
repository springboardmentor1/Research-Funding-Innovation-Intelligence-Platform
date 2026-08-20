import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Card from "../Card";
import EmptyState from "../EmptyState";
import Loading from "../Loading";
import Pagination from "../Pagination";
import { RecommendationTypeBadge } from "../InnovationBadges";
import { extractErrorMessage } from "../../utils/validators";

export default function CommercializationTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);
  const [includeDismissed, setIncludeDismissed] = useState(false);
  const [page, setPage] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const load = () => {
    setLoading(true);
    axiosClient
      .get("/commercialization/me", { params: { include_dismissed: includeDismissed, page, page_size: 10 } })
      .then(({ data }) => setData(data))
      .catch((err) => {
        if (err.response?.status === 404) setNoProfile(true);
        else setError(extractErrorMessage(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [includeDismissed, page]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await axiosClient.post("/commercialization/me/generate");
      if (data.length === 0) {
        setMessage("No new recommendations right now — your current innovation score doesn't yet meet any rule's thresholds. Try again after adding more publications, patents, or applications.");
      } else {
        setMessage(`Generated ${data.length} new recommendation${data.length > 1 ? "s" : ""}.`);
      }
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleDismiss = async (id) => {
    await axiosClient.patch(`/commercialization/${id}/dismiss`);
    load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-ink-900">Commercialization Recommendations</h3>
            <p className="mt-0.5 text-xs text-ink-900/50">
              Generated from your latest innovation score — productization, licensing, startup creation, and industry partnership signals.
            </p>
          </div>
          {!noProfile && (
            <button onClick={handleGenerate} disabled={generating} className="btn-primary shrink-0 text-xs">
              {generating ? "Generating…" : "Generate recommendations"}
            </button>
          )}
        </div>

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

        {!noProfile && (
          <label className="mb-4 flex items-center gap-2 text-sm text-ink-900/70">
            <input
              type="checkbox"
              checked={includeDismissed}
              onChange={(e) => { setPage(1); setIncludeDismissed(e.target.checked); }}
              className="h-4 w-4 rounded border-ink-900/20 text-signal-emerald focus:ring-signal-emerald/30"
            />
            Show dismissed
          </label>
        )}

        {loading && <Loading className="py-6 text-center text-sm text-ink-900/40" />}
        {!loading && noProfile && (
          <EmptyState
            message="Set up your Research Profile first to generate commercialization recommendations."
            className="py-6 text-center text-sm text-ink-900/50"
          />
        )}
        {!loading && !noProfile && data?.items.length === 0 && (
          <EmptyState
            message={'No recommendations yet — click "Generate recommendations" above.'}
            className="py-6 text-center text-sm text-ink-900/40"
          />
        )}

        <div className="space-y-3">
          {!loading &&
            data?.items.map((r) => (
              <div key={r.id} className={`rounded-lg border border-ink-900/8 p-4 ${r.is_dismissed ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <RecommendationTypeBadge type={r.recommendation_type} />
                      <span className="font-mono text-xs text-ink-900/40">{r.confidence_score}% confidence</span>
                    </div>
                    <p className="text-sm font-semibold text-ink-900">{r.title}</p>
                    <p className="mt-1 text-sm text-ink-900/60">{r.rationale}</p>
                  </div>
                  {!r.is_dismissed && (
                    <button onClick={() => handleDismiss(r.id)} className="shrink-0 text-xs font-medium text-ink-900/40 hover:text-signal-rose">
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
