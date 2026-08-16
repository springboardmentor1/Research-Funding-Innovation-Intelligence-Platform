// Research profile page. Create or edit the profile that drives every
// personalised feature (recommendations, score, commercialization).

import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Spinner } from "../components/common";

// Multi-value fields are stored as arrays but edited as comma-separated text -
// simplest UX that works. We split on save, join on load.
const toText = (arr) => (arr || []).join(", ");
const toArr = (txt) => txt.split(",").map((s) => s.trim()).filter(Boolean);

export default function Profile() {
  const [form, setForm] = useState({
    organization: "", bio: "", research_domains: "",
    keywords: "", technology_areas: "", country: "",
  });
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Load the existing profile if there is one. A 404 just means "new user".
  useEffect(() => {
    (async () => {
      try {
        const p = await api.profile.get();
        setForm({
          organization: p.organization || "",
          bio: p.bio || "",
          research_domains: toText(p.research_domains),
          keywords: toText(p.keywords),
          technology_areas: toText(p.technology_areas),
          country: p.country || "",
        });
        setExists(true);
      } catch (err) {
        if (err.status !== 404) setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload = {
      organization: form.organization || null,
      bio: form.bio || null,
      research_domains: toArr(form.research_domains),
      keywords: toArr(form.keywords),
      technology_areas: toArr(form.technology_areas),
      country: form.country || null,
    };
    try {
      // create vs update depending on whether one already exists
      if (exists) await api.profile.update(payload);
      else { await api.profile.create(payload); setExists(true); }
      setMessage({ type: "ok", text: "Profile saved. Your score and recommendations will update." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">Research Profile</h1>
      <p className="page-sub">
        This drives your funding matches, innovation score, and commercialization advice.
      </p>

      <form onSubmit={save} className="card">
        <div className="auth-form">
          <label>Organization</label>
          <input value={form.organization} onChange={(e) => set("organization", e.target.value)}
                 placeholder="e.g. VIT Chennai" />

          <label>Bio / research summary</label>
          <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                    rows={4} placeholder="A few sentences about your research focus"
                    style={{ padding: "10px 12px", background: "#232d47",
                             border: "1px solid #2d3a56", borderRadius: 8,
                             color: "#e8edf5", fontSize: 14, fontFamily: "inherit" }} />

          <label>Research domains <span style={{ color: "#94a3b8" }}>(comma-separated)</span></label>
          <input value={form.research_domains} onChange={(e) => set("research_domains", e.target.value)}
                 placeholder="Machine Learning, NLP, Computer Vision" />

          <label>Keywords <span style={{ color: "#94a3b8" }}>(comma-separated)</span></label>
          <input value={form.keywords} onChange={(e) => set("keywords", e.target.value)}
                 placeholder="deep learning, transformers, neural networks" />

          <label>Technology areas <span style={{ color: "#94a3b8" }}>(comma-separated)</span></label>
          <input value={form.technology_areas} onChange={(e) => set("technology_areas", e.target.value)}
                 placeholder="AI, Data Science" />

          <label>Country <span style={{ color: "#94a3b8" }}>(2-letter code)</span></label>
          <input value={form.country} onChange={(e) => set("country", e.target.value)}
                 maxLength={2} placeholder="IN" style={{ maxWidth: 100 }} />

          {message && (
            <div style={{ marginTop: 12, color: message.type === "ok" ? "#22d3aa" : "#f87171" }}>
              {message.text}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop: 12 }}>
            {saving ? "Saving..." : exists ? "Update profile" : "Create profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
