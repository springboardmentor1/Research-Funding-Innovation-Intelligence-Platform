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
      setPatents(response.data || []);
    } catch (error) {
      console.error("Failed to fetch patents:", error);
    }
  };

  const filteredPatents = patents.filter((patent) => {
    const title = patent.title || "";
    const domain = patent.domain || "";

    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      domain.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #050b12 0%, #07111a 100%)",
          padding: "55px 40px 70px",
          color: "#e2e8f0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* HEADER */}
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                color: "#22d3ee",
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              INNOVATION DISCOVERY
            </div>

            <h1
              style={{
                color: "#f8fafc",
                fontSize: "42px",
                fontWeight: "800",
                margin: "0 0 10px",
              }}
            >
              Patent Explorer
            </h1>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "16px",
                margin: 0,
              }}
            >
              Explore innovation patents from the backend.
            </p>
          </div>

          {/* SEARCH */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#0b151f",
              border: "1px solid #263746",
              borderRadius: "14px",
              padding: "14px 18px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              marginBottom: "35px",
            }}
          >
            <FaSearch
              color="#22d3ee"
              size={18}
            />

            <input
              type="text"
              placeholder="Search patents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "transparent",
                color: "#f8fafc",
                border: "none",
                outline: "none",
                marginLeft: "12px",
                width: "100%",
                fontSize: "16px",
              }}
            />
          </div>

          {/* PATENTS */}
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
                  background:
                    "linear-gradient(145deg, #101b26, #0b151f)",
                  border: "1px solid #263746",
                  borderRadius: "16px",
                  padding: "26px",
                  boxShadow:
                    "0 12px 35px rgba(0,0,0,0.25)",
                }}
              >
                {/* TITLE */}
                <h3
                  style={{
                    color: "#f8fafc",
                    margin: "0 0 18px",
                    fontSize: "23px",
                    fontWeight: "700",
                    lineHeight: "1.4",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaLightbulb color="#22d3ee" />
                  {patent.title || "Untitled Patent"}
                </h3>

                {/* INVENTOR */}
                <p
                  style={{
                    color: "#cbd5e1",
                    margin: "0 0 13px",
                    fontSize: "15px",
                  }}
                >
                  <strong style={{ color: "#f1f5f9" }}>
                    Inventor:
                  </strong>{" "}
                  {patent.inventor || "Not available"}
                </p>

                {/* DOMAIN */}
                <p
                  style={{
                    color: "#cbd5e1",
                    margin: "0 0 13px",
                    fontSize: "15px",
                  }}
                >
                  <strong style={{ color: "#f1f5f9" }}>
                    Domain:
                  </strong>{" "}
                  {patent.domain || "Not available"}
                </p>

                {/* YEAR */}
                <p
                  style={{
                    color: "#cbd5e1",
                    margin: "0 0 18px",
                    fontSize: "15px",
                  }}
                >
                  <strong style={{ color: "#f1f5f9" }}>
                    Year:
                  </strong>{" "}
                  {patent.year || "Not available"}
                </p>

                <div
                  style={{
                    borderTop: "1px solid #263746",
                    paddingTop: "18px",
                  }}
                >
                  {/* DESCRIPTION */}
                  <p
                    style={{
                      color: "#aebdca",
                      margin: 0,
                      lineHeight: "1.8",
                      fontSize: "15px",
                    }}
                  >
                    {patent.description ||
                      "No description available."}
                  </p>
                </div>
              </div>
            ))}

            {/* NO RESULTS */}
            {filteredPatents.length === 0 && (
              <div
                style={{
                  background: "#0f1a24",
                  border: "1px solid #263746",
                  borderRadius: "15px",
                  padding: "40px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                No patents found.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default PatentExplorer;