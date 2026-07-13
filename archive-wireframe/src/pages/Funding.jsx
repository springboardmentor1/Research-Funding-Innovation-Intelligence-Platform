import Layout from "../components/Layout";
import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../context/SearchContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getFunding } from "../api/fundingApi";

function Funding() {
  const [funding, setFunding] = useState([]);

  // Get search text from navbar
  const { search } = useContext(SearchContext);

  useEffect(() => {
    async function loadFunding() {
      try {
        const data = await getFunding();
        setFunding(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadFunding();
  }, []);

  if (funding.length === 0) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  // Filter funding projects
  const filteredFunding = funding.filter((item) =>
    item.project_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div style={{ padding: "30px" }}>
        <h1>Funding</h1>

        {filteredFunding.length === 0 ? (
          <h3>No funding projects found.</h3>
        ) : (
          filteredFunding.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
                background: "#fff",
              }}
            >
              <h3>{item.project_title}</h3>

              <p>
                <strong>Organization:</strong>{" "}
                {item.organization}
              </p>

              <p>
                <strong>Principal Investigator:</strong>{" "}
                {item.principal_investigator}
              </p>

              <p>
                <strong>Fiscal Year:</strong>{" "}
                {item.fiscal_year}
              </p>

              <p>
                <strong>Award Amount:</strong>{" "}
                ${Number(item.award_amount).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Funding;