import React, { useState, useEffect } from 'react';

const DOMAINS = [
  'All Domains',
  'Artificial Intelligence',
  'Robotics',
  'Biotechnology',
  'Quantum Computing'
];

const INITIAL_PATENTS = [
  {
    id: 'US-2026-0089211',
    title: 'Quantum Key Distribution via Earth-to-Satellite Free-Space Optics',
    domain: 'Quantum Computing',
    status: 'Granted',
    assignee: 'Aegis Quantum Systems Inc.',
    abstract: 'A method and architecture for real-time quantum state phase shifting and satellite beam alignment to secure terrestrial optical links against interception.',
    claimText: '1. A system for free-space quantum key distribution comprising: a satellite transceiver configured to emit single-photon quantum states; an optical tracking unit for real-time phase alignment; and a ground receiver configured to perform quantum state measurement with minimum error rates.'
  },
  {
    id: 'EP-2025-4412098',
    title: 'Neural Feedback Loop Control for Bipedal Dynamic Stabilization',
    domain: 'Robotics',
    status: 'Pending',
    assignee: 'BioRobotics Dynamics GmbH',
    abstract: 'Reinforcement-learning-driven motor actuate control for bipedal robots executing high-speed locomotion over irregular terrain.',
    claimText: '1. A method for controlling bipedal locomotion comprising: obtaining dynamic telemetry from feet pressure sensors; processing joint angles through a recurrent neural network; and applying localized torque compensations within 2 milliseconds.'
  },
  {
    id: 'US-2026-0128904',
    title: 'Self-Attention Transformer Hardware Accelerator with Sparse Matrix Compression',
    domain: 'Artificial Intelligence',
    status: 'Granted',
    assignee: 'Vertex Semiconductor Labs',
    abstract: 'A customized ASIC microarchitecture optimized for low-latency matrix multiplication during multi-head self-attention inference.',
    claimText: '1. An integrated circuit accelerator comprising: a grid of systolic processing elements; a zero-value pruning engine configured to bypass sparse matrix multiplications; and an on-chip SRAM buffer optimized for transformer attention weights.'
  },
  {
    id: 'WO-2026-0043120',
    title: 'Targeted Lipid Nanoparticle Vectors for In-Vivo CRISPR Gene Delivery',
    domain: 'Biotechnology',
    status: 'Pending',
    assignee: 'GeneCraft Therapeutics Ltd.',
    abstract: 'Formulations for tissue-specific lipid nanoparticles delivering Cas9 mRNA and guide RNAs directly to hepatocytes without off-target cytotoxicity.',
    claimText: '1. A lipid nanoparticle composition comprising: an ionizable amino lipid; a target-binding ligand specific to liver cell receptors; and an encapsulated ribonucleoprotein complex capable of site-specific genomic cleavage.'
  }
];

