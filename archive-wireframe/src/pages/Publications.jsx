import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";

import { getPublications } from "../api/publicationApi";

function Publications() {

  const { search } = useContext(SearchContext);

  const [publications, setPublications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalRecords, setTotalRecords] = useState(0);

  const perPage = 20;

  const [selectedYear, setSelectedYear] = useState("");

  const [selectedType, setSelectedType] = useState("");

  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {

    async function loadPublications() {

      setLoading(true);

      setError("");

      try {

        const response = await getPublications(
          currentPage,
          perPage,
          search,
          sortBy
        );

        setPublications(response.data);

        setTotalPages(response.total_pages);

        setTotalRecords(response.total_records);

      } catch (err) {

        console.error(err);

        setError("Failed to load publications.");

      } finally {

        setLoading(false);

      }

    }

    loadPublications();

  }, [currentPage, search, sortBy]);

  if (loading) {

    return (

      <Layout>

        <LoadingSpinner />

      </Layout>

    );

  }

  if (error) {

    return (

      <Layout>

        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#dc2626",
            fontWeight: "bold",
          }}
        >
          {error}
        </div>

      </Layout>

    );

  }

  const filteredPublications = publications.filter((pub) => {

    const matchesYear =
      selectedYear === "" ||
      String(pub.publication_year) === selectedYear;

    const matchesType =
      selectedType === "" ||
      pub.type === selectedType;

    return matchesYear && matchesType;

  });

  return (

    <Layout>

      <div
        style={{
          padding: "30px",
        }}
      >

        <h1>📚 Publications</h1>
                {/* Filters */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            margin: "25px 0",
            flexWrap: "wrap",
          }}
        >

          {/* Year */}

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Years</option>

            {[...new Set(publications.map((p) => p.publication_year))]
              .sort((a, b) => b - a)
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>

          {/* Type */}

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Types</option>

            {[...new Set(publications.map((p) => p.type))]
              .filter(Boolean)
              .map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
          </select>

          {/* Sort */}

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="citations_desc">Most Cited</option>
            <option value="citations_asc">Least Cited</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>

          {/* Reset */}

          <button
            onClick={() => {
              setSelectedYear("");
              setSelectedType("");
              setSortBy("newest");
              setCurrentPage(1);
            }}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#ef4444",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reset Filters
          </button>

        </div>

        {/* Results */}

        <p
          style={{
            color: "#6b7280",
            marginBottom: "20px",
            fontWeight: "500",
          }}
        >
          Showing <strong>{filteredPublications.length}</strong> of{" "}
          <strong>{totalRecords}</strong> publication(s)
        </p>

        {filteredPublications.length === 0 ? (
          <h3>No publications found.</h3>
        ) : (
                    filteredPublications.map((pub, index) => (

            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "18px",
                marginBottom: "18px",
                borderRadius: "10px",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,.08)",
              }}
            >

              {/* Clickable Title */}

              <h3
                style={{
                  marginBottom: "12px",
                }}
              >
                {pub.doi && pub.doi !== "Not Available" ? (

                  <Link
                    to={`/publication/${encodeURIComponent(pub.doi)}`}
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                      fontWeight: "bold",
                    }}
                  >
                    {pub.title}
                  </Link>

                ) : (

                  pub.title

                )}
              </h3>

              <p>
                <strong>📅 Publication Year:</strong>{" "}
                {pub.publication_year}
              </p>

              <p>
                <strong>📄 Type:</strong>{" "}
                {pub.type}
              </p>

              <p>
                <strong>⭐ Citations:</strong>{" "}
                {Number(pub.cited_by_count || 0).toLocaleString()}
              </p>

              <p>
                <strong>🔗 DOI:</strong>{" "}

                {pub.doi && pub.doi !== "Not Available" ? (

                  <a
                    href={pub.doi}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {pub.doi}
                  </a>

                ) : (

                  "Not Available"

                )}

              </p>

            </div>

          ))

        )}
                {/* Pagination */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            marginTop: "35px",
          }}
        >

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            style={{
              padding: "10px 18px",
              background:
                currentPage === 1 ? "#d1d5db" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor:
                currentPage === 1
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold",
            }}
          >
            ← Previous
          </button>

          <span
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#374151",
            }}
          >
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            style={{
              padding: "10px 18px",
              background:
                currentPage === totalPages
                  ? "#d1d5db"
                  : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor:
                currentPage === totalPages
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold",
            }}
          >
            Next →
          </button>

        </div>

      </div>

    </Layout>

  );

}

export default Publications;