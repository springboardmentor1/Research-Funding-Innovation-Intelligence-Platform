import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "../styles/Auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await loginUser(formData);

      /*
       * Save logged-in user information
       */
      if (response?.data) {
        localStorage.setItem(
          "researchUser",
          JSON.stringify(response.data)
        );
      }

      /*
       * IMPORTANT:
       * After login, go to the HOME PAGE.
       *
       * Previously this was:
       * navigate("/dashboard");
       *
       * That is why you were going directly
       * to the dashboard.
       */
      navigate("/");

    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";

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

        {/* =====================================================
            LEFT BRAND PANEL
        ====================================================== */}

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
              RESEARCH INTELLIGENCE PLATFORM
            </span>

            <h1>
              Welcome back to your
              <span> research workspace.</span>
            </h1>

            <p>
              Access research analytics, discover emerging topics,
              explore funding opportunities, and continue your
              research journey from one intelligent platform.
            </p>

          </div>


          <div className="auth-trust">

            <div>
              <span className="trust-icon">📊</span>
              <span>Research Analytics</span>
            </div>

            <div>
              <span className="trust-icon">💰</span>
              <span>Funding Discovery</span>
            </div>

            <div>
              <span className="trust-icon">🤖</span>
              <span>AI Assistance</span>
            </div>

          </div>

        </div>


        {/* =====================================================
            LOGIN CARD
        ====================================================== */}

        <div className="auth-card">

          <div className="auth-card-header">

            <div className="auth-card-icon">
              🔐
            </div>

            <div>

              <span className="auth-card-label">
                ACCOUNT ACCESS
              </span>

              <h2>
                Sign in
              </h2>

              <p>
                Continue to your research workspace.
              </p>

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div className="auth-error">

              <span>
                ⚠️
              </span>

              {error}

            </div>
          )}


          {/* FORM */}

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="auth-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <span>
                  ✉️
                </span>

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


            {/* PASSWORD */}

            <div className="auth-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <span>
                  🔑
                </span>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          {/* DIVIDER */}

          <div className="auth-divider">

            <span></span>

            <p>
              New to the platform?
            </p>

            <span></span>

          </div>


          {/* SIGNUP */}

          <Link
            to="/signup"
            className="auth-secondary-button"
          >
            Create a Research Account
            <span>→</span>
          </Link>


          {/* FOOTER */}

          <div className="auth-footer">

            <span>
              🛡️
            </span>

            Secure research workspace

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;