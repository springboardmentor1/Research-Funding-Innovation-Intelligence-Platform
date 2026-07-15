import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getResearchers } from "../api/researcherApi";

function Researchers() {
  const [researchers, setResearchers] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");

  const { search } = useContext(SearchContext);

  useEffect(() => {
    async function loadResearchers() {
      try {
        const data = await getResearchers();
        setResearchers(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadResearchers();
  }, []);

  if (researchers.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const filteredResearchers = researchers.filter((item) => {
    const matchesSearch =
      (item.researcher_name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCountry =
      selectedCountry === "" ||
      item.country === selectedCountry;

    const matchesInstitution =
      selectedInstitution === "" ||
      item.institution === selectedInstitution;

    return (
      matchesSearch &&
      matchesCountry &&
      matchesInstitution
    );
  });

  return (
    <Layout>
      <div style={{ padding: "30px" }}>

        <h1>👨‍🔬 Researchers</h1>

        {/* Filters */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            margin: "25px 0",
          }}
        >

          {/* Country */}

          <select
            value={selectedCountry}
            onChange={(e) =>
              setSelectedCountry(e.target.value)
            }
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Countries</option>

            {[...new Set(researchers.map(r => r.country))]
              .filter(Boolean)
              .sort()
              .map(country => (
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              ))}
          </select>

          {/* Institution */}

          <select
            value={selectedInstitution}
            onChange={(e) =>
              setSelectedInstitution(e.target.value)
            }
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Institutions</option>

            {[...new Set(researchers.map(r => r.institution))]
              .filter(Boolean)
              .sort()
              .map(institution => (
                <option
                  key={institution}
                  value={institution}
                >
                  {institution}
                </option>
              ))}
          </select>

          {/* Reset */}

          <button
            onClick={() => {
              setSelectedCountry("");
              setSelectedInstitution("");
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

        {/* Results */}

        <p
          style={{
            color: "#6b7280",
            marginBottom: "20px",
            fontWeight: "500",
          }}
        >
          Showing <strong>{filteredResearchers.length}</strong> researcher(s)
        </p>

        {filteredResearchers.length === 0 ? (
          <h3>No researchers found.</h3>
        ) : (
          filteredResearchers.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,.08)",
              }}
            >
              <h2
                style={{
                  color: "#2563eb",
                  marginBottom: "15px",
                }}
              >
                {item.researcher_name}
              </h2>

              <p>
                <strong>🏢 Institution:</strong>{" "}
                {item.institution}
              </p>

              <p>
                <strong>🌍 Country:</strong>{" "}
                {item.country}
              </p>

              <p>
                <strong>📚 Publications:</strong>{" "}
                {Number(item.works_count || 0).toLocaleString()}
              </p>

              <p>
                <strong>📈 Citations:</strong>{" "}
                {Number(item.cited_by_count || 0).toLocaleString()}
              </p>

              <p>
                <strong>🆔 ORCID:</strong>{" "}
                {item.orcid || "Not Available"}
              </p>

            </div>
          ))
        )}

      </div>
    </Layout>
  );
}

export default Researchers;