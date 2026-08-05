import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const items = [
    { name: "Researchers", path: "/researchers" },
    { name: "Grants", path: "/grants" },
    { name: "Publications", path: "/publications" },
    { name: "Patents", path: "/patents" },
    { name: "Technology", path: "/technology" },
    { name: "Innovation", path: "/innovation" },
    { name: "Commercialization", path: "/commercialization" },
  ];

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ margin: "20px 0", position: "relative" }}>
      <input
        type="text"
        placeholder="Search modules..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />

      {search && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginTop: "5px",
            zIndex: 1000,
          }}
        >
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  navigate(item.path);
                  setSearch("");
                }}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {item.name}
              </div>
            ))
          ) : (
            <div style={{ padding: "10px" }}>No results found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;