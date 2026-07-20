import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getOrganizations } from "../api/organizationApi";

function Organizations() {
  const { search } = useContext(SearchContext);

  const [organizations, setOrganizations] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sort, setSort] = useState("works_desc");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        setLoading(true);

        const result = await getOrganizations(
          page,
          search,
          sort,
          selectedCountry,
          selectedType
        );

        setOrganizations(result.data);
        setTotalPages(result.total_pages);
        setTotalRecords(result.total_records);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadOrganizations();
  }, [page, search, sort, selectedCountry, selectedType]);

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "30px" }}>

        <h1>🏢 Organizations</h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            margin: "25px 0",
          }}
        >

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="works_desc">
              Works ↓
            </option>

            <option value="works_asc">
              Works ↑
            </option>

            <option value="citations_desc">
              Citations ↓
            </option>

            <option value="citations_asc">
              Citations ↑
            </option>

            <option value="name_asc">
              Name A-Z
            </option>

            <option value="name_desc">
              Name Z-A
            </option>
          </select>

          <input
            placeholder="Country (US, IN...)"
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setPage(1);
            }}
          />

          <input
            placeholder="Type"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
          />

          <button
            onClick={() => {
              setSelectedCountry("");
              setSelectedType("");
              setSort("works_desc");
              setPage(1);
            }}
          >
            Reset
          </button>

        </div>

        <p
          style={{
            marginBottom: "20px",
            color: "#6b7280",
          }}
        >
          Showing <strong>{totalRecords}</strong> organizations
        </p>

        {organizations.length === 0 ? (
          <h3>No organizations found.</h3>
        ) : (
          organizations.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "20px",
                boxShadow: "0 3px 10px rgba(0,0,0,.08)",
              }}
            >
              <h2
                style={{
                  color: "#2563eb",
                }}
              >
                {item.organization_name}
              </h2>

              <p>
                <strong>Country:</strong> {item.country}
              </p>

              <p>
                <strong>City:</strong> {item.city}
              </p>

              <p>
                <strong>Type:</strong> {item.type}
              </p>

              <p>
                <strong>Works:</strong> {item.works_count}
              </p>

              <p>
                <strong>Citations:</strong> {item.cited_by_count}
              </p>

              {item.homepage_url && (
                <p>
                  <a
                    href={item.homepage_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit Website
                  </a>
                </p>
              )}
            </div>
          ))
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginTop: "30px",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ◀ Previous
          </button>

          <span
            style={{
              fontWeight: "bold",
              paddingTop: "8px",
            }}
          >
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next ▶
          </button>
        </div>

      </div>
    </Layout>
  );
}

export default Organizations;