import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicationDetails } from "../api/publicationApi";

function PublicationDetails() {
  const { doi } = useParams();
  const navigate = useNavigate();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPublication() {
      try {
        const data = await getPublicationDetails(doi);
        setPublication(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadPublication();
  }, [doi]);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Loading Publication...
      </h2>
    );
  }

  if (!publication) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Publication not found.
      </h2>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 6px 18px rgba(0,0,0,.12)"
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "20px",
          padding: "10px 18px",
          border: "none",
          background: "#2563eb",
          color: "#fff",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        ← Back
      </button>

      <h1>{publication.title}</h1>

      <hr />

      <p><strong>Authors:</strong> {publication.authors}</p>

      <p><strong>Publication Year:</strong> {publication.publication_year}</p>

      <p><strong>Type:</strong> {publication.type}</p>

      <p><strong>Citations:</strong> {publication.cited_by_count}</p>

      <p>
        <strong>DOI:</strong>{" "}
        <a
          href={publication.doi}
          target="_blank"
          rel="noreferrer"
        >
          {publication.doi}
        </a>
      </p>
    </div>
  );
}

export default PublicationDetails;