import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileCode2, Search, ExternalLink, Building, Tag, ShieldCheck, Quote } from 'lucide-react';

const PatentIntelligencePage = () => {
  const [patents, setPatents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (assigneeFilter) params.assignee = assigneeFilter;
      const res = await api.get('/patents/', { params });
      setPatents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530]">Patent Intelligence & Prior Art</h1>
        <p className="text-xs text-[#576574] mt-1 font-semibold">
          Search USPTO patent filings, assignees, classifications, and official patent gazette links
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#e2ded4] shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#576574] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPatents()}
            placeholder="Search patent titles, abstracts, or CPC classifications..."
            className="w-full bg-white border border-[#dcd6c8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a]"
          />
        </div>

        <input
          type="text"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          placeholder="Assignee (e.g. MedTech)"
          className="bg-white border border-[#dcd6c8] rounded-xl px-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a] md:w-60"
        />

        <button
          onClick={fetchPatents}
          className="px-5 py-2.5 bg-[#24527a] hover:bg-[#1b3d5c] text-white font-bold rounded-xl text-xs shadow-md transition"
        >
          Search Patents
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#24527a] border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {patents.map((patent) => {
            const patentUrl = patent.url || `https://patents.google.com/patent/${patent.patent_id}`;
            return (
              <div key={patent.id} className="bg-white p-5 rounded-2xl border border-[#e2ded4] shadow-sm hover:border-[#24527a]/40 transition">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#24527a]/15 text-[#24527a] font-extrabold text-[10px]">
                    {patent.patent_id}
                  </span>
                  <span className="text-[11px] text-[#576574] font-medium">Filed: {patent.filing_date} • Published: {patent.publication_date}</span>
                  <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1 ml-auto">
                    <Quote className="w-3 h-3" /> {patent.citation_count} patent citations
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-[#1a2530] mb-1">{patent.title}</h3>
                <p className="text-xs text-[#247291] font-bold mb-2 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> Assignee: {patent.assignee} (Inventors: {patent.inventors})
                </p>
                <p className="text-xs text-[#576574] leading-relaxed mb-3 font-medium">{patent.abstract}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e2ded4]">
                  <span className="text-[10px] text-[#1a2530] bg-[#f8f6f0] px-2.5 py-1 rounded font-mono font-bold border border-[#e5e0d4]">
                    CPC Classification: {patent.classification}
                  </span>

                  <a
                    href={patentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24527a]/10 hover:bg-[#24527a] text-xs font-bold text-[#24527a] hover:text-white border border-[#24527a]/30 transition"
                  >
                    Google Patent Gazette <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatentIntelligencePage;
