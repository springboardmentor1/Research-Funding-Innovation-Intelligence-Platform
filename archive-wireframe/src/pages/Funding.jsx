import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getFunding } from "../api/fundingApi";

import {
  FiBriefcase,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

function Funding() {
  const [funding, setFunding] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const perPage = 20;

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { search } = useContext(SearchContext);

  // =====================================================
  // LOAD FUNDING
  // =====================================================

  useEffect(() => {
    async function loadFunding() {
      setLoading(true);
      setError("");

      try {
        const response = await getFunding(
          currentPage,
          perPage,
          search,
          sortBy
        );

        console.log("Funding API response:", response);

        setFunding(response.data || []);
        setTotalPages(response.total_pages || 1);
        setTotalRecords(response.total_records || 0);
      } catch (err) {
        console.error("Funding API error:", err);
        setError("Failed to load funding projects.");
      } finally {
        setLoading(false);
      }
    }

    loadFunding();
  }, [currentPage, search, sortBy]);

  // =====================================================
  // RESET PAGE WHEN SEARCH CHANGES
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
  // FILTER
  // =====================================================

  const filteredFunding = funding.filter((item) => {
    const matchesYear =
      selectedYear === "" ||
      String(item.fiscal_year) === selectedYear;

    const matchesOrganization =
      selectedOrganization === "" ||
      item.organization === selectedOrganization;

    return matchesYear && matchesOrganization;
  });

  // =====================================================
  // OPEN PROJECT
  // =====================================================

  const openProject = (url) => {
    if (!url) {
      alert("Project link is not available for this funding record.");
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

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
              marginBottom: "20px"
            }}
          >
            💰 Funding Projects
          </h1>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            margin: "25px 0"
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
              border: "1px solid #ccc"
            }}
          >
            <option value="">
              All Fiscal Years
            </option>

            {[
              ...new Set(
                funding.map(
                  (f) => f.fiscal_year
                )
              )
            ]
              .filter(Boolean)
              .sort((a, b) => b - a)
              .map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
          </select>

          {/* ORGANIZATION */}

          <select
            value={selectedOrganization}
            onChange={(e) => {
              setSelectedOrganization(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >
            <option value="">
              All Organizations
            </option>

            {[
              ...new Set(
                funding.map(
                  (f) => f.organization
                )
              )
            ]
              .filter(Boolean)
              .sort()
              .map((org) => (
                <option
                  key={org}
                  value={org}
                >
                  {org}
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
              border: "1px solid #ccc"
            }}
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="amount_desc">
              Highest Award
            </option>

            <option value="amount_asc">
              Lowest Award
            </option>

            <option value="title_asc">
              Project A-Z
            </option>

            <option value="title_desc">
              Project Z-A
            </option>
          </select>

          {/* RESET */}

          <button
            onClick={() => {
              setSelectedYear("");
              setSelectedOrganization("");
              setSortBy("newest");
              setCurrentPage(1);
            }}
            style={{
              padding: "10px 18px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
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
            {filteredFunding.length}
          </strong>
          {" "}of{" "}
          <strong>
            {totalRecords}
          </strong>
          {" "}funding project(s)
        </p>

        {/* =================================================
            FUNDING CARDS
        ================================================= */}

        {filteredFunding.length === 0 ? (
          <h3>
            No funding projects found.
          </h3>
        ) : (
          filteredFunding.map((item, index) => {

            /*
             * Try several possible URL column names.
             * project_url is the preferred field.
             */
            const projectUrl =
              item.project_url ||
              item.url ||
              item.link ||
              item.project_link ||
              item.project_detail_url ||
              "";

            return (
              <div
                key={
                  item.project_id ||
                  item.award_number ||
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
                    PROJECT TITLE
                ================================================= */}

                {projectUrl ? (
                  <a
                    href={projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      color: "#2563eb",
                      fontSize: "22px",
                      fontWeight: "700",
                      textDecoration: "none",
                      marginBottom: "18px",
                      cursor: "pointer"
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
                    {item.project_title || "Untitled Project"}
                  </a>
                ) : (
                  <h2
                    style={{
                      color: "#2563eb",
                      fontSize: "22px",
                      marginBottom: "18px"
                    }}
                  >
                    {item.project_title ||
                      "Untitled Project"}
                  </h2>
                )}

                {/* =================================================
                    ORGANIZATION
                ================================================= */}

                <p>
                  <FiBriefcase
                    style={{
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  />

                  <strong>
                    Organization:
                  </strong>

                  {" "}

                  {item.organization ||
                    "Not available"}
                </p>

                {/* =================================================
                    INVESTIGATOR
                ================================================= */}

                <p>
                  <FiUser
                    style={{
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  />

                  <strong>
                    Principal Investigator:
                  </strong>

                  {" "}

                  {item.principal_investigator ||
                    "Not available"}
                </p>

                {/* =================================================
                    FISCAL YEAR
                ================================================= */}

                <p>
                  <FiCalendar
                    style={{
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  />

                  <strong>
                    Fiscal Year:
                  </strong>

                  {" "}

                  {item.fiscal_year ||
                    "Not available"}
                </p>

                {/* =================================================
                    AWARD
                ================================================= */}

                <p>
                  <FiDollarSign
                    style={{
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  />

                  <strong>
                    Award Amount:
                  </strong>

                  {" "}

                  $
                  {Number(
                    item.award_amount || 0
                  ).toLocaleString()}
                </p>

                {/* =================================================
                    VIEW PROJECT BUTTON
                ================================================= */}

                {projectUrl ? (
                  <button
                    onClick={() =>
                      openProject(projectUrl)
                    }
                    style={{
                      marginTop: "12px",
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

                    View Project
                  </button>
                ) : (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "12px",
                      color: "#9ca3af",
                      fontSize: "14px"
                    }}
                  >
                    Project link not available
                  </span>
                )}

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
            marginTop: "35px"
          }}
        >

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(
                currentPage - 1
              )
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

          <span
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#374151"
            }}
          >
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage(
                currentPage + 1
              )
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

export default Funding;