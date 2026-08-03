import React from "react";
import { Link } from "react-router-dom";
import {
  FaBrain,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";

function Footer() {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "#fff",
        marginTop: "60px",
        padding: "50px 20px 25px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "40px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <FaBrain size={28} color="#3b82f6" />
            <h3 style={{ margin: 0 }}>
              AI Research Platform
            </h3>
          </div>

          <p
            style={{
              color: "#cbd5e1",
              lineHeight: "1.8",
            }}
          >
            An AI-powered platform for analyzing research
            publications, identifying emerging technologies,
            exploring patents, and recommending funding
            opportunities.
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <Link
              to="/"
              style={{
                color: "#cbd5e1",
                textDecoration: "none",
              }}
            >
              Home
            </Link>

            <Link
              to="/dashboard"
              style={{
                color: "#cbd5e1",
                textDecoration: "none",
              }}
            >
              Dashboard
            </Link>

            <Link
              to="/research"
              style={{
                color: "#cbd5e1",
                textDecoration: "none",
              }}
            >
              Research
            </Link>

            <Link
              to="/funding"
              style={{
                color: "#cbd5e1",
                textDecoration: "none",
              }}
            >
              Funding
            </Link>
          </div>
        </div>

        <div>
          <h4>Connect</h4>

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "20px",
              fontSize: "1.6rem",
            }}
          >
            <a
              href="#"
              style={{ color: "#fff" }}
            >
              <FaGithub />
            </a>

            <a
              href="#"
              style={{ color: "#fff" }}
            >
              <FaLinkedin />
            </a>

            <a
              href="mailto:example@email.com"
              style={{ color: "#fff" }}
            >
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>

      <hr
        style={{
          margin: "35px 0 20px",
          borderColor: "#334155",
        }}
      />

      <p
        style={{
          textAlign: "center",
          color: "#94a3b8",
          margin: 0,
        }}
      >
        © {new Date().getFullYear()} AI Research Funding &
        Innovation Intelligence Platform. All Rights Reserved.
      </p>
    </footer>
  );
}

export default Footer;