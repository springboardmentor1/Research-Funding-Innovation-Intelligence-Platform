import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import StatCard from "../components/StatCard";
import PatentChart from "../components/PatentChart";

function Home() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px", background: "#f5f7fb" }}>
        <Navbar />

      

        <SearchBar />

        {/* Statistics */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            gap: "20px",
            marginTop: "25px",
            flexWrap: "wrap",
          }}
        >
          <StatCard title="Researchers" value="3" />
          <StatCard title="Grants" value="3" />
          <StatCard title="Publications" value="4" />
          <StatCard title="Patents" value="6" />
        </div>

        {/* Milestones */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "30px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ color: "#2563eb" }}>Milestone 2</h2>
            <p><Link to="/researchers">Researchers Dashboard</Link></p>
            <p><Link to="/grants">Grant Analysis</Link></p>
            <p><Link to="/publications">Publication Analysis</Link></p>
          </div>

          <div
            style={{
              flex: 1,
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ color: "#2563eb" }}>Milestone 3</h2>
            <p><Link to="/patents">Patent Analysis</Link></p>
            <p><Link to="/technology">Technology Intelligence</Link></p>
            <p><Link to="/innovation">Innovation Scoring</Link></p>
            <p><Link to="/commercialization">Commercialization Recommendations</Link></p>
          </div>
        </div>

        {/* Patent Chart */}

        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center" }}>Patent Statistics</h2>
<PatentChart />

<h2 style={{ marginTop: "30px" }}>Recent Activity</h2>
<table
  border="1"
  cellPadding="10"
  style={{ width: "100%", borderCollapse: "collapse" }}
>
  <thead>
    <tr>
      <th>Date</th>
      <th>Activity</th>
      <th>Status</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>05-08-2026</td>
      <td>Patent Added</td>
      <td>Completed</td>
    </tr>

    <tr>
      <td>04-08-2026</td>
      <td>Grant Approved</td>
      <td>Completed</td>
    </tr>

    <tr>
      <td>03-08-2026</td>
      <td>Publication Uploaded</td>
      <td>Completed</td>
    </tr>
  </tbody>
</table>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Home;