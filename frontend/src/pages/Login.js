import "../App.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");

const handleLogin = async (e) => {
e.preventDefault();
try {
  const response = await fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    setMessage("Login successful!");

    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  } else {
    setMessage(data.message);
  }
} catch (error) {
  setMessage("Unable to connect to backend");
}

};

return ( <div className="container">

  <div className="left-panel">
    <h1>Research Funding Platform</h1>

    <h3>Discover Research Projects & Funding Opportunities</h3>

    <ul>
      <li>Research Project Search</li>
      <li>Funding Opportunity Discovery</li>
      <li>AI-Based Recommendations</li>
      <li>Secure User Authentication</li>
    </ul>
  </div>

  <div className="right-panel">

    <form onSubmit={handleLogin}>

      <h2>Login</h2>

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
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">
        Login
      </button>

      {message && <p>{message}</p>}

      <p>
        Don't have an account?
        <br />

        <strong
          onClick={() => navigate("/register")}
          style={{ cursor: "pointer" }}
        >
          Register
        </strong>
      </p>

    </form>

  </div>

</div>
);
}

export default Login;
