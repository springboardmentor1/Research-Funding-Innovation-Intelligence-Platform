import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import { getRecentActivity } from "../api/dashboardApi";

function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await getRecentActivity();
        setActivities(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadActivities();
  }, []);

  return (
    <div className="table-card">
      <h2 className="table-title">
        📄 Recent Publications
      </h2>

      <table className="activity-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Year</th>
            <th>Citations</th>
          </tr>
        </thead>

        <tbody>
          {activities.map((item) => (
            <tr key={item.title}>
              <td>{item.title}</td>
              <td>{item.publication_year}</td>
              <td style={{ fontWeight: "bold", color: "#2563eb" }}>
                {(item.cited_by_count ?? 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentActivity;