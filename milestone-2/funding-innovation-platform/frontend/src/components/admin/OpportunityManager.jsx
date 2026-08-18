import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Modal from "../Modal";
import Pagination from "../Pagination";
import { OpportunityStatusBadge } from "../StatusBadges";
import { extractErrorMessage } from "../../utils/validators";

const SOURCE_TYPES = [
  "government_grant",
  "research_council",
  "innovation_fund",
  "startup_accelerator",
  "venture_program",
  "international_agency",
  "other",
];
const STATUSES = ["draft", "published", "closed", "archived"];
const ELIGIBLE_ROLE_OPTIONS = ["researcher", "startup_founder", "innovation_manager"];

const EMPTY_FORM = {
  title: "",
  description: "",
  eligibility_criteria: "",
  funding_source_type: "government_grant",
  status: "draft",
  amount_min: "",
  amount_max: "",
  currency: "USD",
  research_domains: "",
  technology_areas: "",
  eligible_roles: [],
  organization_name: "",
  website_url: "",
  contact_email: "",
  application_deadline: "",
};

function toPayload(form) {
  return {
    ...form,
    amount_min: form.amount_min ? Number(form.amount_min) : null,
    amount_max: form.amount_max ? Number(form.amount_max) : null,
    research_domains: form.research_domains.split(",").map((s) => s.trim()).filter(Boolean),
    technology_areas: form.technology_areas.split(",").map((s) => s.trim()).filter(Boolean),
    application_deadline: form.application_deadline || null,
    contact_email: form.contact_email || null,
    website_url: form.website_url || null,
    eligibility_criteria: form.eligibility_criteria || null,
  };
}

function fromOpportunity(opp) {
  return {
    title: opp.title,
    description: opp.description,
    eligibility_criteria: opp.eligibility_criteria || "",
    funding_source_type: opp.funding_source_type,
    status: opp.status,
    amount_min: opp.amount_min ?? "",
    amount_max: opp.amount_max ?? "",
    currency: opp.currency,
    research_domains: opp.research_domains.join(", "),
    technology_areas: opp.technology_areas.join(", "),
    eligible_roles: opp.eligible_roles,
    organization_name: opp.organization_name,
    website_url: opp.website_url || "",
    contact_email: opp.contact_email || "",
    application_deadline: opp.application_deadline || "",
  };
}

export default function OpportunityManager() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    axiosClient
      .get("/funding-opportunities", { params: { page, page_size: 10, sort_by: "created_at", sort_dir: "desc" } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (opp) => {
    setForm(fromOpportunity(opp));
    setEditingId(opp.id);
    setError(null);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toggleEligibleRole = (role) => {
    setForm((f) => ({
      ...f,
      eligible_roles: f.eligible_roles.includes(role)
        ? f.eligible_roles.filter((r) => r !== role)
        : [...f.eligible_roles, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = toPayload(form);
      if (editingId) {
        await axiosClient.put(`/funding-opportunities/${editingId}`, payload);
      } else {
        await axiosClient.post("/funding-opportunities", payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this funding opportunity? This cannot be undone.")) return;
    await axiosClient.delete(`/funding-opportunities/${id}`);
    load();
  };

  const handleQuickStatusChange = async (opp, newStatus) => {
    const payload = { ...fromOpportunity(opp), status: newStatus };
    await axiosClient.put(`/funding-opportunities/${opp.id}`, toPayload(payload));
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink-900">Manage funding opportunities</h2>
        <button onClick={openCreateModal} className="btn-primary">+ New opportunity</button>
      </div>

      {loading && <p className="py-10 text-center text-sm text-ink-900/40">Loading…</p>}

      <div className="space-y-3">
        {!loading &&
          data?.items.map((opp) => (
            <div key={opp.id} className="card-panel flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <OpportunityStatusBadge status={opp.status} />
                  <span className="tag-chip">{opp.funding_source_type.replace(/_/g, " ")}</span>
                </div>
                <p className="truncate font-semibold text-ink-900">{opp.title}</p>
                <p className="text-xs text-ink-900/50">{opp.organization_name} · {opp.view_count} views</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  value={opp.status}
                  onChange={(e) => handleQuickStatusChange(opp, e.target.value)}
                  className="field-input py-1.5 text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button onClick={() => openEditModal(opp)} className="btn-secondary text-xs">Edit</button>
                <button
                  onClick={() => handleDelete(opp.id)}
                  className="rounded-lg border border-signal-rose/30 px-3 py-1.5 text-xs font-semibold text-signal-rose transition hover:bg-signal-rose/5"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit opportunity" : "New funding opportunity"}>
        {error && (
          <div className="mb-4 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Title</label>
            <input name="title" className="field-input" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea name="description" rows={3} className="field-input resize-none" value={form.description} onChange={handleChange} required />
          </div>
          <div>
            <label className="field-label">Eligibility criteria</label>
            <textarea name="eligibility_criteria" rows={2} className="field-input resize-none" value={form.eligibility_criteria} onChange={handleChange} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Funding source type</label>
              <select name="funding_source_type" className="field-input" value={form.funding_source_type} onChange={handleChange}>
                {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Status</label>
              <select name="status" className="field-input" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="field-label">Min amount</label>
              <input name="amount_min" type="number" className="field-input" value={form.amount_min} onChange={handleChange} />
            </div>
            <div>
              <label className="field-label">Max amount</label>
              <input name="amount_max" type="number" className="field-input" value={form.amount_max} onChange={handleChange} />
            </div>
            <div>
              <label className="field-label">Currency</label>
              <input name="currency" className="field-input" value={form.currency} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="field-label">Research domains (comma-separated)</label>
            <input name="research_domains" className="field-input" value={form.research_domains} onChange={handleChange} placeholder="Machine Learning, Biotechnology" />
          </div>
          <div>
            <label className="field-label">Technology areas (comma-separated)</label>
            <input name="technology_areas" className="field-input" value={form.technology_areas} onChange={handleChange} placeholder="Computer Vision, Gene Editing" />
          </div>

          <div>
            <label className="field-label">Eligible roles</label>
            <div className="flex flex-wrap gap-2">
              {ELIGIBLE_ROLE_OPTIONS.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => toggleEligibleRole(role)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    form.eligible_roles.includes(role)
                      ? "bg-signal-emerald text-white"
                      : "bg-surface-100 text-ink-900/60"
                  }`}
                >
                  {role.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label">Organization name</label>
              <input name="organization_name" className="field-input" value={form.organization_name} onChange={handleChange} required />
            </div>
            <div>
              <label className="field-label">Application deadline</label>
              <input name="application_deadline" type="date" className="field-input" value={form.application_deadline} onChange={handleChange} />
            </div>
            <div>
              <label className="field-label">Website URL</label>
              <input name="website_url" className="field-input" value={form.website_url} onChange={handleChange} />
            </div>
            <div>
              <label className="field-label">Contact email</label>
              <input name="contact_email" type="email" className="field-input" value={form.contact_email} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : editingId ? "Save changes" : "Create opportunity"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
