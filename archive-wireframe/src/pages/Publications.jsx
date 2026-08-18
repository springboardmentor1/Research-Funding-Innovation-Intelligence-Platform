import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";

import { getPublications } from "../api/publicationApi";

import {
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiStar,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

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

  // =====================================================
  // LOAD PUBLICATIONS
  // =====================================================

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

        console.log("Publications API response:", response);

        setPublications(response.data || []);
        setTotalPages(response.total_pages || 1);
        setTotalRecords(response.total_records || 0);
      } catch (err) {
        console.error("Publications API error:", err);

        setError("Failed to load publications.");
      } finally {
        setLoading(false);
      }
    }

    loadPublications();
  }, [currentPage, search, sortBy]);

  // =====================================================
  // RESET PAGE WHEN SEARCH CHANGES
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // =====================================================
  // OPEN PUBLICATION DETAILS
  // =====================================================

  const openPublication = (doi) => {
    if (!doi || doi === "Not Available") {
      alert("Publication link is not available for this record.");
      return;
    }

    window.location.href = `/publication/${encodeURIComponent(doi)}`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <Layout>
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#dc2626",
            fontWeight: "bold"
          }}
        >
          {error}
        </div>
      </Layout>
    );
  }

  // =====================================================
  // FILTER PUBLICATIONS
  // =====================================================

  const filteredPublications = publications.filter((pub) => {
    const matchesYear =
      selectedYear === "" ||
      String(pub.publication_year) === selectedYear;

    const matchesType =
      selectedType === "" ||
      pub.type === selectedType;

    return matchesYear && matchesType;
  });

  // =====================================================
  // UNIQUE YEARS
  // =====================================================

  const years = [
    ...new Set(
      publications
        .map((pub) => pub.publication_year)
        .filter(Boolean)
    )
  ].sort((a, b) => b - a);

  // =====================================================
  // UNIQUE TYPES
  // =====================================================

  const types = [
    ...new Set(
      publications
        .map((pub) => pub.type)
        .filter(Boolean)
    )
  ].sort();

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <Layout>
      <div
        style={{
          padding: "30px"
        }}
      >

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "25px"
          }}
        >
          <h1
            style={{
              fontSize: "42px",
              marginBottom: "10px"
            }}
          >
            📚 Publications
          </h1>

          <p
            style={{
              color: "#6b7280",
              margin: 0
            }}
          >
            Explore research publications, citations,
            publication types, and detailed research information.
          </p>
        </div>


        {/* =================================================
            FILTERS
        ================================================= */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            margin: "25px 0",
            flexWrap: "wrap"
          }}
        >

          {/* YEAR */}

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            <option value="">
              All Years
            </option>

            {years.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>


          {/* TYPE */}

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer"
            }}
          >
            <option value="">
              All Types
            </option>

            {types.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>


          {/* SORT */}

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
              background: "#fff",
              cursor: "pointer"
            }}
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="citations_desc">
              Most Cited
            </option>

            <option value="citations_asc">
              Least Cited
            </option>

            <option value="title_asc">
              Title A-Z
            </option>

            <option value="title_desc">
              Title Z-A
            </option>
          </select>


          {/* RESET */}

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
              fontWeight: "bold"
            }}
          >
            Reset Filters
          </button>

        </div>


        {/* =================================================
            RECORD COUNT
        ================================================= */}

        <p
          style={{
            color: "#6b7280",
            marginBottom: "20px",
            fontWeight: "500"
          }}
        >
          Showing{" "}
          <strong>
            {filteredPublications.length}
          </strong>{" "}
          of{" "}
          <strong>
            {totalRecords}
          </strong>{" "}
          publication(s)
        </p>


        {/* =================================================
            PUBLICATION CARDS
        ================================================= */}

        {filteredPublications.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "35px",
              textAlign: "center"
            }}
          >
            <h3>
              No publications found.
            </h3>

            <p
              style={{
                color: "#6b7280"
              }}
            >
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          filteredPublications.map((pub, index) => {

            const hasDoi =
              pub.doi &&
              pub.doi !== "Not Available" &&
              pub.doi.trim() !== "";

            return (
              <div
                key={
                  pub.id ||
                  pub.doi ||
                  index
                }
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "25px",
                  marginBottom: "20px",
                  border: "1px solid #e5e7eb",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,.08)"
                }}
              >

                {/* =================================================
                    PUBLICATION TITLE
                ================================================= */}

                <h2
                  style={{
                    marginBottom: "18px",
                    fontSize: "22px",
                    lineHeight: "1.4"
                  }}
                >
                  {hasDoi ? (
                    <Link
                      to={`/publication/${encodeURIComponent(
                        pub.doi
                      )}`}
                      style={{
                        color: "#2563eb",
                        textDecoration: "none",
                        fontWeight: "700"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration =
                          "underline";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration =
                          "none";
                      }}
                    >
                      {pub.title || "Untitled Publication"}
                    </Link>
                  ) : (
                    <span
                      style={{
                        color: "#2563eb"
                      }}
                    >
                      {pub.title ||
                        "Untitled Publication"}
                    </span>
                  )}
                </h2>


                {/* =================================================
                    PUBLICATION YEAR
                ================================================= */}

                <p>
                  <FiCalendar
                    style={{
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  />

                  <strong>
                    Publication Year:
                  </strong>{" "}

                  {pub.publication_year ||
                    "Not available"}
                </p>


                {/* =================================================
                    PUBLICATION TYPE
                ================================================= */}

                <p>
                  <FiFileText
                    style={{
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  />

                  <strong>
                    Type:
                  </strong>{" "}

                  {pub.type ||
                    "Not available"}
                </p>


                {/* =================================================
                    CITATIONS
                ================================================= */}

                <p>
                  <FiStar
                    style={{
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  />

                  <strong>
                    Citations:
                  </strong>{" "}

                  {Number(
                    pub.cited_by_count || 0
                  ).toLocaleString()}
                </p>


                {/* =================================================
                    DOI
                ================================================= */}

                <p>
                  <FiBookOpen
                    style={{
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  />

                  <strong>
                    DOI:
                  </strong>{" "}

                  {hasDoi ? (
                    <a
                      href={
                        pub.doi.startsWith("http")
                          ? pub.doi
                          : `https://doi.org/${pub.doi}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#2563eb",
                        wordBreak: "break-all"
                      }}
                    >
                      {pub.doi}
                    </a>
                  ) : (
                    "Not Available"
                  )}
                </p>


                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "18px"
                  }}
                >

                  {/* VIEW PUBLICATION */}

                  {hasDoi ? (
                    <button
                      onClick={() =>
                        openPublication(pub.doi)
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        background: "#111111",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      <FiExternalLink />

                      View Publication
                    </button>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        color: "#9ca3af",
                        fontSize: "14px",
                        padding: "10px 0"
                      }}
                    >
                      Publication details unavailable
                    </span>
                  )}


                  {/* EXTERNAL DOI */}

                  {hasDoi && (
                    <a
                      href={
                        pub.doi.startsWith("http")
                          ? pub.doi
                          : `https://doi.org/${pub.doi}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        background: "#f3f4f6",
                        color: "#111827",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600"
                      }}
                    >
                      <FiExternalLink />

                      Open DOI
                    </a>
                  )}

                </div>

              </div>
            );
          })
        )}


        {/* =================================================
            PAGINATION
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            marginTop: "35px",
            marginBottom: "30px"
          }}
        >

          {/* PREVIOUS */}

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(currentPage - 1)
            }
            style={{
              padding: "10px 18px",
              background:
                currentPage === 1
                  ? "#d1d5db"
                  : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor:
                currentPage === 1
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <FiChevronLeft />

            Previous
          </button>


          {/* PAGE NUMBER */}

          <span
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#374151"
            }}
          >
            Page {currentPage} of {totalPages}
          </span>


          {/* NEXT */}

          <button
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage(currentPage + 1)
            }
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
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            Next

            <FiChevronRight />
          </button>

        </div>

      </div>
    </Layout>
  );
}

export default Publications;