import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Card from "../Card";
import EmptyState from "../EmptyState";
import Loading from "../Loading";
import Modal from "../Modal";
import { MaturityBadge } from "../InnovationBadges";
import MiniBarChart from "../MiniBarChart";
import Pagination from "../Pagination";
import { useAuth } from "../../context/AuthContext";
import { extractErrorMessage } from "../../utils/validators";

const MATURITY_OPTIONS = ["emerging", "growth", "mature", "declining"];

const EMPTY_FORM = { name: "", domain: "", description: "", maturity_level: "emerging" };

function CatalogSection({ isManager }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    axiosClient
      .get("/technologies", { params: { q: q || undefined, page, page_size: 10 } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [q, page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axiosClient.post("/technologies", form);
      setModalOpen(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-900">Technology Catalog</h3>
        {isManager && (
          <button onClick={() => setModalOpen(true)} className="btn-secondary text-xs">
            + Add technology
          </button>
        )}
      </div>
      <input
        className="field-input mb-4"
        placeholder="Search by name or domain…"
        value={q}
        onChange={(e) => { setPage(1); setQ(e.target.value); }}
      />

      {loading && <Loading className="py-6 text-center text-sm text-ink-900/40" />}
      {!loading && data?.items.length === 0 && (
        <EmptyState message="No technologies catalogued yet." className="py-6 text-center text-sm text-ink-900/40" />
      )}
      <div className="divide-y divide-ink-900/5">
        {!loading &&
          data?.items.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">{t.name}</p>
                <p className="text-xs text-ink-900/50">{t.domain}</p>
              </div>
              <MaturityBadge level={t.maturity_level} />
            </div>
          ))}
      </div>
      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add technology">
        {error && (
          <div className="mb-4 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-3">
          <input className="field-input" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <input className="field-input" placeholder="Domain" value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} />
          <textarea className="field-input resize-none" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <select className="field-input" value={form.maturity_level} onChange={(e) => setForm((f) => ({ ...f, maturity_level: e.target.value }))}>
            {MATURITY_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Saving…" : "Add technology"}</button>
        </form>
      </Modal>
    </Card>
  );
}

function EmergingSection() {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    axiosClient.get("/technologies/analysis/emerging", { params: { limit: 10 } }).then(({ data }) => setEntries(data));
  }, []);

  return (
    <Card>
      <h3 className="mb-3 font-display text-base font-semibold text-ink-900">Emerging Technologies</h3>
      {entries.length === 0 && (
        <EmptyState message="No growth signal yet." className="py-4 text-center text-sm text-ink-900/40" />
      )}
      <div className="space-y-2">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-ink-900/8 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink-900">{e.technology_name}</span>
              {e.is_tracked && e.maturity_level && <MaturityBadge level={e.maturity_level} />}
              {!e.is_tracked && <span className="tag-chip">not catalogued</span>}
            </div>
            <span className="font-mono text-xs text-ink-900/50">
              {e.recent_patent_count} recent vs {e.prior_patent_count} prior (×{e.growth_rate.toFixed(1)})
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MaturityBreakdownSection() {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    axiosClient.get("/technologies/analysis/maturity-breakdown").then(({ data }) => setEntries(data));
  }, []);

  return (
    <Card>
      <h3 className="mb-3 font-display text-base font-semibold text-ink-900">Maturity Breakdown</h3>
      <MiniBarChart
        data={entries.map((e) => ({ label: e.maturity_level, count: e.technology_count }))}
        labelKey="label"
        valueKey="count"
      />
    </Card>
  );
}

function InnovationOpportunitiesSection() {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    axiosClient.get("/technologies/analysis/innovation-opportunities", { params: { limit: 10 } }).then(({ data }) => setEntries(data));
  }, []);

  return (
    <Card>
      <h3 className="mb-3 font-display text-base font-semibold text-ink-900">Innovation Opportunities</h3>
      <p className="mb-3 text-xs text-ink-900/50">High patent activity, limited funding coverage — potential funding gaps</p>
      {entries.length === 0 && (
        <EmptyState message="No gaps identified yet." className="py-4 text-center text-sm text-ink-900/40" />
      )}
      <div className="space-y-2">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-ink-900/8 px-3 py-2 text-sm">
            <span className="font-medium text-ink-900">{e.technology_name}</span>
            <span className="font-mono text-xs text-ink-900/50">
              {e.patent_count} patents / {e.funding_opportunity_count} opportunities (gap {e.gap_score})
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CompetitiveMonitoringSection() {
  const [techName, setTechName] = useState("");
  const [entries, setEntries] = useState(null);

  const search = () => {
    if (!techName.trim()) return;
    axiosClient
      .get("/technologies/analysis/competitive-monitoring", { params: { technology_name: techName, limit: 10 } })
      .then(({ data }) => setEntries(data));
  };

  return (
    <Card>
      <h3 className="mb-3 font-display text-base font-semibold text-ink-900">Competitive Monitoring</h3>
      <div className="mb-3 flex gap-2">
        <input
          className="field-input"
          placeholder="Enter a technology name…"
          value={techName}
          onChange={(e) => setTechName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <button onClick={search} className="btn-secondary shrink-0">Search</button>
      </div>
      {entries && entries.length === 0 && (
        <EmptyState message="No assignees found for that technology." className="py-4 text-center text-sm text-ink-900/40" />
      )}
      {entries && entries.length > 0 && (
        <MiniBarChart data={entries.map((e) => ({ label: e.assignee, count: e.patent_count }))} labelKey="label" valueKey="count" color="bg-signal-amber" />
      )}
    </Card>
  );
}

export default function TechnologyIntelligenceTab() {
  const { user } = useAuth();
  const isManager = user?.role === "administrator" || user?.role === "innovation_manager";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <EmergingSection />
        <MaturityBreakdownSection />
      </div>
      <InnovationOpportunitiesSection />
      <CompetitiveMonitoringSection />
      <CatalogSection isManager={isManager} />
    </div>
  );
}
