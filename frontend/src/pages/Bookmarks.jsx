import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getBookmarks,
  deleteBookmarks,
} from "../services/api";
import {
  FaBookmark,
  FaExternalLinkAlt,
  FaTrash,
} from "react-icons/fa";

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);

      const response = await getBookmarks();

      setBookmarks(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  const clearBookmarks = async () => {
    if (!window.confirm("Delete all bookmarks?")) return;

    try {
      await deleteBookmarks();

      setBookmarks([]);

      alert("Bookmarks cleared successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to clear bookmarks.");
    }
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          background: "#050b12",
          padding: "55px 40px",
          color: "#e6f7ff",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {/* PAGE HEADER */}
          <div style={{ marginBottom: "30px" }}>
            <h1
              style={{
                color: "#f1faff",
                marginBottom: "10px",
                fontSize: "42px",
                fontWeight: "800",
              }}
            >
              <FaBookmark
                style={{
                  color: "#22d3ee",
                  marginRight: "12px",
                }}
              />
              Saved Papers
            </h1>

            <p
              style={{
                color: "#8ba8b8",
                fontSize: "16px",
                margin: 0,
              }}
            >
              Your bookmarked research papers.
            </p>
          </div>

          {/* CLEAR BUTTON */}
          {bookmarks.length > 0 && (
            <button
              onClick={clearBookmarks}
              style={{
                background:
                  "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#ffffff",
                border: "none",
                borderRadius: "9px",
                padding: "11px 18px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "28px",
                boxShadow: "0 5px 15px rgba(239,68,68,0.2)",
              }}
            >
              <FaTrash style={{ marginRight: "8px" }} />
              Clear All
            </button>
          )}

          {/* LOADING */}
          {loading ? (
            <div
              style={{
                background: "#0b1722",
                border: "1px solid #17364a",
                borderRadius: "16px",
                padding: "35px",
                color: "#8ba8b8",
              }}
            >
              Loading bookmarks...
            </div>
          ) : bookmarks.length === 0 ? (
            /* EMPTY STATE */
            <div
              style={{
                background:
                  "linear-gradient(145deg, #0b1722, #0a141e)",
                border: "1px solid #17364a",
                padding: "45px",
                borderRadius: "16px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              <FaBookmark
                style={{
                  fontSize: "42px",
                  color: "#22d3ee",
                  marginBottom: "15px",
                }}
              />

              <h3
                style={{
                  color: "#f1faff",
                  marginBottom: "8px",
                }}
              >
                No saved papers
              </h3>

              <p
                style={{
                  color: "#7895a5",
                  margin: 0,
                }}
              >
                Your bookmarked research papers will appear here.
              </p>
            </div>
          ) : (
            /* BOOKMARK CARDS */
            bookmarks.map((paper, index) => (
              <div
                key={index}
                style={{
                  background:
                    "linear-gradient(145deg, #0d1b27, #09141e)",
                  padding: "28px",
                  borderRadius: "16px",
                  marginBottom: "22px",
                  border: "1px solid #17364a",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.25)",
                }}
              >
                {/* TITLE */}
                <h3
                  style={{
                    color: "#f1faff",
                    fontSize: "24px",
                    fontWeight: "750",
                    marginBottom: "18px",
                  }}
                >
                  <FaBookmark
                    style={{
                      color: "#22d3ee",
                      marginRight: "10px",
                      fontSize: "19px",
                    }}
                  />
                  {paper.title}
                </h3>

                {/* AUTHORS */}
                <p
                  style={{
                    color: "#a9c0cc",
                    lineHeight: "1.7",
                    marginBottom: "10px",
                  }}
                >
                  <strong style={{ color: "#22d3ee" }}>
                    Authors:
                  </strong>{" "}
                  {paper.authors || "N/A"}
                </p>

                {/* YEAR */}
                <p
                  style={{
                    color: "#a9c0cc",
                    marginBottom: "16px",
                  }}
                >
                  <strong style={{ color: "#22d3ee" }}>
                    Year:
                  </strong>{" "}
                  {paper.year || "N/A"}
                </p>

                {/* ABSTRACT */}
                <p
                  style={{
                    color: "#9fb6c2",
                    lineHeight: "1.8",
                    marginBottom: "22px",
                  }}
                >
                  {paper.abstract ||
                    "Abstract information is not available in the current research dataset."}
                </p>

                {/* READ PAPER */}
                {paper.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background:
                        "linear-gradient(135deg, #2563eb, #3b82f6)",
                      color: "#ffffff",
                      textDecoration: "none",
                      padding: "11px 18px",
                      borderRadius: "9px",
                      fontWeight: "700",
                      fontSize: "15px",
                      boxShadow:
                        "0 5px 15px rgba(37,99,235,0.25)",
                    }}
                  >
                    <FaExternalLinkAlt />
                    Read Paper
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Bookmarks;