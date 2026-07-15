import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getOrganizations } from "../api/organizationApi";

function Organizations() {
  const [organizations, setOrganizations] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedType, setSelectedType] = useState("");

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

  const filteredOrganizations = organizations.filter((item) => {

    const matchesSearch =
      (item.organization_name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCountry =
      selectedCountry === "" ||
      item.country === selectedCountry;

    const matchesType =
      selectedType === "" ||
      item.type === selectedType;

    return (
      matchesSearch &&
      matchesCountry &&
      matchesType
    );
  });

  return (
    <Layout>
      <div style={{ padding: "30px" }}>

        <h1>🏢 Organizations</h1>

        {/* Filters */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            margin: "25px 0",
          }}
        >

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

            {[...new Set(organizations.map(o => o.country))]
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

          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value)
            }
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Types</option>

            {[...new Set(organizations.map(o => o.type))]
              .filter(Boolean)
              .sort()
              .map(type => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
          </select>

          <button
            onClick={() => {
              setSelectedCountry("");
              setSelectedType("");
            }}
            style={{
              padding: "10px 18px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reset Filters
          </button>

        </div>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "20px",
            fontWeight: "500",
          }}
        >
          Showing <strong>{filteredOrganizations.length}</strong> organization(s)
        </p>

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