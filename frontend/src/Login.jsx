import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      if (isRegister) {
        await axios.post("http://127.0.0.1:8000/register", null, {
          params: {
            username,
            password,
          },
        });

        setMessage("Registration successful. You can now login.");
        setIsRegister(false);
      } else {
        const response = await axios.post(
          "http://127.0.0.1:8000/login",
          null,
          {
            params: {
              username,
              password,
            },
          }
        );

        setMessage(response.data.message);

        onLogin(username);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>RFIIP</h1>

        <h2>
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        <p>
          Research Funding & Innovation Intelligence Platform
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <button
          className="switch-button"
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
          }}
        >
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </button>

      </div>

    </div>
  );
}

export default Login;