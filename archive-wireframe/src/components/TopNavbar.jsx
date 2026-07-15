import "../styles/dashboard.css";
import { useContext } from "react";
import { SearchContext } from "../context/SearchContext";
import { useNavigate } from "react-router-dom";

function TopNavbar() {
  const { search, setSearch } = useContext(SearchContext);

  const navigate = useNavigate();

  const handleSearch = () => {
    if (!search.trim()) return;

    navigate("/search");
  };

  return (
    <header className="top-navbar">
      <div className="logo">
        📚 ARCHIVE
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          className="search-box"
          type="text"
          placeholder="Search Publications, Patents, Funding..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button
          onClick={handleSearch}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Search
        </button>
      </div>
    </header>
  );
}

export default TopNavbar;