import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful!");

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Unable to connect to backend");
    }
  };

  return (
    <div className="container">

      <div className="left-panel">
        <h1>Research Funding Platform</h1>

        <h3>Join Our Research Community</h3>

        <ul>
          <li>Create Your Research Profile</li>
          <li>Explore Funding Opportunities</li>
          <li>Get AI-Based Recommendations</li>
          <li>Secure Registration</li>
        </ul>
      </div>

      <div className="right-panel">

        <form onSubmit={handleRegister}>

          <h2>Register</h2>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">
            Register
          </button>

          {message && <p>{message}</p>}

          <p>
            Already have an account?
            <br />
            <strong onClick={() => navigate("/")}>Login</strong>
          </p>

        </form>

      </div>

    </div>
  );
}

export default Register;