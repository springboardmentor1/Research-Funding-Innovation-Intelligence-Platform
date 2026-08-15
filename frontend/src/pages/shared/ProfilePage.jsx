import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaLinkedin, FaOrcid, FaUniversity, FaBriefcase, FaGraduationCap, FaFlask, FaBook, FaRegCopyright, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import profileService from '../../services/profileService';

function Avatar({ name, size = 'lg' }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]`}>
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#1c2438] border border-slate-800 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function Field({ label, value, editing, name, onChange, type = 'text', options = null }) {
  if (!editing) {
    return (
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm text-slate-200">{value || <span className="text-slate-600 italic">Not set</span>}</p>
      </div>
    );
  }
  if (options) {
    return (
      <div>
        <label className="text-xs text-slate-400 block mb-1">{label}</label>
        <select name={name} value={value || ''} onChange={onChange}
          className="w-full bg-[#0f1523] border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-colors">
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (type === 'textarea') {
    return (
      <div>
        <label className="text-xs text-slate-400 block mb-1">{label}</label>
        <textarea name={name} value={value || ''} onChange={onChange} rows={3}
          className="w-full bg-[#0f1523] border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-colors resize-none" />
      </div>
    );
  }
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <input type={type} name={name} value={value || ''} onChange={onChange}
        className="w-full bg-[#0f1523] border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-colors" />
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await profileService.getCurrentUser();
        setUser(u);
        try {
          const p = await profileService.getProfile();
          setProfile(p);
          setProfileExists(true);
          setForm(p);
        } catch (profileErr) {
          // 404 = no profile yet
          setProfileExists(false);
          setForm({});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let saved;
      if (profileExists) {
        saved = await profileService.updateProfile(form);
      } else {
        saved = await profileService.createProfile(form);
        setProfileExists(true);
      }
      setProfile(saved);
      setForm(saved);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(profile || {});
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayData = editing ? form : (profile || {});

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Profile</h2>
        {saved && (
          <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium animate-fade-in">
            <FaCheckCircle /> Profile saved successfully!
          </span>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#1c2438] to-[#141b2d] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <Avatar name={user?.full_name} size="lg" />
            <div>
              <h3 className="text-xl font-bold text-white">{user?.full_name || 'Unknown User'}</h3>
              <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-medium">
                  {user?.role || 'Researcher'}
                </span>
                {displayData.organization && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <FaUniversity size={10} /> {displayData.organization}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-[#0f1523] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                <FaEdit size={13} /> Edit Profile
              </button>
            ) : (
              <>
                <button onClick={handleCancel}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-2 rounded-xl text-sm transition-all">
                  <FaTimes size={13} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave size={13} />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={FaBook} label="Publications" value={displayData.publications_count || 0} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={FaRegCopyright} label="Patents" value={displayData.patents_count || 0} color="bg-cyan-500/10 text-cyan-400" />
        <StatCard icon={FaBriefcase} label="Years Exp." value={displayData.years_of_experience || 0} color="bg-purple-500/10 text-purple-400" />
        <StatCard icon={FaFlask} label="Research Domain" value={displayData.research_domain ? '✓ Set' : 'Not set'} color="bg-amber-500/10 text-amber-400" />
      </div>

      {/* Research Profile */}
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6">
        <h4 className="text-white font-bold mb-5 flex items-center gap-2">
          <FaFlask size={14} className="text-blue-400" /> Research Profile
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <Field label="Research Domain" value={displayData.research_domain} editing={editing} name="research_domain" onChange={handleChange}
            options={['AI & Machine Learning', 'Biotechnology', 'Environmental Science', 'Materials Science', 'Quantum Computing', 'Medical Devices', 'Energy Storage', 'Robotics', 'Neuroscience', 'Other']} />
          <Field label="Research Subdomain" value={displayData.research_subdomain} editing={editing} name="research_subdomain" onChange={handleChange} />
          <Field label="Keywords (comma-separated)" value={displayData.keywords} editing={editing} name="keywords" onChange={handleChange} />
          <Field label="Technology Areas" value={displayData.technology_areas} editing={editing} name="technology_areas" onChange={handleChange} />
          <Field label="Research Interests" value={displayData.research_interests} editing={editing} name="research_interests" onChange={handleChange} type="textarea" />
          <Field label="Biography" value={displayData.biography} editing={editing} name="biography" onChange={handleChange} type="textarea" />
        </div>
      </div>

      {/* Professional Info */}
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6">
        <h4 className="text-white font-bold mb-5 flex items-center gap-2">
          <FaBriefcase size={14} className="text-purple-400" /> Professional Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <Field label="Organization / Institution" value={displayData.organization} editing={editing} name="organization" onChange={handleChange} />
          <Field label="Designation / Title" value={displayData.designation} editing={editing} name="designation" onChange={handleChange} />
          <Field label="Highest Qualification" value={displayData.highest_qualification} editing={editing} name="highest_qualification" onChange={handleChange}
            options={['PhD', 'Masters', 'Bachelors', 'PostDoc', 'Other']} />
          <Field label="Years of Experience" value={displayData.years_of_experience} editing={editing} name="years_of_experience" onChange={handleChange} type="number" />
          <Field label="Publications Count" value={displayData.publications_count} editing={editing} name="publications_count" onChange={handleChange} type="number" />
          <Field label="Patents Count" value={displayData.patents_count} editing={editing} name="patents_count" onChange={handleChange} type="number" />
        </div>
      </div>

      {/* Links */}
      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl p-6">
        <h4 className="text-white font-bold mb-5 flex items-center gap-2">
          <FaLinkedin size={14} className="text-blue-400" /> Academic & Social Links
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            {editing ? (
              <Field label="LinkedIn URL" value={displayData.linkedin_url} editing={editing} name="linkedin_url" onChange={handleChange} />
            ) : (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">LinkedIn</p>
                {displayData.linkedin_url ? (
                  <a href={displayData.linkedin_url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <FaLinkedin size={13} /> View Profile
                  </a>
                ) : <p className="text-sm text-slate-600 italic">Not set</p>}
              </div>
            )}
          </div>
          <Field label="ORCID ID" value={displayData.orcid_id} editing={editing} name="orcid_id" onChange={handleChange} />
        </div>
      </div>

      {!profileExists && !editing && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
          <p className="text-amber-400 text-sm font-medium">You haven't set up your research profile yet.</p>
          <p className="text-slate-400 text-xs mt-1">Click "Edit Profile" to add your details and improve funding matches.</p>
          <button onClick={() => setEditing(true)} className="mt-3 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            Set Up Profile
          </button>
        </div>
      )}
    </div>
  );
}
