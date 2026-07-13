import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import { getDashboardCounts } from "../api/dashboardApi";

function KPISection() {
  const [counts, setCounts] = useState({
    publications: 0,
    funding: 0,
    patents: 0,
    organizations: 0,
    researchers: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardCounts();
        setCounts(data);
      } catch (error) {
        console.error("Dashboard API Error:", error);
      }
    }

    loadData();
  }, []);

  return (
    <div>
      <h2 className="section-title">📊 Dashboard Overview</h2>

      <div className="kpi-grid">

        <div className="kpi-card kpi-publications">
          <div className="kpi-title">📚 Publications</div>
          <div className="kpi-value">{counts.publications}</div>
          <div className="kpi-footer">📈 Research Papers</div>
        </div>

        <div className="kpi-card kpi-funding">
          <div className="kpi-title">💰 Funding</div>
          <div className="kpi-value">{counts.funding}</div>
          <div className="kpi-footer">💵 Active Grants</div>
        </div>

        <div className="kpi-card kpi-patents">
          <div className="kpi-title">📜 Patents</div>
          <div className="kpi-value">{counts.patents}</div>
          <div className="kpi-footer">💡 Innovations</div>
        </div>

        <div className="kpi-card kpi-organizations">
          <div className="kpi-title">🏢 Organizations</div>
          <div className="kpi-value">{counts.organizations}</div>
          <div className="kpi-footer">🏛 Research Institutes</div>
        </div>

        <div className="kpi-card kpi-researchers">
          <div className="kpi-title">👨‍🔬 Researchers</div>
          <div className="kpi-value">{counts.researchers}</div>
          <div className="kpi-footer">🧑‍🔬 Scientists</div>
        </div>

      </div>
    </div>
  );
}

export default KPISection;