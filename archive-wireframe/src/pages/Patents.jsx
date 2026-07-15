import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getPatents } from "../api/patentApi";

function Patents() {
  const [patents, setPatents] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const { search } = useContext(SearchContext);

  useEffect(() => {
    async function loadPatents() {
      try {
        const data = await getPatents();
        setPatents(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadPatents();
  }, []);

  if (patents.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const filteredPatents = patents.filter((item) => {
    const matchesSearch =
      item.patent_title
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesCountry =
      selectedCountry === "" ||
      item.country === selectedCountry;

    const matchesAssignee =
      selectedAssignee === "" ||
      item.assignee === selectedAssignee;

    return (
      matchesSearch &&
      matchesCountry &&
      matchesAssignee
    );
  });

  return (
    <Layout>
      <div style={{ padding: "30px" }}>

        <h1>📜 Patents</h1>

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

            {[...new Set(patents.map((p) => p.country))]
              .filter(Boolean)
              .sort()
              .map((country) => (
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              ))}
          </select>

          {/* Assignee */}

          <select
            value={selectedAssignee}
            onChange={(e) =>
              setSelectedAssignee(e.target.value)
            }
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Assignees</option>

            {[...new Set(patents.map((p) => p.assignee))]
              .filter(Boolean)
              .sort()
              .map((assignee) => (
                <option
                  key={assignee}
                  value={assignee}
                >
                  {assignee}
                </option>
              ))}
          </select>

          {/* Reset */}

          <button
            onClick={() => {
              setSelectedCountry("");
              setSelectedAssignee("");
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
          Showing <strong>{filteredPatents.length}</strong>{" "}
          patent(s)
        </p>

        {filteredPatents.length === 0 ? (
          <h3>No patents found.</h3>
        ) : (
          filteredPatents.map((item, index) => (
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
                {item.patent_title}
              </h2>

              <p>
                <strong>🆔 Patent Number:</strong>{" "}
                {item.patent_number}
              </p>

              <p>
                <strong>👨‍🔬 Inventor:</strong>{" "}
                {item.inventor}
              </p>

              <p>
                <strong>🏢 Assignee:</strong>{" "}
                {item.assignee}
              </p>

              <p>
                <strong>📅 Publication Date:</strong>{" "}
                {item.publication_date}
              </p>

              <p>
                <strong>🌍 Country:</strong>{" "}
                {item.country}
              </p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Patents;