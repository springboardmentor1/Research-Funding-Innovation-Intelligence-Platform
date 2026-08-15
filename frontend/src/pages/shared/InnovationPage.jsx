import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaTimes, FaRocket, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import innovationService from '../../services/innovationService';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'healthcare', label: '🏥 Healthcare' },
  { key: 'energy', label: '⚡ Energy' },
  { key: 'biotech', label: '🧬 Biotech' },
  { key: 'computing', label: '💻 Computing' },
  { key: 'materials', label: '🔬 Materials' },
];

const CATEGORY_COLORS = {
  healthcare: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  energy: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  biotech: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  computing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  materials: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  other: 'bg-slate-500/10 text-slate-400 border-slate-600',
};

function ScoreBar({ value, label, color }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={color}>{value}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-amber-500 to-yellow-400`}
          style={{ width: animated ? `${value}%` : '0%' }}
        />
      </div>
    </div>
  );
}

function InnovationCard({ item, rank }) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
  const scoreColor = item.commercialization_score >= 85 ? 'text-emerald-400' : item.commercialization_score >= 70 ? 'text-amber-400' : 'text-orange-400';
  return (
    <div className="bg-[#1c2438] border border-slate-800 hover:border-amber-500/30 rounded-xl p-5 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-full bg-[#0f1523] border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0">
          #{rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-white font-semibold text-sm leading-tight">{item.name}</h3>
            <div className="shrink-0 text-right">
              <span className={`text-xl font-bold ${scoreColor}`}>{item.commercialization_score}</span>
              <span className="text-xs text-slate-500 block">/ 100</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${catColor}`}>{item.category}</span>
            <span className="text-xs text-slate-500">${item.market_size_b}B market</span>
            <span className="text-xs text-slate-500">~{item.time_to_market_years}yr to market</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000"
              style={{ width: `${item.commercialization_score}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.description}</p>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors">
            {expanded ? 'Show less ▲' : 'More details ▼'}
          </button>
          {expanded && (
            <div className="mt-3 space-y-3 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-3 gap-3">
                <ScoreBar value={item.commercialization_score} label="Commercialization" color="text-amber-400" />
                <ScoreBar value={item.market_readiness} label="Market Readiness" color="text-blue-400" />
                <ScoreBar value={item.ip_strength} label="IP Strength" color="text-purple-400" />
              </div>
              {item.tags && (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EvaluateModal({ onClose }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'healthcare', market_size_estimate: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        market_size_estimate: form.market_size_estimate ? parseFloat(form.market_size_estimate) : null
      };
      const res = await innovationService.evaluateIdea(payload);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#141b2d] border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-white font-bold text-lg">Evaluate Your Idea</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><FaTimes /></button>
        </div>
        <div className="p-5">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Innovation Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-[#1c2438] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
                  placeholder="e.g. AI-Powered Drug Repurposing" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-[#1c2438] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500">
                  {CATEGORIES.filter(c => c.key !== 'all').map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description *</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#1c2438] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500 resize-none"
                  placeholder="Describe your innovation idea in detail..." />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Estimated Market Size (Billion $)</label>
                <input type="number" value={form.market_size_estimate} onChange={e => setForm(p => ({ ...p, market_size_estimate: e.target.value }))}
                  className="w-full bg-[#1c2438] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
                  placeholder="e.g. 5.2" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                {loading ? <><FaSpinner className="animate-spin" /> Evaluating...</> : <><FaRocket /> Evaluate with AI</>}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className={`text-5xl font-black mb-2 ${result.commercialization_score >= 70 ? 'text-amber-400' : 'text-orange-500'}`}>
                  {result.commercialization_score}
                </div>
                <p className="text-slate-400 text-sm">Commercialization Score for</p>
                <p className="text-white font-bold">{result.title}</p>
                <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full font-medium ${result.recommendation === 'Promising' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {result.recommendation}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Market Readiness', value: result.market_readiness },
                  { label: 'IP Strength', value: result.ip_strength },
                ].map(m => (
                  <div key={m.label} className="bg-[#1c2438] border border-slate-800 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-white">{m.value}</p>
                    <p className="text-xs text-slate-500">{m.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-semibold mb-2 flex items-center gap-1"><FaCheckCircle />Strengths</p>
                <ul className="space-y-1">
                  {result.strengths?.map((s, i) => <li key={i} className="text-xs text-slate-300 pl-3 border-l border-emerald-500/40">• {s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs text-rose-400 font-semibold mb-2 flex items-center gap-1"><FaExclamationTriangle />Risks</p>
                <ul className="space-y-1">
                  {result.risks?.map((r, i) => <li key={i} className="text-xs text-slate-300 pl-3 border-l border-rose-500/40">• {r}</li>)}
                </ul>
              </div>
              <button onClick={() => setResult(null)} className="w-full border border-slate-700 text-slate-400 hover:text-white py-2.5 rounded-xl text-sm transition-colors">
                Evaluate Another Idea
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InnovationPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showEvaluate, setShowEvaluate] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await innovationService.getScores();
        setScores(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredScores = activeCategory === 'all' ? scores : scores.filter(s => s.category === activeCategory);

  const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + s.commercialization_score, 0) / scores.length) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Innovation Scoring</h2>
          <p className="text-slate-400 text-sm">Evaluate commercialization potential and score innovative ideas using AI models.</p>
        </div>
        <button onClick={() => setShowEvaluate(true)}
          className="shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <FaRocket size={13} /> Evaluate Idea
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Opportunities Tracked', value: scores.length, color: 'text-amber-400' },
          { label: 'Avg Comm. Score', value: `${avgScore}%`, color: 'text-yellow-400' },
          { label: 'High Potential (>85)', value: scores.filter(s => s.commercialization_score >= 85).length, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#1c2438] border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setActiveCategory(c.key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${activeCategory === c.key ? 'bg-amber-500 text-white' : 'bg-[#1c2438] border border-slate-700 text-slate-400 hover:text-slate-200'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Innovation List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScores.map((item, idx) => (
            <InnovationCard key={item.id} item={item} rank={idx + 1} />
          ))}
        </div>
      )}

      {showEvaluate && <EvaluateModal onClose={() => setShowEvaluate(false)} />}
    </div>
  );
}
