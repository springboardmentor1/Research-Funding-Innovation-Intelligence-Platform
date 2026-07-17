import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getFunding } from "../api/fundingApi";

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

        setFunding(response.data);
        setTotalPages(response.total_pages);
        setTotalRecords(response.total_records);
      } catch (err) {
        console.error(err);
        setError("Failed to load funding projects.");
      } finally {
        setLoading(false);
      }
    }

    loadFunding();
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

  const filteredFunding = funding.filter((item) => {
    const matchesYear =
      selectedYear === "" ||
      String(item.fiscal_year) === selectedYear;

    const matchesOrganization =
      selectedOrganization === "" ||
      item.organization === selectedOrganization;

    return matchesYear && matchesOrganization;
  });

  return (
    <Layout>
      <div style={{ padding: "30px" }}>
        <h1>💰 Funding Projects</h1>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            margin: "25px 0",
          }}
        >
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Fiscal Years</option>

            {[...new Set(funding.map((f) => f.fiscal_year))]
              .sort((a, b) => b - a)
              .map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>

          <select
            value={selectedOrganization}
            onChange={(e) =>
              setSelectedOrganization(e.target.value)
            }
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Organizations</option>

            {[...new Set(funding.map((f) => f.organization))]
              .filter(Boolean)
              .sort()
              .map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
          </select>

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
              fontWeight: "bold",
            }}
          >
            Reset Filters
          </button>
        </div>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "20px",
            fontWeight: "500",
          }}
        >
          Showing <strong>{filteredFunding.length}</strong> of{" "}
          <strong>{totalRecords}</strong> funding project(s)
        </p>

        {filteredFunding.length === 0 ? (
          <h3>No funding projects found.</h3>
        ) : (
          filteredFunding.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                border: "1px solid #e5e7eb",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,.08)",
              }}
            >
              <h2
                style={{
                  color: "#2563eb",
                  marginBottom: "15px",
                }}
              >
                {item.project_title}
              </h2>

              <p>
                <strong>🏢 Organization:</strong>{" "}
                {item.organization}
              </p>

              <p>
                <strong>👨‍🔬 Principal Investigator:</strong>{" "}
                {item.principal_investigator}
              </p>

              <p>
                <strong>📅 Fiscal Year:</strong>{" "}
                {item.fiscal_year}
              </p>

              <p>
                <strong>💵 Award Amount:</strong> $
                {Number(
                  item.award_amount || 0
                ).toLocaleString()}
              </p>
            </div>
          ))
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginTop: "35px",
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(currentPage - 1)
            }
          >
            ← Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage(currentPage + 1)
            }
          >
            Next →
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Funding;