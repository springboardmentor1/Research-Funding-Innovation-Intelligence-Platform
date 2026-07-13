import { useState } from "react";
import { searchData } from "../api/searchApi";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    publications: [],
    funding: [],
  });

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const data = await searchData(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Global Search</h1>

      <input
        type="text"
        placeholder="Search publications or funding..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
          marginRight: "10px",
        }}
      />

      <button onClick={handleSearch}>Search</button>

      <hr />

      <h2>📄 Publications</h2>

      {results.publications.length === 0 ? (
        <p>No publications found.</p>
      ) : (
        results.publications.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <strong>{item.title}</strong>
          </div>
        ))
      )}

      <h2>💰 Funding</h2>

      {results.funding.length === 0 ? (
        <p>No funding found.</p>
      ) : (
        results.funding.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <strong>{item.project_title}</strong>

            <p>{item.organization}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Search;