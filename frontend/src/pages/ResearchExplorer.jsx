import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getResearchPapers,
  saveBookmark,
} from "../services/api";
import {
  FaSearch,
  FaBookOpen,
  FaExternalLinkAlt,
  FaBookmark,
} from "react-icons/fa";

function ResearchExplorer() {
  const [papers, setPapers] = useState([]);
  const [search, setSearch] = useState("artificial intelligence");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await getResearchPapers(search);
      setPapers(res.data);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch papers.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (paper) => {
    try {
      const response = await saveBookmark(paper);
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert("Failed to save bookmark.");
    }
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              color: "#1e293b",
              marginBottom: "10px",
            }}
          >
            Research Explorer
          </h1>

          <p
            style={{
              color: "#64748b",
              marginBottom: "30px",
            }}
          >
            Search real research papers from OpenAlex.
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                borderRadius: "10px",
                padding: "12px 20px",
                flex: 1,
                boxShadow: "0 4px 12px rgba(0,0,0,.08)",
              }}
            >
              <FaSearch color="#2563eb" />

              <input
                type="text"
                value={search}
                placeholder="Search Topic..."
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchPapers();
                  }
                }}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  marginLeft: "12px",
                  fontSize: "16px",
                }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={fetchPapers}
            >
              Search
            </button>
          </div>

          {loading ? (
            <h3>Loading papers...</h3>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              {papers.map((paper, index) => (
                <div
                  key={index}
                  style={{
                    background: "#fff",
                    borderRadius: "15px",
                    padding: "25px",
                    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
                  }}
                >
                  <h3
                    style={{
                      color: "#2563eb",
                    }}
                  >
                    <FaBookOpen /> {paper.title}
                  </h3>

                  <p>
                    <strong>Authors:</strong>{" "}
                    {paper.authors || "N/A"}
                  </p>

                  <p>
                    <strong>Year:</strong>{" "}
                    {paper.year || "N/A"}
                  </p>

                  <p>
                    <strong>Abstract:</strong>
                  </p>

                  <p
                    style={{
                      color: "#64748b",
                      lineHeight: "1.7",
                    }}
                  >
                    {paper.abstract ||
                      "No abstract available."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "20px",
                    }}
                  >
                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        <FaExternalLinkAlt className="me-2" />
                        Read Paper
                      </a>
                    )}

                    <button
                      className="btn btn-success"
                      onClick={() =>
                        handleBookmark(paper)
                      }
                    >
                      <FaBookmark className="me-2" />
                      Save Paper
                    </button>
                  </div>
                </div>
              ))}

              {papers.length === 0 && (
                <div
                  style={{
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "15px",
                    textAlign: "center",
                  }}
                >
                  No research papers found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ResearchExplorer;