import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, ExternalLink, BookOpen, Quote, Calendar, User, Tag, CheckCircle2 } from 'lucide-react';

const ResearchDiscoveryPage = () => {
  const [papers, setPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [minCitations, setMinCitations] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (domainFilter) params.domain = domainFilter;
      if (minCitations) params.min_citations = minCitations;
      
      const res = await api.get('/research/papers', { params });
      setPapers(res.data);
    } catch (err) {
      console.error("Error fetching papers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const getVerifiedPaperLink = (paper) => {
    if (paper.url && !paper.url.includes("openalex.org/W")) {
      return paper.url;
    }
    if (paper.doi && paper.doi.startsWith("http")) {
      return paper.doi;
    }
    return `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#24527a]" />
          Research Discovery Engine
        </h1>
        <p className="text-xs text-[#576574] mt-1 font-semibold">
          Explore authentic research papers indexed across 15 years from IEEE Xplore, arXiv, Nature, Science, and PubMed
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-3xl border border-[#e2ded4] shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#576574] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPapers()}
            placeholder="Search titles, abstracts, concepts, or authors..."
            className="w-full bg-white border border-[#dcd6c8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a]"
          />
        </div>

        <input
          type="text"
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          placeholder="Filter by Domain (e.g. Deep Learning)"
          className="bg-white border border-[#dcd6c8] rounded-xl px-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a] md:w-56"
        />

        <input
          type="number"
          value={minCitations}
          onChange={(e) => setMinCitations(e.target.value)}
          placeholder="Min Citations"
          className="bg-white border border-[#dcd6c8] rounded-xl px-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a] md:w-36"
        />

        <button
          onClick={fetchPapers}
          className="px-6 py-2.5 bg-[#24527a] hover:bg-[#1b3d5c] text-white font-bold rounded-xl text-xs shadow-md transition shrink-0"
        >
          Search Papers
        </button>
      </div>

      {/* Papers Results Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#24527a] border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-[#576574] font-bold">Showing <strong className="text-[#1a2530] text-sm">{papers.length}</strong> verified research publications</span>
          </div>

          {papers.map((paper) => {
            const paperTargetUrl = getVerifiedPaperLink(paper);
            return (
              <div key={paper.id} className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm hover:border-[#24527a]/40 transition space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#24527a]/15 text-[#24527a] font-extrabold text-[11px]">
                    {paper.source || 'IEEE / arXiv Journal'}
                  </span>
                  {paper.open_access && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Open Access
                    </span>
                  )}
                  <span className="text-xs text-[#576574] font-bold flex items-center gap-1 ml-auto">
                    <Calendar className="w-3.5 h-3.5 text-[#24527a]" /> Year: {paper.publication_year}
                  </span>
                  <span className="text-xs text-amber-700 font-extrabold flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    <Quote className="w-3.5 h-3.5" /> {paper.citation_count.toLocaleString()} Citations
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#1a2530] leading-snug mb-1.5">{paper.title}</h3>
                  <p className="text-xs text-[#24527a] font-bold flex items-center gap-1.5 mb-2">
                    <User className="w-3.5 h-3.5" /> Authors: {paper.authors}
                  </p>
                  <div className="p-4 bg-[#f8f6f0] rounded-2xl border border-[#e5e0d4]">
                    <p className="text-xs text-[#2c3e50] leading-relaxed font-medium">
                      {paper.abstract || "No abstract description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {paper.concepts ? paper.concepts.split(',').map((concept, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[#f0ece2] text-[#24527a] text-[10px] font-bold border border-[#e2ded4]">
                        #{concept.trim()}
                      </span>
                    )) : null}
                  </div>

                  <a
                    href={paperTargetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#24527a] hover:bg-[#1b3d5c] text-white text-xs font-bold shadow-md transition"
                  >
                    View Official Paper on IEEE / arXiv / Publisher <ExternalLink className="w-3.5 h-3.5" />
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

export default ResearchDiscoveryPage;
