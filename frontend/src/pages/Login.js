import "../App.css";

function Login() {
  return (
    <div className="container">

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

        <form>

          <h2>Login</h2>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
          />

          <button type="submit">
            Login
          </button>

          <p>
            Don't have an account?
            <br />
            <strong>Register</strong>
          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;