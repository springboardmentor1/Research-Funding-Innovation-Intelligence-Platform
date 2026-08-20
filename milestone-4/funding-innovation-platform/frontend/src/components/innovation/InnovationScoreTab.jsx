import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Card from "../Card";
import EmptyState from "../EmptyState";
import Loading from "../Loading";
import MiniBarChart from "../MiniBarChart";
import Pagination from "../Pagination";
import { extractErrorMessage } from "../../utils/validators";

function ScoreBreakdown({ score }) {
  const components = [
    { label: "Research Novelty (30%)", count: score.research_novelty },
    { label: "Patent Strength (20%)", count: score.patent_strength },
    { label: "Technology Maturity (15%)", count: score.technology_maturity },
    { label: "Market Potential (20%)", count: score.market_potential },
    { label: "Funding Relevance (15%)", count: score.funding_relevance },
  ];
  return (
    <div>
      <div className="mb-4 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-semibold text-ink-900">{Number(score.overall_score).toFixed(1)}</span>
        <span className="text-sm text-ink-900/50">/ 100 overall innovation score</span>
      </div>
      <MiniBarChart data={components} labelKey="label" valueKey="count" />
      <p className="mt-3 text-xs text-ink-900/40">
        Computed {new Date(score.computed_at).toLocaleString()}
      </p>
    </div>
  );
}

export default function InnovationScoreTab() {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [error, setError] = useState(null);

  const [historyData, setHistoryData] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);

  const [leaderboard, setLeaderboard] = useState([]);

  const loadScore = () => {
    setLoading(true);
    axiosClient
      .get("/innovation-score/me")
      .then(({ data }) => setScore(data))
      .catch((err) => {
        if (err.response?.status === 404) setNoProfile(true);
        else setError(extractErrorMessage(err));
      })
      .finally(() => setLoading(false));
  };

  const loadHistory = () => {
    axiosClient
      .get("/innovation-score/me/history", { params: { page: historyPage, page_size: 5 } })
      .then(({ data }) => setHistoryData(data))
      .catch(() => {});
  };

  const loadLeaderboard = () => {
    axiosClient.get("/innovation-score/leaderboard", { params: { limit: 10 } }).then(({ data }) => setLeaderboard(data));
  };

  useEffect(loadScore, []);
  useEffect(loadHistory, [historyPage]);
  useEffect(loadLeaderboard, []);

  const handleRecompute = async () => {
    setRecomputing(true);
    setError(null);
    try {
      const { data } = await axiosClient.post("/innovation-score/me/recompute");
      setScore(data);
      loadHistory();
      loadLeaderboard();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setRecomputing(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
          {error}
        </div>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink-900">Your Innovation Score</h3>
          {!noProfile && (
            <button onClick={handleRecompute} disabled={recomputing} className="btn-primary text-xs">
              {recomputing ? "Recomputing…" : "Recompute score"}
            </button>
          )}
        </div>

        {loading && <Loading className="py-6 text-center text-sm text-ink-900/40" />}
        {!loading && noProfile && (
          <EmptyState
            message="Set up your Research Profile first — your innovation score is computed from your publications, patents, and technology areas."
            className="py-6 text-center text-sm text-ink-900/50"
          />
        )}
        {!loading && score && <ScoreBreakdown score={score} />}
      </Card>

      {!noProfile && (
        <Card>
          <h3 className="mb-3 font-display text-base font-semibold text-ink-900">Score History</h3>
          {historyData?.items.length === 0 && (
            <EmptyState message="No history yet." className="py-4 text-center text-sm text-ink-900/40" />
          )}
          <div className="divide-y divide-ink-900/5">
            {historyData?.items.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink-900/60">{new Date(h.computed_at).toLocaleString()}</span>
                <span className="font-mono font-semibold text-ink-900">{Number(h.overall_score).toFixed(1)}</span>
              </div>
            ))}
          </div>
          {historyData && <Pagination page={historyData.page} totalPages={historyData.total_pages} onPageChange={setHistoryPage} />}
        </Card>
      )}

      <Card>
        <h3 className="mb-3 font-display text-base font-semibold text-ink-900">Leaderboard</h3>
        {leaderboard.length === 0 && (
          <EmptyState message="No scores yet." className="py-4 text-center text-sm text-ink-900/40" />
        )}
        <div className="divide-y divide-ink-900/5">
          {leaderboard.map((entry, i) => (
            <div key={entry.profile_id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <span className="w-6 font-mono text-sm text-ink-900/40">#{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-ink-900">{entry.researcher_full_name}</p>
                  <p className="text-xs text-ink-900/45">{entry.organization}</p>
                </div>
              </div>
              <span className="font-mono text-sm font-semibold text-ink-900">{entry.overall_score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
