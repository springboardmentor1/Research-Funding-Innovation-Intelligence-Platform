import { checkBackend } from "../api/authApi";

function Login() {

  const handleLogin = async () => {
    try {
      const data = await checkBackend();
      console.log(data);
      alert(data.status);
    } catch (error) {
      console.error(error);
      alert("Cannot connect backend");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <h1>ARCHIVE Login</h1>

      <input
        type="email"
        placeholder="Email"
        style={{
          padding: "10px",
          width: "250px",
        }}
      />

      <input
        type="password"
        placeholder="Password"
        style={{
          padding: "10px",
          width: "250px",
        }}
      />

      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
}

export default Login;