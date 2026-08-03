import React, { useState } from "react";
import axios from "axios";

function Funding() {
  const [researchTopic, setResearchTopic] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const findFunding = async () => {
    if (researchTopic.trim() === "") {
      alert("Please enter a research topic.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/recommend-funding",
        {
          research_topic: researchTopic,
        }
      );

      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch funding recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Funding Recommendation Engine</h1>

      <p>
        Enter your research topic to discover suitable funding opportunities.
      </p>

      <input
        type="text"
        placeholder="Example: Artificial Intelligence for Healthcare"
        value={researchTopic}
        onChange={(e) => setResearchTopic(e.target.value)}
        style={{
          width: "400px",
          padding: "12px",
          fontSize: "16px",
        }}
      />

      <button
        onClick={findFunding}
        style={{
          marginLeft: "15px",
          padding: "12px 20px",
          cursor: "pointer",
        }}
      >
        Find Funding
      </button>

      {loading && <p>Loading recommendations...</p>}

      <br />
      <br />

      {recommendations.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid lightgray",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h2>{item.title}</h2>

          <p>
            <strong>Agency:</strong> {item.agency}
          </p>

          <p>
            <strong>Amount:</strong> {item.amount}
          </p>

          <p>{item.description}</p>

          <p>
            <strong>Match Score:</strong> {item.match_score}%
          </p>
        </div>
      ))}
    </div>
  );
}

export default Funding;