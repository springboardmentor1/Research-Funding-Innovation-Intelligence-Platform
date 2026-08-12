import React, { useState, useEffect } from 'react';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    // Load saved bookmarks from localStorage
    const saved = JSON.parse(localStorage.getItem('app_bookmarks') || '[]');
    setBookmarks(saved);
  }, []);

  const removeBookmark = (id) => {
    const updated = bookmarks.filter((item) => item.id !== id);
    setBookmarks(updated);
    localStorage.setItem('app_bookmarks', JSON.stringify(updated));
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
    localStorage.removeItem('app_bookmarks');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            Your Bookmarked Opportunities
          </h1>
          <p style={{ color: '#64748b', marginTop: '6px' }}>
            Manage saved research projects, funding grants, and patent filings in one place.
          </p>
        </div>
        {bookmarks.length > 0 && (
          <button
            onClick={clearAllBookmarks}
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#475569', margin: 0 }}>No Bookmarks Saved Yet</h3>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>
            Explore Research, Funding, or Patents and click the ☆ Bookmark button to save items here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {bookmarks.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '12px' }}>
                    {item.type || 'Saved Item'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b' }}>
                    {item.id}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>
                  {item.description || item.abstract || 'No details provided.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', textAlign: 'right' }}>
                <button
                  onClick={() => removeBookmark(item.id)}
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}