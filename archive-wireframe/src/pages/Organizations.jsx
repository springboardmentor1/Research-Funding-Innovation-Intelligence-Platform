import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from "react";
import { getOrganizations } from "../api/organizationApi";

function Organizations() {
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const data = await getOrganizations();
        setOrganizations(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadOrganizations();
  }, []);

  if (organizations.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>Organizations</h1>

      {organizations.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>{item.organization_name}</h3>

          <p>
            <strong>Country:</strong> {item.country}
          </p>

          <p>
            <strong>Type:</strong> {item.organization_type}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Organizations;