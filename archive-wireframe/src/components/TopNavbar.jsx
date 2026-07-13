function TopNavbar() {
  return (
    <header
      style={{
        padding: "20px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h2>ARCHIVE</h2>

      <input
        type="text"
        placeholder="Search..."
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />
    </header>
  );
}

export default TopNavbar;