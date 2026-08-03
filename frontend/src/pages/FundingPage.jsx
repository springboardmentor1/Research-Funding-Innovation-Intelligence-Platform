import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecommendationCard from "../components/RecommendationCard";
import { getFundingRecommendations } from "../services/api";
import { FaSearchDollar } from "react-icons/fa";

function FundingPage() {
  const [topic, setTopic] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!topic.trim()) {
      alert("Please enter a research topic.");
      return;
    }

    try {
      setLoading(true);

      const response = await getFundingRecommendations(topic);

      console.log(response.data);

      setRecommendations(
        response.data.recommendations || []
      );
    } catch (error) {
      console.error(error);
      alert("Unable to fetch funding recommendations.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

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
            AI Funding Recommendation Engine
          </h1>

          <p
            style={{
              color: "#64748b",
              marginBottom: "30px",
            }}
          >
            Search funding opportunities using AI.
          </p>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "30px",
            }}
          >
            <input
              type="text"
              placeholder="Example: Artificial Intelligence"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />

            <button
              onClick={handleSearch}
              className="btn btn-primary"
            >
              <FaSearchDollar />
              {" "}Search
            </button>
          </div>

          {loading && (
            <h3>Loading recommendations...</h3>
          )}

          {!loading && recommendations.length === 0 && (
            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
              }}
            >
              No recommendations found.
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(350px,1fr))",
              gap: "25px",
            }}
          >
            {recommendations.map((item, index) => (
              <RecommendationCard
                key={index}
                recommendation={item}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default FundingPage;