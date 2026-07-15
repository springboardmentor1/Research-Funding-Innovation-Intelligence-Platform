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
      <div
        style={{
          padding: "30px",
        }}
      >
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
          <div
            style={{
              marginTop: "40px",
            }}
          >
            {/* Publications */}

            <SectionTitle title="📚 Publications" />

            {results.publications.length === 0 ? (
              <p>No publications found.</p>
            ) : (
              results.publications.map((item, index) => (
                <Card key={index}>
                  <h3>{item.title}</h3>

                  <p>Year: {item.publication_year}</p>

                  <p>Type: {item.type}</p>
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

                  <p>Organization: {item.organization}</p>
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
                  <h3>{item.patent_title}</h3>

                  <p>Inventor: {item.inventor}</p>

                  <p>Assignee: {item.assignee}</p>
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

                  <p>Country: {item.country}</p>

                  <p>Type: {item.type}</p>
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

                  <p>Institution: {item.institution}</p>

                  <p>Country: {item.country}</p>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
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