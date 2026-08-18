import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../utils/validators";

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

export default function OpportunityEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosClient
      .get(`/funding-opportunities/${id}`)
      .then(({ data }) =>
        setForm({
          title: data.title,
          description: data.description,
          eligibility_criteria: data.eligibility_criteria || "",
          funding_source_type: data.funding_source_type,
          status: data.status,
          amount_min: data.amount_min ?? "",
          amount_max: data.amount_max ?? "",
          currency: data.currency,
          research_domains: data.research_domains.join(", "),
          technology_areas: data.technology_areas.join(", "),
          eligible_roles: data.eligible_roles,
          organization_name: data.organization_name,
          website_url: data.website_url || "",
          contact_email: data.contact_email || "",
          application_deadline: data.application_deadline || "",
        })
      )
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (user && user.role !== "administrator" && user.role !== "innovation_manager") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        amount_min: form.amount_min ? Number(form.amount_min) : null,
        amount_max: form.amount_max ? Number(form.amount_max) : null,
        research_domains: form.research_domains.split(",").map((s) => s.trim()).filter(Boolean),
        technology_areas: form.technology_areas.split(",").map((s) => s.trim()).filter(Boolean),
        application_deadline: form.application_deadline || null,
      };
      await axiosClient.put(`/funding-opportunities/${id}`, payload);
      navigate(`/funding/${id}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 font-display text-2xl font-semibold text-ink-900">Edit funding opportunity</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
            {error}
          </div>
        )}

        {loading || !form ? (
          <p className="text-sm text-ink-900/40">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} className="card-panel space-y-4">
            <div>
              <label className="field-label">Title</label>
              <input name="title" className="field-input" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea name="description" rows={4} className="field-input resize-none" value={form.description} onChange={handleChange} required />
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
              <input name="research_domains" className="field-input" value={form.research_domains} onChange={handleChange} />
            </div>
            <div>
              <label className="field-label">Technology areas (comma-separated)</label>
              <input name="technology_areas" className="field-input" value={form.technology_areas} onChange={handleChange} />
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
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
