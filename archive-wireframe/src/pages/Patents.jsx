import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getPatents } from "../api/patentApi";

function Patents() {
  const [patents, setPatents] = useState([]);

  // Get search text from navbar
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

  // Filter patents
  const filteredPatents = patents.filter((item) =>
    item.patent_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div style={{ padding: "30px" }}>
        <h1>Patents</h1>

        {filteredPatents.length === 0 ? (
          <h3>No patents found.</h3>
        ) : (
          filteredPatents.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
                background: "#fff",
              }}
            >
              <h3>{item.patent_title}</h3>

              <p>
                <strong>Patent Number:</strong> {item.patent_number}
              </p>

              <p>
                <strong>Inventor:</strong> {item.inventor}
              </p>

              <p>
                <strong>Assignee:</strong> {item.assignee}
              </p>

              <p>
                <strong>Publication Date:</strong> {item.publication_date}
              </p>

              <p>
                <strong>Country:</strong> {item.country}
              </p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Patents;