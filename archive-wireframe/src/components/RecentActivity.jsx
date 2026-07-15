import { useEffect, useState } from "react";
import { getRecentActivity } from "../api/dashboardApi";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadActivity() {
      try {
        const data = await getRecentActivity();
        setActivities(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, []);

  if (loading) {
    return (
      <div className="table-card">
        <h2>Loading Recent Publications...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-card">
        <h2>Recent Publications</h2>
        <p>Unable to load recent publications.</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h2 className="table-title">📑 Recent Publications</h2>

        <span className="table-badge">
          {activities.length} Records
        </span>
      </div>

      <table className="activity-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Year</th>
            <th>Type</th>
            <th>Citations</th>
          </tr>
        </thead>

        <tbody>
          {activities.map((item, index) => (
            <tr key={index}>
              <td>{item.title}</td>

              <td>{item.publication_year}</td>

              <td>
                <span className="type-badge">
                  {item.type}
                </span>
              </td>

              <td>{item.cited_by_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentActivity;