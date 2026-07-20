import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getResearchers } from "../api/researcherApi";

function Researchers() {
  const { search } = useContext(SearchContext);

  const [researchers, setResearchers] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [sort, setSort] = useState("citations_desc");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResearchers() {
      try {
        setLoading(true);

        const result = await getResearchers(
          page,
          search,
          sort,
          selectedCountry
        );

        setResearchers(result.data);
        setTotalPages(result.total_pages);
        setTotalRecords(result.total_records);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadResearchers();
  }, [page, search, sort, selectedCountry]);

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

        <h1>👨‍🔬 Researchers</h1>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
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
            <option value="citations_desc">
              Citations ↓
            </option>

            <option value="citations_asc">
              Citations ↑
            </option>

            <option value="works_desc">
              Publications ↓
            </option>

            <option value="works_asc">
              Publications ↑
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

          <button
            onClick={() => {
              setSelectedCountry("");
              setSort("citations_desc");
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
          Showing <strong>{totalRecords}</strong> researchers
        </p>

        {researchers.length === 0 ? (
          <h3>No researchers found.</h3>
        ) : (
          researchers.map((item, index) => (
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
              <h2 style={{ color: "#2563eb" }}>
                {item.researcher_name}
              </h2>

              <p>
                <strong>Institution:</strong>{" "}
                {item.institution}
              </p>

              <p>
                <strong>Country:</strong>{" "}
                {item.country}
              </p>

              <p>
                <strong>Publications:</strong>{" "}
                {Number(item.works_count).toLocaleString()}
              </p>

              <p>
                <strong>Citations:</strong>{" "}
                {Number(item.cited_by_count).toLocaleString()}
              </p>

              <p>
                <strong>ORCID:</strong>{" "}
                {item.orcid || "Not Available"}
              </p>

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

export default Researchers;