import "../App.css";

function Register() {
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

        <form>

          <h2>Register</h2>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
          />

          <button type="submit">
            Register
          </button>

          <p>
            Already have an account?
            <br />
            <strong>Login</strong>
          </p>

        </form>

      </div>

    </div>
  );
}

export default Register;