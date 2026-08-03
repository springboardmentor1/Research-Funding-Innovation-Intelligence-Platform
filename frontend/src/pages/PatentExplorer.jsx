import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaSearch, FaLightbulb } from "react-icons/fa";
import { getPatents } from "../services/api";

function PatentExplorer() {
  const [patents, setPatents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPatents();
  }, []);

  const fetchPatents = async () => {
    try {
      const response = await getPatents();
      setPatents(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPatents = patents.filter(
    (patent) =>
      patent.title.toLowerCase().includes(search.toLowerCase()) ||
      patent.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              color: "#1e293b",
              marginBottom: "10px",
            }}
          >
            Patent Explorer
          </h1>

          <p
            style={{
              color: "#64748b",
              marginBottom: "30px",
            }}
          >
            Explore innovation patents from the backend.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              padding: "14px 18px",
              borderRadius: "10px",
              boxShadow: "0 5px 15px rgba(0,0,0,.08)",
              marginBottom: "35px",
            }}
          >
            <FaSearch color="#2563eb" />

            <input
              type="text"
              placeholder="Search patents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                marginLeft: "10px",
                width: "100%",
                fontSize: "16px",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            {filteredPatents.map((patent) => (
              <div
                key={patent.id}
                style={{
                  background: "#fff",
                  borderRadius: "15px",
                  padding: "25px",
                  boxShadow: "0 8px 20px rgba(0,0,0,.08)",
                }}
              >
                <h3
                  style={{
                    color: "#2563eb",
                    marginBottom: "10px",
                  }}
                >
                  <FaLightbulb /> {patent.title}
                </h3>

                <p>
                  <strong>Inventor:</strong> {patent.inventor}
                </p>

                <p>
                  <strong>Domain:</strong> {patent.domain}
                </p>

                <p>
                  <strong>Year:</strong> {patent.year}
                </p>

                <p
                  style={{
                    color: "#64748b",
                    marginTop: "15px",
                    lineHeight: "1.7",
                  }}
                >
                  {patent.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default PatentExplorer;