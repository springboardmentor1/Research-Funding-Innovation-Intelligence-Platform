import { useState } from "react";
import client from "../api/client";

const DOMAIN_OPTIONS = [
  "Machine Learning", "Bioinformatics", "Climate Science",
  "Materials Science", "Quantum Computing", "Public Health",
  "Robotics", "Neuroscience", "Energy Systems",
];

export default function ProfileOnboardingForm() {
  const [form, setForm] = useState({
    organization: "",
    department: "",
    domains: [],
    keywords: "",
    bio: "",
    orcid_id: "",
  });
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleDomain(domain) {
    setForm((prev) => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter((d) => d !== domain)
        : [...prev.domains, domain],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    try {
      await client.put("/profiles/me", {
        organization: form.organization,
        department: form.department,
        research_domains: form.domains,
        keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        bio: form.bio,
        orcid_id: form.orcid_id || null,
      });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Organisation</label>
          <input
            name="organization"
            value={form.organization}
            onChange={handleChange}
            placeholder="e.g. MIT, Acme Labs"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="e.g. Computer Science"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-2">Research Domains</label>
        <div className="flex flex-wrap gap-2">
          {DOMAIN_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDomain(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                form.domains.includes(d)
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Keywords <span className="text-slate-500">(comma-separated)</span>
        </label>
        <input
          name="keywords"
          value={form.keywords}
          onChange={handleChange}
          placeholder="e.g. LLMs, CRISPR, superconductors"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">Bio</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={3}
          placeholder="Brief description of your research focus…"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">ORCID iD</label>
        <input
          name="orcid_id"
          value={form.orcid_id}
          onChange={handleChange}
          placeholder="0000-0000-0000-0000"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors"
        >
          {status === "saving" ? "Saving…" : "Save Profile"}
        </button>
        {status === "saved" && <span className="text-green-400 text-sm">Saved ✓</span>}
        {status === "error" && <span className="text-red-400 text-sm">Save failed. Try again.</span>}
      </div>
    </form>
  );
}