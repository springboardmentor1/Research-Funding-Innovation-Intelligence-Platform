import { useEffect, useState } from "react";
import { getPublications } from "../api/publicationApi";

function Publications() {
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await getPublications();
      setPublications(data);
    }

    loadData();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Publications</h1>

      {publications.map((publication) => (
        <div
          key={publication.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginTop: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>{publication.title}</h3>

          <p>
            <b>Authors:</b> {publication.authors}
          </p>

          <p>
            <b>Year:</b> {publication.year}
          </p>

          <p>
            <b>Citations:</b> {publication.citations}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Publications;