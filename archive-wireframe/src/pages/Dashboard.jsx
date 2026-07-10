import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

function Dashboard() {
  return (
    <>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "30px" }}>
          <h1>Dashboard</h1>
          <p>Research Intelligence Dashboard</p>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Dashboard;