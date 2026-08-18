import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import { extractErrorMessage } from "../utils/validators";

function TagInput({ label, hint, values, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
  };

  const removeTag = (tag) => {
    onChange(values.filter((v) => v !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <label className="field-label">{label}</label>
      {hint && <p className="mb-2 -mt-1 text-xs text-ink-900/45">{hint}</p>}
      <div className="flex gap-2">
        <input
          className="field-input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" onClick={addTag} className="btn-secondary shrink-0">
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-ink-900/40 hover:text-signal-rose"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_PUBLICATION = { title: "", authors: "", journal: "", publication_date: "", doi: "", url: "" };
const EMPTY_PATENT = { title: "", patent_number: "", assignee: "", filing_date: "", technology_domain: "" };

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    biography: "",
    organization: "",
    research_domains: [],
    keywords: [],
    technology_areas: [],
  });

  const [publications, setPublications] = useState([]);
  const [patents, setPatents] = useState([]);
  const [newPublication, setNewPublication] = useState(EMPTY_PUBLICATION);
  const [newPatent, setNewPatent] = useState(EMPTY_PATENT);
  const [showPubForm, setShowPubForm] = useState(false);
  const [showPatentForm, setShowPatentForm] = useState(false);

  useEffect(() => {
    axiosClient
      .get("/research-profile/me")
      .then(({ data }) => {
        setExists(true);
        setForm({
          biography: data.biography || "",
          organization: data.organization || "",
          research_domains: data.research_domains || [],
          keywords: data.keywords || [],
          technology_areas: data.technology_areas || [],
        });
        setPublications(data.publications || []);
        setPatents(data.patents || []);
      })
      .catch(() => setExists(false))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const endpoint = "/research-profile/me";
      const { data } = exists
        ? await axiosClient.put(endpoint, form)
        : await axiosClient.post(endpoint, form);
      setExists(true);
      setPublications(data.publications || []);
      setPatents(data.patents || []);
      setMessage(exists ? "Profile updated successfully." : "Research profile created successfully.");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddPublication = async (e) => {
    e.preventDefault();
    if (!newPublication.title.trim()) return;
    try {
      const payload = { ...newPublication, publication_date: newPublication.publication_date || null };
      const { data } = await axiosClient.post("/research-profile/me/publications", payload);
      setPublications((prev) => [...prev, data]);
      setNewPublication(EMPTY_PUBLICATION);
      setShowPubForm(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleAddPatent = async (e) => {
    e.preventDefault();
    if (!newPatent.title.trim()) return;
    try {
      const payload = { ...newPatent, filing_date: newPatent.filing_date || null };
      const { data } = await axiosClient.post("/research-profile/me/patents", payload);
      setPatents((prev) => [...prev, data]);
      setNewPatent(EMPTY_PATENT);
      setShowPatentForm(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-16 text-center text-sm text-ink-900/50">
          Loading your research profile…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-signal-emeraldDark">
            Research Profile Management
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">
            {exists ? "Your research profile" : "Set up your research profile"}
          </h1>
          <p className="mt-1 text-sm text-ink-900/60">
            This information powers funding recommendations, trend analysis, and patent intelligence.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-signal-emerald/20 bg-signal-emerald/5 px-4 py-3 text-sm text-signal-emeraldDark">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border border-signal-rose/20 bg-signal-rose/5 px-4 py-3 text-sm text-signal-rose">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="card-panel space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="organization">Organization</label>
              <input
                id="organization"
                className="field-input"
                placeholder="e.g. Stanford University"
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="biography">Biography</label>
            <textarea
              id="biography"
              rows={4}
              className="field-input resize-none"
              placeholder="Tell us about your research background and interests…"
              value={form.biography}
              onChange={(e) => setForm((f) => ({ ...f, biography: e.target.value }))}
            />
          </div>

          <TagInput
            label="Research domains"
            hint="e.g. Machine Learning, Biotechnology, Renewable Energy"
            values={form.research_domains}
            onChange={(vals) => setForm((f) => ({ ...f, research_domains: vals }))}
            placeholder="Type a domain and press Enter"
          />

          <TagInput
            label="Keywords"
            hint="Specific topics that describe your work"
            values={form.keywords}
            onChange={(vals) => setForm((f) => ({ ...f, keywords: vals }))}
            placeholder="Type a keyword and press Enter"
          />

          <TagInput
            label="Technology areas"
            hint="e.g. Computer Vision, Gene Editing, Battery Storage"
            values={form.technology_areas}
            onChange={(vals) => setForm((f) => ({ ...f, technology_areas: vals }))}
            placeholder="Type a technology area and press Enter"
          />

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : exists ? "Save changes" : "Create profile"}
          </button>
        </form>

        {exists && (
          <>
            {/* Publications */}
            <div className="mt-8 card-panel">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink-900">Publications</h2>
                <button type="button" className="btn-secondary" onClick={() => setShowPubForm((v) => !v)}>
                  {showPubForm ? "Cancel" : "Add publication"}
                </button>
              </div>

              {showPubForm && (
                <form onSubmit={handleAddPublication} className="mt-4 grid gap-3 rounded-lg border border-ink-900/8 bg-surface-50 p-4 sm:grid-cols-2">
                  <input
                    className="field-input sm:col-span-2"
                    placeholder="Publication title"
                    value={newPublication.title}
                    onChange={(e) => setNewPublication((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                  <input
                    className="field-input"
                    placeholder="Authors"
                    value={newPublication.authors}
                    onChange={(e) => setNewPublication((p) => ({ ...p, authors: e.target.value }))}
                  />
                  <input
                    className="field-input"
                    placeholder="Journal / Conference"
                    value={newPublication.journal}
                    onChange={(e) => setNewPublication((p) => ({ ...p, journal: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="field-input"
                    value={newPublication.publication_date}
                    onChange={(e) => setNewPublication((p) => ({ ...p, publication_date: e.target.value }))}
                  />
                  <input
                    className="field-input"
                    placeholder="DOI"
                    value={newPublication.doi}
                    onChange={(e) => setNewPublication((p) => ({ ...p, doi: e.target.value }))}
                  />
                  <input
                    className="field-input sm:col-span-2"
                    placeholder="URL"
                    value={newPublication.url}
                    onChange={(e) => setNewPublication((p) => ({ ...p, url: e.target.value }))}
                  />
                  <button type="submit" className="btn-primary sm:col-span-2">Save publication</button>
                </form>
              )}

              <div className="mt-4 divide-y divide-ink-900/5">
                {publications.length === 0 && (
                  <p className="py-4 text-sm text-ink-900/45">No publications added yet.</p>
                )}
                {publications.map((pub) => (
                  <div key={pub.id} className="py-3">
                    <p className="text-sm font-semibold text-ink-900">{pub.title}</p>
                    <p className="mt-0.5 text-xs text-ink-900/50">
                      {[pub.authors, pub.journal, pub.publication_date].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Patents */}
            <div className="mt-8 card-panel">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink-900">Patents</h2>
                <button type="button" className="btn-secondary" onClick={() => setShowPatentForm((v) => !v)}>
                  {showPatentForm ? "Cancel" : "Add patent"}
                </button>
              </div>

              {showPatentForm && (
                <form onSubmit={handleAddPatent} className="mt-4 grid gap-3 rounded-lg border border-ink-900/8 bg-surface-50 p-4 sm:grid-cols-2">
                  <input
                    className="field-input sm:col-span-2"
                    placeholder="Patent title"
                    value={newPatent.title}
                    onChange={(e) => setNewPatent((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                  <input
                    className="field-input"
                    placeholder="Patent number"
                    value={newPatent.patent_number}
                    onChange={(e) => setNewPatent((p) => ({ ...p, patent_number: e.target.value }))}
                  />
                  <input
                    className="field-input"
                    placeholder="Assignee"
                    value={newPatent.assignee}
                    onChange={(e) => setNewPatent((p) => ({ ...p, assignee: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="field-input"
                    value={newPatent.filing_date}
                    onChange={(e) => setNewPatent((p) => ({ ...p, filing_date: e.target.value }))}
                  />
                  <input
                    className="field-input"
                    placeholder="Technology domain"
                    value={newPatent.technology_domain}
                    onChange={(e) => setNewPatent((p) => ({ ...p, technology_domain: e.target.value }))}
                  />
                  <button type="submit" className="btn-primary sm:col-span-2">Save patent</button>
                </form>
              )}

              <div className="mt-4 divide-y divide-ink-900/5">
                {patents.length === 0 && (
                  <p className="py-4 text-sm text-ink-900/45">No patents added yet.</p>
                )}
                {patents.map((pat) => (
                  <div key={pat.id} className="py-3">
                    <p className="text-sm font-semibold text-ink-900">{pat.title}</p>
                    <p className="mt-0.5 text-xs text-ink-900/50">
                      {[pat.patent_number, pat.assignee, pat.filing_date].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
