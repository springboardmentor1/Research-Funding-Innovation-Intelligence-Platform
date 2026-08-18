import React, { useState } from 'react';
import api from '../services/api';
import ScoreRadarChart from '../components/charts/ScoreRadarChart';
import { Award, Sparkles, CheckCircle, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';

const InnovationScorerPage = () => {
  const [title, setTitle] = useState('3D Convolutional Neural Network for Early Stage Alzheimer MRI Analysis');
  const [description, setDescription] = useState('An automated deep learning framework analyzing volumetric multi-sequence brain MRI scans to classify neurodegenerative tissue loss with 94% diagnostic accuracy prior to clinical symptom onset.');
  const [domain, setDomain] = useState('Computer Vision & Medical Imaging');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/innovation/evaluate', {
        idea_title: title,
        idea_description: description,
        research_domain: domain
      });
      setEvaluation(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530] flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-600" />
          Evaluate Your Research Idea — Innovation Scoring Engine
        </h1>
        <p className="text-xs text-[#576574] mt-1 font-semibold">
          Explainable 5-Factor Weighted Scoring Model (Novelty 30%, Patent Strength 20%, Tech Maturity 15%, Market Potential 20%, Funding 15%)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
          <h3 className="text-sm font-extrabold text-[#1a2530] mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" /> Research Proposal Input
          </h3>

          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1a2530] mb-1">Proposal Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2.5 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a2530] mb-1">Research Domain</label>
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2.5 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a2530] mb-1">Technical Abstract & Methodology</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-[#dcd6c8] rounded-xl p-3.5 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#24527a] hover:bg-[#1b3d5c] text-white font-bold rounded-xl text-xs shadow-md shadow-[#24527a]/20 flex items-center justify-center gap-2 transition"
            >
              {loading ? 'Evaluating Proposal Metrics...' : 'Calculate Innovation Score'}
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Score Visualization & Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#1a2530]">Innovation Score Breakdown</h3>
              {evaluation && (
                <div className="text-right">
                  <span className="text-2xl font-black text-[#24527a]">{evaluation.overall_score}</span>
                  <span className="text-xs text-[#576574] font-bold"> / 100</span>
                </div>
              )}
            </div>

            <ScoreRadarChart breakdown={evaluation?.breakdown} />
          </div>

          {evaluation && (
            <div className="mt-4 p-4 bg-[#f8f6f0] rounded-2xl border border-[#e5e0d4] text-xs">
              <p className="font-extrabold text-[#1a2530] mb-1">Explainable Rationale:</p>
              <p className="text-[#576574] text-[11px] leading-relaxed font-medium">{evaluation.explanation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Insights & Strengths */}
      {evaluation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
            <h4 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Identified Key Strengths
            </h4>
            <ul className="space-y-2 text-xs text-[#1a2530]">
              {evaluation.key_strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#f8f6f0] p-2.5 rounded-xl border border-[#e5e0d4] font-medium">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm">
            <h4 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Technical & Market Risk Factors
            </h4>
            <ul className="space-y-2 text-xs text-[#1a2530]">
              {evaluation.risk_factors.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#f8f6f0] p-2.5 rounded-xl border border-[#e5e0d4] font-medium">
                  <span className="text-amber-700 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InnovationScorerPage;
