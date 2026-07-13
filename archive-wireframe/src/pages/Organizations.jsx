import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getOrganizations } from "../api/organizationApi";

function Organizations() {
  const [organizations, setOrganizations] = useState([]);

  const { search } = useContext(SearchContext);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const data = await getOrganizations();
        setOrganizations(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadOrganizations();
  }, []);

  if (organizations.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  const filteredOrganizations = organizations.filter((item) =>
    (item.organization_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div style={{ padding: "30px" }}>
        <h1
          style={{
            marginBottom: "25px",
            color: "#1f2937",
          }}
        >
          🏢 Organizations
        </h1>

        {filteredOrganizations.length === 0 ? (
          <h3>No organizations found.</h3>
        ) : (
          filteredOrganizations.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  marginBottom: "15px",
                  color: "#2563eb",
                }}
              >
                {item.organization_name}
              </h2>

              <p>
                <strong>🌍 Country:</strong> {item.country}
              </p>

              <p>
                <strong>🏷 Type:</strong> {item.type}
              </p>

              <p>
                <strong>🌐 Website:</strong>{" "}
                <a
                  href={item.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.website}
                </a>
              </p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Organizations;