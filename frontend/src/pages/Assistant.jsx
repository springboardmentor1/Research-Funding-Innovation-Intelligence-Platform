import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaRobot, FaPaperPlane } from "react-icons/fa";

function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AI Research Assistant. Ask me anything about research, funding, patents, or innovation.",
    },
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

      <main
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #050b12 0%, #07111a 100%)",
          padding: "50px 30px 70px",
          color: "#e2e8f0",
        }}
      >
        <div
          style={{
            maxWidth: "950px",
            margin: "0 auto",
          }}
        >
          {/* HEADER */}
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                color: "#22d3ee",
                fontSize: "13px",
                fontWeight: "800",
                letterSpacing: "1.5px",
                marginBottom: "10px",
              }}
            >
              AI RESEARCH SUPPORT
            </div>

            <h1
              style={{
                color: "#f8fafc",
                margin: 0,
                fontSize: "40px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <FaRobot color="#22d3ee" />
              AI Research Assistant
            </h1>

            <p
              style={{
                color: "#94a3b8",
                marginTop: "10px",
                fontSize: "16px",
              }}
            >
              Get quick guidance about research, funding, patents, and
              innovation.
            </p>
          </div>

          {/* CHAT BOX */}
          <div
            style={{
              background:
                "linear-gradient(145deg, #101b26, #0b151f)",
              border: "1px solid #263746",
              borderRadius: "18px",
              padding: "22px",
              height: "500px",
              overflowY: "auto",
              boxShadow: "0 15px 40px rgba(0,0,0,0.30)",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign:
                    msg.sender === "user" ? "right" : "left",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background:
                      msg.sender === "user"
                        ? "linear-gradient(135deg, #0ea5e9, #14b8a6)"
                        : "#172431",
                    border:
                      msg.sender === "user"
                        ? "none"
                        : "1px solid #2b3d4c",
                    color:
                      msg.sender === "user"
                        ? "#ffffff"
                        : "#dbe4ec",
                    padding: "14px 17px",
                    borderRadius: "14px",
                    maxWidth: "75%",
                    lineHeight: "1.6",
                    fontSize: "15px",
                    textAlign: "left",
                    boxShadow:
                      "0 6px 18px rgba(0,0,0,0.18)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div
            style={{
              display: "flex",
              marginTop: "18px",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Ask about research, funding, patents..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              style={{
                flex: 1,
                background: "#0b151f",
                border: "1px solid #294050",
                borderRadius: "12px",
                outline: "none",
                padding: "15px 17px",
                color: "#f8fafc",
                fontSize: "15px",
              }}
            />

            <button
              onClick={sendMessage}
              style={{
                width: "58px",
                border: "none",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, #06b6d4, #14b8a6)",
                color: "#ffffff",
                fontSize: "18px",
                cursor: "pointer",
                boxShadow:
                  "0 8px 20px rgba(20,184,166,0.20)",
              }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Assistant;