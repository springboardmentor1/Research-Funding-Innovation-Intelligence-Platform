import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getFunding } from "../api/fundingApi";

function Funding() {
  const [funding, setFunding] = useState([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");

  const { search } = useContext(SearchContext);

  useEffect(() => {
    async function loadFunding() {
      try {
        const data = await getFunding();
        setFunding(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadFunding();
  }, []);

  if (funding.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const filteredFunding = funding.filter((item) => {
    const matchesSearch =
      item.project_title
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesYear =
      selectedYear === "" ||
      String(item.fiscal_year) === selectedYear;

    const matchesOrganization =
      selectedOrganization === "" ||
      item.organization === selectedOrganization;

    return (
      matchesSearch &&
      matchesYear &&
      matchesOrganization
    );
  });

  return (
    <Layout>
      <div style={{ padding: "30px" }}>

        <h1>💰 Funding Projects</h1>

        {/* Filters */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            margin: "25px 0",
          }}
        >
          {/* Fiscal Year */}

          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(e.target.value)
            }
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

          {/* Organization */}

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

          {/* Reset */}

          <button
            onClick={() => {
              setSelectedYear("");
              setSelectedOrganization("");
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

        {/* Result Count */}

        <p
          style={{
            color: "#6b7280",
            marginBottom: "20px",
            fontWeight: "500",
          }}
        >
          Showing <strong>{filteredFunding.length}</strong>{" "}
          funding project(s)
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
                transition: "0.3s",
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
                <strong>💵 Award Amount:</strong>{" "}
                $
                {Number(
                  item.award_amount || 0
                ).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Funding;