export default function Patents() {
  const [patents, setPatents] = useState(INITIAL_PATENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  
  // Initialize bookmarked IDs directly from localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('app_bookmarks') || '[]');
    return saved.map((item) => item.id);
  });
  
  const [activeClaimPatent, setActiveClaimPatent] = useState(null);

  // Fetch patents from backend, fallback to initial state if API is unavailable
  useEffect(() => {
    fetch('http://127.0.0.1:5000/patents')
      .then((res) => {
        if (!res.ok) throw new Error('API off');
        return res.json();
      })
      .then((data) => {
        if (data.patents && data.patents.length > 0) {
          const formatted = data.patents.map((item, index) => ({
            id: item.id || item["Patent No"] || `PAT-${index + 1000}`,
            title: item.title || item["Title"] || 'Untitled Patent',
            domain: item.domain || item["Fields of science"] || item["Research Field"] || 'General Science',
            status: item.status || item["Status"] || 'Granted',
            assignee: item.assignee || item["Assignee"] || 'Unknown Assignee',
            abstract: item.abstract || item["Abstract"] || 'No abstract available.',
            claimText: item.claims || item.claimText || '1. System and method for executing field-specific innovations as detailed in specification.'
          }));
          setPatents(formatted);
        }
      })
      .catch(() => {
        // Keeps fallback patents
      });
  }, []);

  // Sync bookmarks with localStorage
  const toggleBookmark = (patent) => {
    const existing = JSON.parse(localStorage.getItem('app_bookmarks') || '[]');
    const exists = existing.some((item) => item.id === patent.id);

    let updatedBookmarks;
    if (exists) {
      updatedBookmarks = existing.filter((item) => item.id !== patent.id);
    } else {
      updatedBookmarks = [
        ...existing,
        {
          id: patent.id,
          title: patent.title,
          description: patent.abstract,
          type: 'Patent',
          domain: patent.domain
        }
      ];
    }

    // Save array to localStorage and sync local component state
    localStorage.setItem('app_bookmarks', JSON.stringify(updatedBookmarks));
    setBookmarkedIds(updatedBookmarks.map((item) => item.id));
  };

  // Filtering Logic
  const filteredPatents = patents.filter((patent) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      patent.title.toLowerCase().includes(term) ||
      patent.id.toLowerCase().includes(term) ||
      patent.assignee.toLowerCase().includes(term) ||
      patent.abstract.toLowerCase().includes(term);

    const matchesStatus =
      selectedStatus === 'All Statuses' ||
      patent.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchesDomain =
      selectedDomain === 'All Domains' ||
      patent.domain.toLowerCase() === selectedDomain.toLowerCase();

    return matchesSearch && matchesStatus && matchesDomain;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
          Patents & Intellectual Property Explorer
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          Search registered patents, patent application filings, assignee records, and novelty abstracts.
        </p>
      </div>

      {/* Filter Controls Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          
          {/* Search Bar */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Search Patent ID, Title, or Assignee
            </label>
            <input
              type="text"
              placeholder="e.g., Quantum, Aegis, US-2026..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Legal Status Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Filter by Legal Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Granted">Granted</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Domain Selection Pills */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Domain Field:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {DOMAINS.map((domain) => {
              const isSelected = selectedDomain === domain;
              return (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: isSelected ? '#0284c7' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#334155'
                  }}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Patent Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredPatents.length > 0 ? (
          filteredPatents.map((patent) => {
            const isBookmarked = bookmarkedIds.includes(patent.id);
            const isGranted = patent.status.toLowerCase() === 'granted';

            return (
              <div
                key={patent.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  {/* Card Header: Domain Tag & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '12px' }}>
                      {patent.domain}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: isGranted ? '#dcfce7' : '#fef3c7',
                        color: isGranted ? '#15803d' : '#b45309'
                      }}
                    >
                      • {patent.status}
                    </span>
                  </div>

                  {/* Patent ID & Title */}
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    Patent No: {patent.id}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px', lineHeight: '1.4' }}>
                    {patent.title}
                  </h3>

                  {/* Assignee */}
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏢 <span><strong>Assignee:</strong> {patent.assignee}</span>
                  </div>

                  {/* Abstract */}
                  <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5', marginBottom: '20px' }}>
                    {patent.abstract}
                  </p>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <button
                    onClick={() => setActiveClaimPatent(patent)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    View Claims
                  </button>
                  <button
                    onClick={() => toggleBookmark(patent)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: isBookmarked ? '#fef3c7' : '#ffffff',
                      color: isBookmarked ? '#b45309' : '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
            No patents found matching your search and filter options.
          </div>
        )}
      </div>

      {/* Claims Modal Popup */}
      {activeClaimPatent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setActiveClaimPatent(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '28px',
              borderRadius: '12px',
              maxWidth: '650px',
              width: '90%',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#0284c7' }}>
                {activeClaimPatent.id}
              </span>
              <button
                onClick={() => setActiveClaimPatent(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
              {activeClaimPatent.title}
            </h2>

            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>
              <strong>Assignee:</strong> {activeClaimPatent.assignee}
            </p>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                Patent Claims Specification:
              </h4>
              <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#334155', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {activeClaimPatent.claimText}
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '24px' }}>
              <button
                onClick={() => setActiveClaimPatent(null)}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}