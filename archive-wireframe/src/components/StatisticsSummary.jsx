import { useEffect, useState } from "react";
import { getDashboardCounts } from "../api/dashboardApi";

function StatisticsSummary() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardCounts();
        setCounts(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, []);

  if (!counts) return null;

  const total =
    counts.publications +
    counts.funding +
    counts.patents +
    counts.organizations +
    counts.researchers;

  return (
    <div className="summary-stats">
      <div className="summary-item">
        <h3>{total.toLocaleString()}</h3>
        <p>Total Records</p>
      </div>

      <div className="summary-item">
        <h3>{counts.publications}</h3>
        <p>Research Papers</p>
      </div>

      <div className="summary-item">
        <h3>{counts.patents}</h3>
        <p>Patents</p>
      </div>

      <div className="summary-item">
        <h3>{counts.funding}</h3>
        <p>Funding Projects</p>
      </div>
    </div>
  );
}

export default StatisticsSummary;