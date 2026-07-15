import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getPublications } from "../api/publicationApi";

function Publications() {
  const [publications, setPublications] = useState([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const { search } = useContext(SearchContext);

  useEffect(() => {
    async function loadPublications() {
      try {
        const data = await getPublications();
        setPublications(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadPublications();
  }, []);

  if (publications.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  // Filter Publications
  const filteredPublications = publications.filter((pub) => {
    const matchesSearch =
      pub.title?.toLowerCase().includes(search.toLowerCase());

    const matchesYear =
      selectedYear === "" ||
      String(pub.publication_year) === selectedYear;

    const matchesType =
      selectedType === "" ||
      pub.type === selectedType;

    return matchesSearch && matchesYear && matchesType;
  });

  return (
    <Layout>
      <div style={{ padding: "30px" }}>

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
          {/* Year Filter */}

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

          {/* Type Filter */}

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

          {/* Reset Filters */}

          <button
            onClick={() => {
              setSelectedYear("");
              setSelectedType("");
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

        {/* Results Count */}

        <p
          style={{
            color: "#6b7280",
            marginBottom: "20px",
            fontWeight: "500",
          }}
        >
          Showing <strong>{filteredPublications.length}</strong> publication(s)
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
              <h3>{pub.title}</h3>

              <p>
                <strong>📅 Publication Year:</strong>{" "}
                {pub.publication_year}
              </p>

              <p>
                <strong>📄 Type:</strong> {pub.type}
              </p>

              <p>
                <strong>⭐ Citations:</strong>{" "}
                {Number(pub.cited_by_count).toLocaleString()}
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
      </div>
    </Layout>
  );
}

export default Publications;