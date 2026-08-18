import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/api";
import "../styles/Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await signupUser(formData);

      /*
       * After successful registration, send the user
       * to the login page.
       */
      navigate("/login");
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Background decoration */}
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-container">

        {/* LEFT BRAND PANEL */}
        <div className="auth-brand-panel">

          <div className="auth-brand">

            <div className="brand-icon">
              🧠
            </div>

            <div>
              <span>AI RESEARCH</span>
              <strong>INTELLIGENCE</strong>
            </div>

          </div>


          <div className="auth-brand-content">

            <span className="auth-overline">
              JOIN THE RESEARCH NETWORK
            </span>

            <h1>
              Build your
              <span> research intelligence workspace.</span>
            </h1>

            <p>
              Create your account and bring research discovery,
              publication analytics, funding intelligence, and
              AI assistance together in one professional workspace.
            </p>

          </div>


          <div className="auth-trust">

            <div>
              <span className="trust-icon">🔬</span>
              <span>Explore Research</span>
            </div>

            <div>
              <span className="trust-icon">📈</span>
              <span>Track Trends</span>
            </div>

            <div>
              <span className="trust-icon">🚀</span>
              <span>Discover Opportunities</span>
            </div>

          </div>

        </div>


        {/* SIGNUP CARD */}
        <div className="auth-card signup-card">

          <div className="auth-card-header">

            <div className="auth-card-icon">
              🚀
            </div>

            <div>
              <span className="auth-card-label">
                GET STARTED
              </span>

              <h2>Create account</h2>

              <p>
                Set up your research intelligence workspace.
              </p>
            </div>

          </div>


          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            <div className="auth-field">

              <label htmlFor="username">
                Researcher name
              </label>

              <div className="auth-input-wrapper">
                <span>👤</span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>

            </div>


            <div className="auth-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">
                <span>✉️</span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="researcher@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

            </div>


            <div className="auth-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="auth-input-wrapper">
                <span>🔐</span>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              <div className="password-hint">
                Minimum 6 characters
              </div>

            </div>


            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <span>→</span>
                </>
              )}
            </button>

          </form>


          <div className="auth-divider">
            <span></span>
            <p>Already registered?</p>
            <span></span>
          </div>


          <Link
            to="/login"
            className="auth-secondary-button"
          >
            Sign In
            <span>→</span>
          </Link>


          <div className="auth-footer">
            <span>🛡️</span>
            Your research workspace starts here
          </div>

        </div>

      </div>
    </div>
  );
}

export default Signup;