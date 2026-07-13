import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from "react";
import { getResearchers } from "../api/researcherApi";

function Researchers() {
  const [researchers, setResearchers] = useState([]);

  useEffect(() => {
    async function loadResearchers() {
      try {
        const data = await getResearchers();
        setResearchers(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadResearchers();
  }, []);

  if (researchers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>Researchers</h1>

      {researchers.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>{item.name}</h3>

          <p>
            <strong>Organization:</strong> {item.organization}
          </p>

          <p>
            <strong>Field:</strong> {item.field}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Researchers;