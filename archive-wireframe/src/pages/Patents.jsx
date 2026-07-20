import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getPatents } from "../api/patentApi";

function Patents() {

  const { search } = useContext(SearchContext);

  const [patents, setPatents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const perPage = 20;

  const [sortBy, setSortBy] = useState("newest");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {

    async function loadPatents() {

      setLoading(true);
      setError("");

      try {

        const response = await getPatents(
          currentPage,
          perPage,
          search,
          sortBy,
          selectedStatus
        );

        setPatents(response.data);
        setTotalPages(response.total_pages);
        setTotalRecords(response.total_records);

      } catch (err) {

        console.error(err);
        setError("Failed to load patents.");

      } finally {

        setLoading(false);

      }

    }

    loadPatents();

  }, [
    currentPage,
    search,
    sortBy,
    selectedStatus
  ]);

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#dc2626",
            fontWeight: "bold",
          }}
        >
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      <div style={{ padding: "30px" }}>

        <h1>📜 Patents</h1>

        {/* Filters */}

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            margin: "25px 0",
          }}
        >

          {/* Status */}

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >

            <option value="">
              All Status
            </option>

            {[...new Set(
              patents.map(
                p => p.Status
              )
            )]
              .filter(Boolean)
              .sort()
              .map(status => (

                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>

              ))}

          </select>

          {/* Sort */}

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >

            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="title_asc">
              Title A-Z
            </option>

            <option value="title_desc">
              Title Z-A
            </option>

          </select>

          <button
            onClick={() => {

              setSelectedStatus("");
              setSortBy("newest");
              setCurrentPage(1);

            }}
            style={{
              padding: "10px 18px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reset Filters
          </button>

        </div>

        {/* Results */}

        <p
          style={{
            color: "#6b7280",
            marginBottom: "20px",
            fontWeight: "500",
          }}
        >
          Showing <strong>{patents.length}</strong> of{" "}
          <strong>{totalRecords}</strong> patent(s)
        </p>

        {patents.length === 0 ? (

          <h3>No patents found.</h3>

        ) : (

          patents.map((item, index) => (

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
                {item.Title}
              </h2>

              <p>
                <strong>📄 Application Number:</strong>{" "}
                {item["Application Number"]}
              </p>

              <p>
                <strong>📢 Publication Number:</strong>{" "}
                {item["Publication Number"]}
              </p>

              <p>
                <strong>📅 Application Date:</strong>{" "}
                {item["Application Date"]}
              </p>

              <p>
                <strong>📅 Publication Date:</strong>{" "}
                {item["Publication Date(U/S 11A)"]}
              </p>

              <p>
                <strong>📌 Status:</strong>{" "}
                {item.Status}
              </p>

              <p>
                <strong>🌍 Country:</strong>{" "}
                {item.Country}
              </p>

              <p>
                <strong>📂 Publication Type:</strong>{" "}
                {item["Publication Type"]}
              </p>

            </div>

          ))

        )}

        {/* Pagination */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            marginTop: "35px",
          }}
        >

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(currentPage - 1)
            }
            style={{
              padding: "10px 18px",
              background:
                currentPage === 1
                  ? "#d1d5db"
                  : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor:
                currentPage === 1
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold",
            }}
          >
            ← Previous
          </button>

          <span
            style={{
              fontWeight: "bold",
              color: "#374151",
            }}
          >
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage(currentPage + 1)
            }
            style={{
              padding: "10px 18px",
              background:
                currentPage === totalPages
                  ? "#d1d5db"
                  : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor:
                currentPage === totalPages
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "bold",
            }}
          >
            Next →
          </button>

        </div>

      </div>

    </Layout>
  );
}

export default Patents;