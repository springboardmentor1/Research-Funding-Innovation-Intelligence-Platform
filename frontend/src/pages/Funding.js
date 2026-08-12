import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Sample fallback grants if backend is loading or dataset is empty
const INITIAL_GRANTS = [
  {
    id: 1,
    title: "Horizon Europe Research & Innovation Grant",
    field: "Artificial Intelligence",
    amount: 2500000,
    deadline: "2026-11-30",
    teaser: "Grants dedicated to advancing transparent, explainable, and trustworthy AI frameworks across healthcare and automation."
  },
  {
    id: 2,
    title: "Global Robotics Innovation Fund",
    field: "Robotics",
    amount: 1800000,
    deadline: "2026-10-15",
    teaser: "Funding seed-stage research on autonomous drone swarms, bipedal balance controllers, and tactile robotic manipulators."
  },
  {
    id: 3,
    title: "Agricultural Biotechnology Climate Resilience Grant",
    field: "Biotechnology",
    amount: 950000,
    deadline: "2026-09-20",
    teaser: "Support for CRISPR sequence editing, targeted gene insertions, and drought-resistant crop engineering."
  },
  {
    id: 4,
    title: "Post-Quantum Cryptography Advancement Pool",
    field: "Quantum Computing",
    amount: 3100000,
    deadline: "2026-12-01",
    teaser: "Targeted capital injection for academic consortia developing lattice-based post-quantum encryption standards."
  }
];

const CATEGORIES = ["All Domains", "Artificial Intelligence", "Robotics", "Biotechnology", "Quantum Computing"];

const Funding = () => {
  const [grants, setGrants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Domains");
  const [searchTerm, setSearchTerm] = useState("");
  const [maxBudget, setMaxBudget] = useState(5000000);
  const [savedGrants, setSavedGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch funding data from Flask backend
  useEffect(() => {
    fetchGrants(selectedCategory);
  }, [selectedCategory]);

  const fetchGrants = (category) => {
    setLoading(true);
    const keyword = category === "All Domains" ? "" : category;
    
    axios.get(`http://127.0.0.1:5000/funding?keyword=${encodeURIComponent(keyword)}`)
      .then((res) => {
        const data = res.data.grants || [];
        if (data.length > 0) {
          // Normalize backend data structure
          const formatted = data.map((item, idx) => ({
            id: item.id || idx + 1,
            title: item.Title || item.title || "Research Grant Call",
            field: item["Fields of science"] || item["Research Field"] || item.field || "General Science",
            amount: parseInt(item.funding_amount || item.amount || 1500000),
            deadline: item.deadline || "2026-12-31",
            teaser: item.Teaser || item.teaser || item.description || "Funding available for qualified research programs."
          }));
          setGrants(formatted);
        } else {
          filterFallbackData(keyword);
        }
      })
      .catch(() => {
        filterFallbackData(keyword);
      })
      .finally(() => setLoading(false));
  };

  const filterFallbackData = (keyword) => {
    if (!keyword) {
      setGrants(INITIAL_GRANTS);
    } else {
      const filtered = INITIAL_GRANTS.filter(g => 
        g.field.toLowerCase().includes(keyword.toLowerCase())
      );
      setGrants(filtered);
    }
  };

  // Toggle saving/bookmarking a grant
  const toggleSave = (id) => {
    if (savedGrants.includes(id)) {
      setSavedGrants(savedGrants.filter(gId => gId !== id));
    } else {
      setSavedGrants([...savedGrants, id]);
    }
  };

  // Filter local results based on user text search and budget slider
  const displayedGrants = grants.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.teaser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBudget = g.amount <= maxBudget;
    return matchesSearch && matchesBudget;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', minHeight: '80vh' }}>
      
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0f172a' }}>
          Interactive Funding & Grants Explorer
        </h1>
        <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>
          Select categories, adjust funding criteria, and bookmark opportunities tailored to your research.
        </p>
      </div>

      {/* User Interactive Control Panel */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        
        {/* Row 1: Search & Budget Range Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Search Grant Titles or Keywords
            </label>
            <input
              type="text"
              placeholder="e.g., Climate, Neural, Security..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
                Max Budget Filter
              </label>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#2563eb' }}>
                ${maxBudget.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="5000000"
              step="250000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

        </div>

        {/* Row 2: Selectable Domain Tags */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Select Domain Category:
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? '#2563eb' : '#f1f5f9',
                  color: selectedCategory === cat ? '#ffffff' : '#334155',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Results Section */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading available opportunities...</p>
      ) : displayedGrants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#475569' }}>No grants matching your selection</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Try increasing the budget slider or clearing the search text.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {displayedGrants.map((grant) => {
            const isSaved = savedGrants.includes(grant.id);

            return (
              <div
                key={grant.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803d', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '12px' }}>
                      {grant.field}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2563eb' }}>
                      ${grant.amount.toLocaleString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', lineHeight: '1.3' }}>
                    {grant.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '500', marginBottom: '12px' }}>
                    📅 Deadline: {grant.deadline}
                  </p>

                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                    {grant.teaser}
                  </p>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => alert(`Redirecting to application portal for: ${grant.title}`)}
                    style={{
                      flex: '1',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Apply Now
                  </button>

                  <button
                    onClick={() => toggleSave(grant.id)}
                    style={{
                      backgroundColor: isSaved ? '#fef3c7' : '#ffffff',
                      color: isSaved ? '#d97706' : '#64748b',
                      border: isSaved ? '1px solid #f59e0b' : '1px solid #cbd5e1',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {isSaved ? '★ Saved' : '☆ Bookmark'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Funding;