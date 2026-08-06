import { useEffect, useState } from 'react';
import client from '../api/client';
import Panel from '../components/Panel';
import StructuredListEditor from '../components/StructuredListEditor';

function ChipInput({ label, values, onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  function add() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  }

  return (
    <div style={{ marginTop: 14 }}>
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" className="btn-ghost btn" onClick={add}>Add</button>
      </div>
      <div className="chip-select">
        {values.map((v) => (
          <button type="button" key={v} className="selected" onClick={() => onChange(values.filter((x) => x !== v))}>
            {v} ×
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/api/profile/me').then((res) => setProfile(res.data)).catch(() => setError('Could not load profile.'));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await client.put('/api/profile/me', {
        research_domains: profile.research_domains,
        keywords: profile.keywords,
        technology_areas: profile.technology_areas,
        publications: profile.publications,
        patents: profile.patents,
        organization: profile.organization,
        bio: profile.bio,
      });
      setProfile(res.data);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <p className="loading-dots">Loading profile…</p>;

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Research Profile</div>
        <h1 className="page-title">Your research identity</h1>
        <p className="page-desc">
          Domains and keywords here drive funding matches, research trend tracking, and your innovation score.
        </p>
      </div>

      <Panel style={{ maxWidth: 640, marginBottom: 20 }}>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSave}>
          <label>Organization</label>
          <input
            value={profile.organization || ''}
            onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
            placeholder="e.g. IIT Madras"
          />

          <ChipInput
            label="Research domains"
            values={profile.research_domains}
            onChange={(v) => setProfile({ ...profile, research_domains: v })}
            placeholder="e.g. NLP"
          />
          <ChipInput
            label="Keywords"
            values={profile.keywords}
            onChange={(v) => setProfile({ ...profile, keywords: v })}
            placeholder="e.g. transformers"
          />
          <ChipInput
            label="Technology areas"
            values={profile.technology_areas}
            onChange={(v) => setProfile({ ...profile, technology_areas: v })}
            placeholder="e.g. Edge Computing"
          />

          <label>Bio</label>
          <textarea
            rows={4}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="A short summary of your research focus."
          />

          <button className="btn" type="submit" disabled={saving} style={{ marginTop: 20 }}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {saved && <span style={{ marginLeft: 12, color: 'var(--teal)', fontSize: 13 }}>Saved.</span>}
        </form>
      </Panel>

      <Panel label="Publications" style={{ maxWidth: 640, marginBottom: 20 }}>
        <StructuredListEditor
          label="Add a publication"
          items={profile.publications}
          onChange={(v) => setProfile({ ...profile, publications: v })}
          fields={[
            { key: 'title', placeholder: 'Publication title' },
            { key: 'year', placeholder: 'Year' },
          ]}
          placeholder="No publications added yet."
        />
        <button className="btn" style={{ marginTop: 14 }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save publications'}
        </button>
      </Panel>

      <Panel label="Patents" style={{ maxWidth: 640 }}>
        <StructuredListEditor
          label="Add a patent"
          items={profile.patents}
          onChange={(v) => setProfile({ ...profile, patents: v })}
          fields={[
            { key: 'title', placeholder: 'Patent title' },
            { key: 'patent_number', placeholder: 'Patent number' },
          ]}
          placeholder="No patents added yet."
        />
        <button className="btn" style={{ marginTop: 14 }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save patents'}
        </button>
      </Panel>
    </>
  );
}
