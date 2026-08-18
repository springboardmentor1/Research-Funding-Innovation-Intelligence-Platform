import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const cardRef = useRef(null);
  const pageRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     MOUSE PARALLAX EFFECT
  ===================================================== */

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      const moveX = (x - 0.5) * 20;
      const moveY = (y - 0.5) * 20;

      if (pageRef.current) {
        pageRef.current.style.setProperty(
          "--mouse-x",
          `${x * 100}%`
        );

        pageRef.current.style.setProperty(
          "--mouse-y",
          `${y * 100}%`
        );
      }

      if (cardRef.current) {
        cardRef.current.style.transform = `
          perspective(1200px)
          rotateX(${-moveY * 0.15}deg)
          rotateY(${moveX * 0.15}deg)
        `;
      }
    };

    const handleMouseLeave = () => {
      if (cardRef.current) {
        cardRef.current.style.transform = `
          perspective(1200px)
          rotateX(0deg)
          rotateY(0deg)
        `;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      if (data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "access_token",
          data.access_token
        );

        navigate("/");
      } else {
        setError(
          data.message || "Invalid email or password."
        );
      }
    } catch (error) {
      console.error("Login Error:", error);

      setError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      ref={pageRef}
    >

      {/* =================================================
          ANIMATED BACKGROUND
      ================================================= */}

      <div className="ambient ambient-one"></div>

      <div className="ambient ambient-two"></div>

      <div className="ambient ambient-three"></div>

      <div className="research-grid"></div>

      <div className="mouse-glow"></div>


      {/* =================================================
          FLOATING RESEARCH NODES
      ================================================= */}

      <div className="research-node node-one">
        <span>AI</span>
      </div>

      <div className="research-node node-two">
        <span>01</span>
      </div>

      <div className="research-node node-three">
        <span>∑</span>
      </div>

      <div className="research-node node-four">
        <span>λ</span>
      </div>

      <div className="research-node node-five">
        <span>∞</span>
      </div>

      <div className="research-node node-six">
        <span>DATA</span>
      </div>


      {/* =================================================
          CONNECTION LINES
      ================================================= */}

      <div className="network-line line-one"></div>

      <div className="network-line line-two"></div>

      <div className="network-line line-three"></div>


      {/* =================================================
          LOGIN CARD
      ================================================= */}

      <div
        className="login-card"
        ref={cardRef}
      >

        {/* =================================================
            SECURITY STATUS
        ================================================= */}

        <div className="workspace-status">

          <span className="status-pulse"></span>

          SECURE RESEARCH WORKSPACE

        </div>


        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo">

          <div className="logo-wrapper">

            <img
              src="/logo.png"
              alt="ResearchHub AI logo"
              className="login-logo-image"
            />

            <span className="logo-ring"></span>

          </div>

          <div>

            <h1>
              ResearchHub <span>AI</span>
            </h1>

            <p>
              Research Intelligence Platform
            </p>

          </div>

        </div>


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="login-heading">

          <h2>
            Welcome back<span>.</span>
          </h2>

          <p>
            Sign in to access your research
            intelligence dashboard.
          </p>

        </div>


        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <form onSubmit={handleLogin}>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <div className="input-wrapper">

              <span className="input-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >

                  <path
                    d="M4 5H20C21.1 5 22 5.9 22 7V17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V7C2 5.9 2.9 5 4 5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M22 7L12 13L2 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                </svg>

              </span>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={loading}
                aria-invalid={Boolean(error)}
              />

              {email && (
                <span
                  className="input-success"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}

            </div>

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">

              <span className="input-icon">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >

                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <path
                    d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                </svg>

              </span>

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
                aria-invalid={Boolean(error)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? "◉" : "◌"}

              </button>

            </div>

          </div>


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div
              className="login-error"
              role="alert"
            >

              <span aria-hidden="true">
                ⚠
              </span>

              <span>
                {error}
              </span>

            </div>
          )}


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            <span className="button-content">

              {loading ? (
                <>
                  <span
                    className="spinner"
                    aria-hidden="true"
                  ></span>

                  Signing in...
                </>
              ) : (
                <>
                  Sign In

                  <span
                    className="arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </>
              )}

            </span>

            <span
              className="button-shine"
              aria-hidden="true"
            ></span>

          </button>

        </form>


        {/* =================================================
            SECURITY INFORMATION
        ================================================= */}

        <div className="login-security">

          <div
            className="security-icon"
            aria-hidden="true"
          >
            🔐
          </div>

          <div>

            <strong>
              Secure Research Access
            </strong>

            <span>
              Protected platform authentication
            </span>

          </div>

          <div
            className="security-dot"
            aria-label="Security system active"
          ></div>

        </div>


        {/* =================================================
            PLATFORM STATISTICS
        ================================================= */}

        <div className="login-stats">

          <div>
            <strong>10K+</strong>
            <span>Publications</span>
          </div>

          <div>
            <strong>125K+</strong>
            <span>Patents</span>
          </div>

          <div>
            <strong>10K+</strong>
            <span>Researchers</span>
          </div>

        </div>

      </div>


      {/* =================================================
          COPYRIGHT
      ================================================= */}

      <div className="login-copyright">

        ResearchHub AI

        <span>•</span>

        Research Funding & Innovation Intelligence Platform

      </div>

    </div>
  );
}

export default Login;