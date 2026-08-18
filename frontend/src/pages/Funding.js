import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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
  },
  {
    id: 5,
    title: "Early Career Research Support Grant",
    field: "General Science",
    amount: 250000,
    deadline: "2026-08-30",
    teaser: "Small-scale funding support for early-stage academic research, prototype development, and exploratory studies."
  },
  {
    id: 6,
    title: "Innovative Research Seed Grant",
    field: "General Science",
    amount: 500000,
    deadline: "2026-09-15",
    teaser: "Seed funding for innovative research ideas, proof-of-concept studies, and interdisciplinary projects."
  }
];

const CATEGORIES = [
  "All Domains",
  "Artificial Intelligence",
  "Robotics",
  "Biotechnology",
  "Quantum Computing"
];

const parseAmount = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const cleaned = String(value).replace(/[$,\s]/g, '');
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
};

const Funding = () => {
  const [grants, setGrants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Domains");
  const [searchTerm, setSearchTerm] = useState("");
  const [maxBudget, setMaxBudget] = useState(5000000);
  const [savedGrants, setSavedGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterFallbackData = useCallback((keyword) => {
    if (!keyword) {
      setGrants(INITIAL_GRANTS);
      return;
    }

    const filtered = INITIAL_GRANTS.filter((grant) =>
      grant.field.toLowerCase().includes(keyword.toLowerCase()) ||
      grant.title.toLowerCase().includes(keyword.toLowerCase()) ||
      grant.teaser.toLowerCase().includes(keyword.toLowerCase())
    );

    setGrants(filtered);
  }, []);

  const fetchGrants = useCallback(async (category) => {
    setLoading(true);

    const keyword = category === "All Domains" ? "" : category;

    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/funding?keyword=${encodeURIComponent(keyword)}`
      );

      const data = response.data.grants || [];

      if (data.length > 0) {
        const formatted = data.map((item, index) => {
          const amountValue =
            item.funding_amount ??
            item["Funding Amount"] ??
            item["Funding amount"] ??
            item["Grant Amount"] ??
            item["Grant amount"] ??
            item["Maximum Grant"] ??
            item["Maximum grant"] ??
            item["Max Budget"] ??
            item["Budget"] ??
            item.amount ??
            null;

          const parsedAmount = parseAmount(amountValue);

          return {
            id: item.id || item.ID || index + 1,
            title:
              item.Title ||
              item.title ||
              item["Grant Title"] ||
              "Research Grant Call",
            field:
              item["Fields of science"] ||
              item["Research Field"] ||
              item.field ||
              category ||
              "General Science",
            amount:
              parsedAmount !== null
                ? parsedAmount
                : INITIAL_GRANTS[index % INITIAL_GRANTS.length].amount,
            deadline:
              item.deadline ||
              item.Deadline ||
              item["Application Deadline"] ||
              "2026-12-31",
            teaser:
              item.Teaser ||
              item.teaser ||
              item.Description ||
              item.description ||
              "Funding available for qualified research programs."
          };
        });

        setGrants(formatted);
      } else {
        filterFallbackData(keyword);
      }
    } catch (error) {
      filterFallbackData(keyword);
    } finally {
      setLoading(false);
    }
  }, [filterFallbackData]);

  useEffect(() => {
    fetchGrants(selectedCategory);
  }, [selectedCategory, fetchGrants]);

  const toggleSave = (id) => {
    setSavedGrants((previous) => {
      if (previous.includes(id)) {
        return previous.filter((grantId) => grantId !== id);
      }

      return [...previous, id];
    });
  };

  const displayedGrants = grants
    .filter((grant) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        grant.title.toLowerCase().includes(search) ||
        grant.teaser.toLowerCase().includes(search) ||
        grant.field.toLowerCase().includes(search);

      return matchesSearch;
    })
    .sort((a, b) => {
      const aWithinBudget = a.amount <= maxBudget;
      const bWithinBudget = b.amount <= maxBudget;

      if (aWithinBudget && !bWithinBudget) {
        return -1;
      }

      if (!aWithinBudget && bWithinBudget) {
        return 1;
      }

      if (aWithinBudget && bWithinBudget) {
        return b.amount - a.amount;
      }

      return (
        Math.abs(a.amount - maxBudget) -
        Math.abs(b.amount - maxBudget)
      );
    });

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px',
        minHeight: '80vh'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: '28px'
        }}
      >
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: '#0f172a'
          }}
        >
          Interactive Funding & Grants Explorer
        </h1>

        <p
          style={{
            color: '#64748b',
            marginTop: '6px',
            fontSize: '1rem'
          }}
        >
          Select categories, adjust funding criteria, and bookmark opportunities tailored to your research.
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '6px'
              }}
            >
              Search Grant Titles or Keywords
            </label>

            <input
              type="text"
              placeholder="e.g., Climate, Neural, Security..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '6px'
              }}
            >
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#334155'
                }}
              >
                Maximum Budget
              </label>

              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: '#2563eb'
                }}
              >
                ${maxBudget.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="5000000"
              step="100000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              style={{
                width: '100%',
                cursor: 'pointer'
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}
            >
              <span>$0</span>
              <span>$5,000,000</span>
            </div>
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '8px'
            }}
          >
            Select Domain Category:
          </label>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  backgroundColor:
                    selectedCategory === category
                      ? '#2563eb'
                      : '#f1f5f9',
                  color:
                    selectedCategory === category
                      ? '#ffffff'
                      : '#334155',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <h2
          style={{
            color: '#0f172a',
            fontSize: '1.25rem'
          }}
        >
          Funding Opportunities
        </h2>

        {!loading && (
          <span
            style={{
              color: '#64748b',
              fontSize: '0.9rem'
            }}
          >
            {displayedGrants.length} opportunities found
          </span>
        )}
      </div>

      {loading ? (
        <p
          style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '40px'
          }}
        >
          Loading available opportunities...
        </p>
      ) : displayedGrants.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1'
          }}
        >
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#475569'
            }}
          >
            No relevant funding opportunities found
          </h3>

          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.9rem',
              marginTop: '4px'
            }}
          >
            Try changing the domain or search keywords.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {displayedGrants.map((grant) => {
            const isSaved = savedGrants.includes(grant.id);
            const withinBudget = grant.amount <= maxBudget;

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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      gap: '10px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#15803d',
                        backgroundColor: '#f0fdf4',
                        padding: '4px 10px',
                        borderRadius: '12px'
                      }}
                    >
                      {grant.field}
                    </span>

                    <div
                      style={{
                        textAlign: 'right',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          color: withinBudget
                            ? '#15803d'
                            : '#d97706'
                        }}
                      >
                        ${grant.amount.toLocaleString()}
                      </div>

                      <div
                        style={{
                          fontSize: '0.7rem',
                          marginTop: '2px',
                          color: withinBudget
                            ? '#15803d'
                            : '#d97706'
                        }}
                      >
                        {withinBudget
                          ? 'Within Budget'
                          : 'Above Selected Budget'}
                      </div>
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 'bold',
                      color: '#0f172a',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}
                  >
                    {grant.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: '#dc2626',
                      fontWeight: '500',
                      marginBottom: '12px'
                    }}
                  >
                    📅 Deadline: {grant.deadline}
                  </p>

                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: '#475569',
                      lineHeight: '1.5'
                    }}
                  >
                    {grant.teaser}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    display: 'flex',
                    gap: '10px'
                  }}
                >
                  <button
                    onClick={() =>
                      alert(
                        `Redirecting to application portal for: ${grant.title}`
                      )
                    }
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
                      border: isSaved
                        ? '1px solid #f59e0b'
                        : '1px solid #cbd5e1',
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