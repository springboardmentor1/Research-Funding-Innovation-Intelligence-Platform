import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        // Store logged-in user
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        // Store JWT token
        localStorage.setItem(
          "access_token",
          data.access_token
        );

        navigate("/");
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);

      setError(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background decoration */}
      <div className="login-background-circle circle-one"></div>
      <div className="login-background-circle circle-two"></div>

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">
            <svg
              viewBox="0 0 64 64"
              width="48"
              height="48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="#2563EB"
              />

              <path
                d="M20 39V25"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M28 43V21"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M36 36V28"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M44 40V24"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <circle
                cx="32"
                cy="32"
                r="20"
                stroke="white"
                strokeWidth="1.5"
                opacity="0.35"
              />
            </svg>
          </div>

          <div>
            <h1>ResearchHub AI</h1>
            <p>Research Intelligence Platform</p>
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h2>Welcome back</h2>

          <p>
            Sign in to access your research intelligence
            dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          {/* Email */}
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
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 5H20C21.1 5 22 5.9 22 7V17C22 18.1 21.1 19 20 19H4C2.9 19 2 18.1 2 17V7C2 5.9 2.9 5 4 5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <path
                    d="M22 7L12 13L2 7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </span>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={loading}
              />

            </div>
          </div>

          {/* Password */}
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
                  xmlns="http://www.w3.org/2000/svg"
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
                  />
                </svg>
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
              />

              {/* Show / Hide Password */}
              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <path
                      d="M10.6 10.6C10.2 11 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13 13.8 13.4 13.4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <path
                      d="M9.9 4.2C10.6 4 11.3 4 12 4C17 4 20.3 8 21.5 10C21.1 10.7 20.3 11.7 19.2 12.7"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <path
                      d="M6.1 6.1C4.2 7.4 3 9.1 2.5 10C3.7 12 7 16 12 16C13.4 16 14.7 15.7 15.8 15.2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M2.5 12C3.7 8 7 5 12 5C17 5 20.3 8 21.5 12C20.3 16 17 19 12 19C7 19 3.7 16 2.5 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>

            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="login-error">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span className="arrow">→</span>
              </>
            )}
          </button>

        </form>

        {/* Footer */}
        <div className="login-footer">
          <span>🔐</span>
          Secure Research Intelligence Access
        </div>

      </div>

      {/* Bottom copyright */}
      <div className="login-copyright">
        ResearchHub AI • Research Funding & Innovation Intelligence Platform
      </div>

    </div>
  );
}

export default Login;