import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaRobot, FaPaperPlane } from "react-icons/fa";

function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AI Research Assistant. Ask me anything about research, funding, patents, or innovation."
    }
  ]);

  const getAIResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes("ai") || q.includes("artificial intelligence"))
      return "AI research topics: Explainable AI, Medical AI, Federated Learning, Edge AI, and Generative AI.";

    if (q.includes("machine learning"))
      return "Machine Learning research: Deep Learning, Reinforcement Learning, Transfer Learning, AutoML, TinyML.";

    if (q.includes("cyber"))
      return "Cybersecurity research: Zero Trust, AI-based Threat Detection, Cloud Security, IoT Security.";

    if (q.includes("blockchain"))
      return "Blockchain research: Smart Contracts, DeFi, Web3 Security, Supply Chain Tracking.";

    if (q.includes("funding"))
      return "Funding agencies include NSF, Horizon Europe, NIH, DST India, and AICTE.";

    if (q.includes("patent"))
      return "Search for existing patents before publishing. Focus on novelty and industrial applicability.";

    return "I can help with research topics, funding opportunities, patents, and innovation ideas.";
  };

  const sendMessage = () => {
    if (!question.trim()) return;

    const userMessage = {
      sender: "user",
      text: question,
    };

    const aiMessage = {
      sender: "ai",
      text: getAIResponse(question),
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setQuestion("");
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          background: "#f8fafc",
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              color: "#2563eb",
              marginBottom: "25px",
            }}
          >
            <FaRobot /> AI Research Assistant
          </h1>

          <div
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "20px",
              height: "500px",
              overflowY: "auto",
              boxShadow: "0 5px 15px rgba(0,0,0,.08)",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background:
                      msg.sender === "user" ? "#2563eb" : "#e2e8f0",
                    color: msg.sender === "user" ? "#fff" : "#000",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    maxWidth: "75%",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "20px",
              gap: "10px",
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Ask about research, funding, patents..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button
              className="btn btn-primary"
              onClick={sendMessage}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Assistant;