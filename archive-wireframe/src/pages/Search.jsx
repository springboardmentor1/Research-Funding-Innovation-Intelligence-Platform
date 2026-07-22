import { useState, useContext, useEffect } from "react";
import { searchAll } from "../api/searchApi";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { SearchContext } from "../context/SearchContext";

function Search() {
  const { search } = useContext(SearchContext);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search || !search.trim()) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);

      const data = await searchAll(search);

      setResults(data);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [search]);

  return (
    <Layout>
      <div style={{ padding: "30px" }}>
        <h1>🔍 Global Research Search</h1>

        <p
          style={{
            color: "#6b7280",
            marginTop: "10px",
            fontSize: "16px",
          }}
        >
          Showing results for:
          <strong> {search || "Nothing searched yet"}</strong>
        </p>

        {loading && <LoadingSpinner />}

        {!loading && results && (
          <>
            {/* Summary */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: "15px",
                marginTop: "30px",
                marginBottom: "40px",
              }}
            >
              <SummaryCard
                title="📚 Publications"
                count={results.publications.length}
              />

              <SummaryCard
                title="💰 Funding"
                count={results.funding.length}
              />

              <SummaryCard
                title="📜 Patents"
                count={results.patents.length}
              />

              <SummaryCard
                title="🏢 Organizations"
                count={results.organizations.length}
              />

              <SummaryCard
                title="👨‍🔬 Researchers"
                count={results.researchers.length}
              />
            </div>

            {/* Publications */}

            <SectionTitle title="📚 Publications" />

            {results.publications.length === 0 ? (
              <p>No publications found.</p>
            ) : (
              results.publications.map((item, index) => (
                <Card key={index}>
                  <h3>{item.title}</h3>

                  <p>
                    <strong>Year:</strong> {item.publication_year}
                  </p>

                  <p>
                    <strong>Type:</strong> {item.type}
                  </p>
                </Card>
              ))
            )}

            {/* Funding */}

            <SectionTitle title="💰 Funding" />

            {results.funding.length === 0 ? (
              <p>No funding found.</p>
            ) : (
              results.funding.map((item, index) => (
                <Card key={index}>
                  <h3>{item.project_title}</h3>

                  <p>
                    <strong>Organization:</strong>{" "}
                    {item.organization}
                  </p>

                  <p>
                    <strong>Principal Investigator:</strong>{" "}
                    {item.principal_investigator}
                  </p>

                  <p>
                    <strong>Fiscal Year:</strong>{" "}
                    {item.fiscal_year}
                  </p>
                </Card>
              ))
            )}

            {/* Patents */}

            <SectionTitle title="📜 Patents" />

            {results.patents.length === 0 ? (
              <p>No patents found.</p>
            ) : (
              results.patents.map((item, index) => (
                <Card key={index}>
                  <h3>{item.Title}</h3>

                  <p>
                    <strong>Publication No:</strong>{" "}
                    {item["Publication Number"]}
                  </p>

                  <p>
                    <strong>Inventor:</strong>{" "}
                    {item["Inventor Name"]}
                  </p>

                  <p>
                    <strong>Applicant:</strong>{" "}
                    {item["Applicant Name"]}
                  </p>

                  <p>
                    <strong>Country:</strong>{" "}
                    {String(item["Applicant Country"]).replace(/#/g, "")}
                  </p>
                </Card>
              ))
            )}

            {/* Organizations */}

            <SectionTitle title="🏢 Organizations" />

            {results.organizations.length === 0 ? (
              <p>No organizations found.</p>
            ) : (
              results.organizations.map((item, index) => (
                <Card key={index}>
                  <h3>{item.organization_name}</h3>

                  <p>
                    <strong>Country:</strong> {item.country}
                  </p>

                  <p>
                    <strong>Type:</strong> {item.type}
                  </p>
                </Card>
              ))
            )}

            {/* Researchers */}

            <SectionTitle title="👨‍🔬 Researchers" />

            {results.researchers.length === 0 ? (
              <p>No researchers found.</p>
            ) : (
              results.researchers.map((item, index) => (
                <Card key={index}>
                  <h3>{item.researcher_name}</h3>

                  <p>
                    <strong>Institution:</strong>{" "}
                    {item.institution}
                  </p>

                  <p>
                    <strong>Country:</strong> {item.country}
                  </p>
                </Card>
              ))
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

function SummaryCard({ title, count }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "0 3px 8px rgba(0,0,0,.08)",
      }}
    >
      <h3>{title}</h3>

      <h1
        style={{
          color: "#2563eb",
          margin: "10px 0",
        }}
      >
        {count}
      </h1>

      <p
        style={{
          color: "#6b7280",
        }}
      >
        Results Found
      </p>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h2
      style={{
        marginTop: "35px",
        color: "#1f2937",
      }}
    >
      {title}
    </h2>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "15px",
        boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  );
}

export default Search;