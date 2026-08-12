import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Dataset of domain-specific research projects
const ALL_PAPERS = [
  {
    id: 1,
    Title: "Quantum Computing Applications in Cryptographic Security",
    "Fields of science": "Quantum Computing",
    "Project start date": "2026-03-15",
    Teaser: "An in-depth analysis of post-quantum cryptography algorithms designed to withstand attacks from next-generation quantum processing units.",
    URL: "#",
    "Project acronym": "QUANT-SEC"
  },
  {
    id: 2,
    Title: "CRISPR-Cas12 Targeted Gene Editing in Agricultural Resilience",
    "Fields of science": "Biotechnology",
    "Project start date": "2026-01-28",
    Teaser: "Evaluating drought-resistant crop modifications using CRISPR-Cas12 sequence targeted insertions in arid soil conditions.",
    URL: "#",
    "Project acronym": "CRISPR-AG"
  },
  {
    id: 3,
    Title: "Autonomous Drone Swarm Logistics for Emergency Response",
    "Fields of science": "Robotics",
    "Project start date": "2025-11-10",
    Teaser: "Framework for decentralizing decision-making across disaster-relief drone swarms operating without active GPS links.",
    URL: "#",
    "Project acronym": "DRONE-AI"
  },
  {
    id: 4,
    Title: "Deep Reinforcement Learning for Humanoid Balance Control",
    "Fields of science": "Robotics",
    "Project start date": "2026-02-04",
    Teaser: "Neural network architectures trained in simulation environments to maintain dynamic bipedal stability over uneven terrain.",
    URL: "#",
    "Project acronym": "ROBO-BAL"
  },
  {
    id: 5,
    Title: "Large Language Models in Automated Medical Diagnostics",
    "Fields of science": "Artificial Intelligence",
    "Project start date": "2026-04-12",
    Teaser: "Fine-tuning transformer models on clinical trial data to assist radiologists with early tumor detection.",
    URL: "#",
    "Project acronym": "MED-AI"
  }
];

const POPULAR_DOMAINS = ["Robotics", "Artificial Intelligence", "Biotechnology", "Quantum Computing"];

const Research = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDomain = searchParams.get('domain') || '';

  const [inputQuery, setInputQuery] = useState(selectedDomain);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(selectedDomain));

  // Helper function to strictly filter projects by field only
  const filterStrictByField = (list, query) => {
    if (!query) return [];
    const searchKey = query.toLowerCase();
    return list.filter((p) => {
      const field = p["Fields of science"] || p["Research Field"] || p.domain || "";
      return field.toLowerCase().includes(searchKey);
    });
  };

  useEffect(() => {
    if (!selectedDomain) {
      setPapers([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setInputQuery(selectedDomain);

    const token = localStorage.getItem('token');
    const fetchUrl = `http://127.0.0.1:5000/search?keyword=${encodeURIComponent(selectedDomain)}`;

    axios.get(fetchUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      const results = res.data.projects || res.data;
      if (Array.isArray(results) && results.length > 0) {
        // Enforce strict field filtering on backend results as well
        const strictResults = filterStrictByField(results, selectedDomain);
        setPapers(strictResults);
      } else {
        setPapers(filterStrictByField(ALL_PAPERS, selectedDomain));
      }
    })
    .catch(() => {
      // Fallback: Strict local filter
      setPapers(filterStrictByField(ALL_PAPERS, selectedDomain));
    })
    .finally(() => setLoading(false));
  }, [selectedDomain]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({ domain: inputQuery.trim() });
    }
  };

  const handleDomainSelect = (domain) => {
    setInputQuery(domain);
    setSearchParams({ domain });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', minHeight: '70vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0f172a' }}>
          Explore Research Papers
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1rem' }}>
          Search by keyword or select a domain to discover relevant academic studies and whitepapers.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="e.g. Robotics, Artificial Intelligence, CRISPR..."
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </form>

      {/* Quick Domain Filter Tags */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Quick Select:</span>
        {POPULAR_DOMAINS.map((domain) => (
          <button
            key={domain}
            onClick={() => handleDomainSelect(domain)}
            style={{
              border: selectedDomain.toLowerCase() === domain.toLowerCase() ? '1px solid #2563eb' : '1px solid #e2e8f0',
              backgroundColor: selectedDomain.toLowerCase() === domain.toLowerCase() ? '#eff6ff' : '#f8fafc',
              color: selectedDomain.toLowerCase() === domain.toLowerCase() ? '#2563eb' : '#334155',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {domain}
          </button>
        ))}
      </div>

      {/* State 1: Prompt before searching */}
      {!hasSearched && (
        <div style={{ textAlign: 'center', padding: '48px 16px', border: '2px dashed #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            No Domain Selected
          </h3>
          <p style={{ color: '#64748b' }}>
            Please enter a keyword above or select a domain tag to load related research papers.
          </p>
        </div>
      )}

      {/* State 2: Loading */}
      {loading && (
        <p style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>
          Searching for research papers in <strong>{selectedDomain}</strong>...
        </p>
      )}

      {/* State 3: No Results Found */}
      {hasSearched && !loading && papers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>
            No papers found for "{selectedDomain}"
          </h3>
          <p style={{ color: '#64748b', marginTop: '8px' }}>
            Try searching for another keyword or picking one of the quick select domains above.
          </p>
        </div>
      )}

      {/* State 4: Display Papers */}
      {hasSearched && !loading && papers.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#334155', marginBottom: '20px' }}>
            Results for <span style={{ color: '#2563eb' }}>"{selectedDomain}"</span> ({papers.length})
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {papers.map((paper, index) => {
              const title = paper["Title"] || paper.title;
              const domain = paper["Fields of science"] || paper["Research Field"] || paper.domain || selectedDomain;
              const acronym = paper["Project acronym"] || paper.acronym;
              const date = paper["Project start date"] || paper.date;
              const teaser = paper["Teaser"] || paper.abstract;
              const url = paper["URL"] || paper.link || '#';

              return (
                <div key={paper.id || index} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#2563eb',
                        backgroundColor: '#eff6ff',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {domain}
                      </span>
                      {acronym && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>
                          {acronym}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                      {title}
                    </h3>

                    {date && (
                      <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '12px', fontWeight: '500' }}>
                        Start Date: {date}
                      </p>
                    )}

                    <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
                      {teaser}
                    </p>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Read Paper
                    </a>
                    <button style={{
                      border: '1px solid #cbd5e1',
                      backgroundColor: 'transparent',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}>
                      Bookmark
                    </button>
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

export default Research;