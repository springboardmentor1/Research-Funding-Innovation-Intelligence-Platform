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
          background: "#f8fafc",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              color: "#2563eb",
              marginBottom: "10px",
            }}
          >
            <FaBookmark /> Saved Papers
          </h1>

          <p
            style={{
              color: "#64748b",
              marginBottom: "25px",
            }}
          >
            Your bookmarked research papers.
          </p>

          {bookmarks.length > 0 && (
            <button
              className="btn btn-danger mb-4"
              onClick={clearBookmarks}
            >
              <FaTrash className="me-2" />
              Clear All
            </button>
          )}

          {loading ? (
            <h4>Loading bookmarks...</h4>
          ) : bookmarks.length === 0 ? (
            <div
              style={{
                background: "#fff",
                padding: "40px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,.08)",
              }}
            >
              <h3>No saved papers.</h3>
            </div>
          ) : (
            bookmarks.map((paper, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  padding: "25px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  boxShadow: "0 4px 10px rgba(0,0,0,.08)",
                }}
              >
                <h3
                  style={{
                    color: "#2563eb",
                  }}
                >
                  {paper.title}
                </h3>

                <p>
                  <strong>Authors:</strong> {paper.authors}
                </p>

                <p>
                  <strong>Year:</strong> {paper.year}
                </p>

                <p>{paper.abstract}</p>

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