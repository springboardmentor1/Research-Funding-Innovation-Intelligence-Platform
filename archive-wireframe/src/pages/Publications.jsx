import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getPublications } from "../api/publicationApi";

function Publications() {
  const [publications, setPublications] = useState([]);

  // Get search text from the navbar
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

  // Filter publications based on search
  const filteredPublications = publications.filter((pub) =>
    pub.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div style={{ padding: "30px" }}>
        <h1>Publications</h1>

        {filteredPublications.length === 0 ? (
          <h3>No publications found.</h3>
        ) : (
          filteredPublications.map((pub, index) => (
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
              <h3>{pub.title}</h3>

              <p>
                <strong>Publication Year:</strong>{" "}
                {pub.publication_year}
              </p>

              <p>
                <strong>Type:</strong> {pub.type}
              </p>

              <p>
                <strong>Citations:</strong>{" "}
                {pub.cited_by_count.toLocaleString()}
              </p>

              <p>
                <strong>DOI:</strong>{" "}
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