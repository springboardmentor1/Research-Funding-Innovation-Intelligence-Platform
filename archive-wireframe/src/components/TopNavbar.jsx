import "../styles/dashboard.css";
import { useContext } from "react";
import { SearchContext } from "../context/SearchContext";

function TopNavbar() {
  const { search, setSearch } = useContext(SearchContext);

  return (
    <header className="top-navbar">
      <div className="logo">
        📚 ARCHIVE
      </div>

      <input
        className="search-box"
        type="text"
        placeholder="Search publications..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </header>
  );
}

export default TopNavbar;