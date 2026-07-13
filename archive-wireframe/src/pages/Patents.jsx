import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from "react";
import { getPatents } from "../api/patentApi";

function Patents() {
  const [patents, setPatents] = useState([]);

  useEffect(() => {
    async function loadPatents() {
      try {
        const data = await getPatents();
        setPatents(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadPatents();
  }, []);

  if (patents.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>Patents</h1>

      {patents.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>{item.patent_title}</h3>

          <p>
            <strong>Patent Number:</strong> {item.patent_number}
          </p>

          <p>
            <strong>Inventor:</strong> {item.inventor}
          </p>

          <p>
            <strong>Assignee:</strong> {item.assignee}
          </p>

          <p>
            <strong>Publication Date:</strong> {item.publication_date}
          </p>

          <p>
            <strong>Country:</strong> {item.country}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Patents;