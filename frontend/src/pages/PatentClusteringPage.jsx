import React, { useState } from 'react';
import api from '../services/api';
import { FileCode2, Sparkles, Layers, ArrowRight, ExternalLink } from 'lucide-react';

const PatentClusteringPage = () => {
  const [ideaText, setIdeaText] = useState('Convolutional neural network for automatic MRI scan segmentations');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!ideaText) return;
    setLoading(true);
    try {
      const res = await api.post(`/patents/similar?idea_text=${encodeURIComponent(ideaText)}`);
      setResults(res.data);
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
          <Layers className="w-6 h-6 text-[#24527a]" />
          Patent Vector Similarity & Concept Clustering
        </h1>
        <p className="text-xs text-[#576574] mt-1 font-semibold">
          Vector space embedding comparison of your research idea against active patent abstracts
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm space-y-4">
        <label className="block text-xs font-bold text-[#1a2530]">Enter Research Abstract or Technology Concept</label>
        <textarea
          rows={3}
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          className="w-full bg-white border border-[#dcd6c8] rounded-2xl p-4 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
          placeholder="Paste research concept or proposal title to analyze prior art similarity..."
        />

        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-6 py-2.5 bg-[#24527a] hover:bg-[#1b3d5c] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
        >
          {loading ? 'Analyzing Vector Embeddings...' : 'Calculate Similarity & Prior Art Links'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-[#1a2530]">Semantic Patent Similarity Rankings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r, idx) => {
              const patentUrl = r.patent.url || `https://patents.google.com/patent/${r.patent.patent_id}`;
              return (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-[#e2ded4] shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#24527a]/15 text-[#24527a] font-extrabold text-[10px]">
                        {r.similarity_score}% Vector Similarity
                      </span>
                      <span className="text-[10px] text-[#576574] font-mono font-bold">{r.patent.patent_id}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1a2530] mb-1">{r.patent.title}</h4>
                    <p className="text-[11px] text-[#247291] font-bold mb-2">Assignee: {r.patent.assignee}</p>
                    <p className="text-xs text-[#576574] line-clamp-3 mb-3 font-medium">{r.patent.abstract}</p>
                  </div>

                  <div className="pt-3 border-t border-[#e2ded4] flex justify-end">
                    <a
                      href={patentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24527a]/10 hover:bg-[#24527a] text-xs font-bold text-[#24527a] hover:text-white border border-[#24527a]/30 transition"
                    >
                      View Patent Record <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatentClusteringPage;
