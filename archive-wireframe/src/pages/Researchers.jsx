import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getResearchers } from "../api/researcherApi";

function Researchers() {
  const [researchers, setResearchers] = useState([]);

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

  const filteredResearchers = researchers.filter((item) =>
    (item.researcher_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div style={{ padding: "30px" }}>
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          👨‍🔬 Researchers
        </h1>

        {filteredResearchers.length === 0 ? (
          <h3>No researchers found.</h3>
        ) : (
          filteredResearchers.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
                <strong>🏢 Institution:</strong> {item.institution}
              </p>

              <p>
                <strong>🌍 Country:</strong> {item.country}
              </p>

              <p>
                <strong>📚 Publications:</strong> {item.works_count}
              </p>

              <p>
                <strong>📈 Citations:</strong> {item.cited_by_count}
              </p>

              <p>
                <strong>🆔 ORCID:</strong> {item.orcid}
              </p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Researchers;