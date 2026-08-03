import React from "react";

function RecentPapers({ papers }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 5px 20px rgba(0,0,0,.08)",
        marginTop: "30px",
      }}
    >
      <h2>📚 Latest Research Papers</h2>

      {papers.length === 0 ? (
        <p>No papers available.</p>
      ) : (
        papers.map((paper, index) => (
          <div
            key={index}
            style={{
              borderBottom: "1px solid #eee",
              padding: "15px 0",
            }}
          >
            <h3>{paper.title}</h3>

            <p>
              <strong>Topic:</strong> {paper.topic}
            </p>

            <p>
              <strong>Year:</strong> {paper.year}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default RecentPapers;