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

import "./ResearchExplorer.css";


function ResearchExplorer() {

  const [papers, setPapers] = useState([]);

  const [search, setSearch] = useState(
    "artificial intelligence"
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  useEffect(() => {
    fetchPapers();
  }, []);


  const fetchPapers = async () => {

    if (!search.trim()) {
      return;
    }

    try {

      setLoading(true);
      setError("");

      const res = await getResearchPapers(
        search.trim()
      );

      /*
       * Backend returns:
       *
       * {
       *   papers: [...]
       * }
       */

      const results =
        res.data?.papers ||
        res.data?.results ||
        [];

      setPapers(results);

    } catch (err) {

      console.error(
        "Research API error:",
        err
      );

      setPapers([]);

      setError(
        "Unable to fetch research papers. Please make sure the backend is running."
      );

    } finally {

      setLoading(false);

    }
  };


  const handleBookmark = async (paper) => {

    try {

      const response =
        await saveBookmark(paper);

      alert(
        response.data?.message ||
        "Paper saved successfully."
      );

    } catch (error) {

      console.error(error);

      alert(
        "Failed to save bookmark."
      );

    }
  };


  return (
    <div className="research-explorer">

      <Navbar />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="research-main">

        {/* HERO */}

        <section className="research-hero">

          <div className="research-eyebrow">
            🔬 RESEARCH DISCOVERY
          </div>

          <h1>
            Research Explorer
          </h1>

          <p>
            Discover relevant research papers,
            explore scientific literature, and
            find publications related to your
            research interests.
          </p>

        </section>


        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="research-search-wrapper">

          <div className="research-search">

            <FaSearch
              className="research-search-icon"
            />

            <input
              type="text"
              value={search}
              placeholder="Search research topics..."
              onChange={(e) => {
                setSearch(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  fetchPapers();
                }

              }}
            />

            {search && (
              <button
                className="research-clear"
                onClick={() => {
                  setSearch("");
                  setPapers([]);
                }}
              >
                ×
              </button>
            )}

          </div>


          <button
            className="research-search-button"
            onClick={fetchPapers}
            disabled={loading}
          >

            <FaSearch />

            {loading
              ? "Searching..."
              : "Search Research"}

          </button>

        </section>


        {/* ERROR */}

        {error && (

          <div className="research-error">

            ⚠️ {error}

          </div>

        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="research-loading">

            <div className="research-spinner"></div>

            <h3>
              Finding research papers...
            </h3>

            <p>
              Searching your research database.
            </p>

          </div>

        )}


        {/* =================================================
            RESULTS HEADER
        ================================================= */}

        {!loading &&
          papers.length > 0 && (

            <div className="research-results-header">

              <div>

                <span>
                  SEARCH RESULTS
                </span>

                <h2>
                  Research Papers
                </h2>

                <p>
                  Results for "{search}"
                </p>

              </div>

              <div className="research-count">

                {papers.length} Papers

              </div>

            </div>

          )}


        {/* =================================================
            PAPERS
        ================================================= */}

        {!loading &&
          papers.length > 0 && (

            <section className="research-paper-list">

              {papers.map(
                (paper, index) => (

                  <article
                    className="research-paper-card"
                    key={
                      paper.doi ||
                      paper.url ||
                      index
                    }
                  >

                    {/* NUMBER */}

                    <div className="paper-index">

                      {String(
                        index + 1
                      ).padStart(2, "0")}

                    </div>


                    {/* CONTENT */}

                    <div className="paper-body">

                      <div className="paper-label">

                        <FaBookOpen />

                        RESEARCH PAPER

                      </div>


                      <h2>

                        {paper.title ||
                          "Untitled Research Paper"}

                      </h2>


                      <div className="paper-info">

                        <div>

                          <strong>
                            👤 Authors
                          </strong>

                          <span>
                            {paper.authors ||
                              "Authors unavailable"}
                          </span>

                        </div>


                        <div>

                          <strong>
                            📅 Publication Year
                          </strong>

                          <span>
                            {paper.publication_year ||
                              paper.year ||
                              "Year unavailable"}
                          </span>

                        </div>

                      </div>


                      <div className="paper-abstract">

                        <h3>
                          Abstract
                        </h3>

                        <p>

                          {paper.abstract ||
                            "Abstract information is not available in the current dataset."}

                        </p>

                      </div>


                      <div className="paper-actions">

                        {paper.url &&
                          paper.url !== "#" && (

                            <a
                              href={paper.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="read-paper"
                            >

                              <FaExternalLinkAlt />

                              Read Paper

                            </a>

                          )}


                        <button
                          className="bookmark-paper"
                          onClick={() =>
                            handleBookmark(
                              paper
                            )
                          }
                        >

                          <FaBookmark />

                          Save Paper

                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </section>

          )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          papers.length === 0 &&
          !error && (

            <div className="research-empty">

              <div className="empty-icon">
                🔬
              </div>

              <h2>
                Start Your Research
              </h2>

              <p>
                Search for a research topic
                to discover relevant papers.
              </p>


              <div className="research-suggestions">

                <button
                  onClick={() =>
                    setSearch(
                      "artificial intelligence"
                    )
                  }
                >
                  🤖 Artificial Intelligence
                </button>


                <button
                  onClick={() =>
                    setSearch(
                      "machine learning"
                    )
                  }
                >
                  🧠 Machine Learning
                </button>


                <button
                  onClick={() =>
                    setSearch(
                      "climate change"
                    )
                  }
                >
                  🌍 Climate Change
                </button>


                <button
                  onClick={() =>
                    setSearch(
                      "healthcare"
                    )
                  }
                >
                  🏥 Healthcare
                </button>

              </div>

            </div>

          )}

      </main>


      <Footer />

    </div>
  );
}


export default ResearchExplorer;