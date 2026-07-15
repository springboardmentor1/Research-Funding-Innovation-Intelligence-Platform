function DashboardHeader() {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dashboard-header">
      <div>
        <h1>Research Funding & Innovation Intelligence Platform</h1>

        <p>
          Monitor publications, funding, patents, organizations and researchers
          from a single dashboard.
        </p>
      </div>

      <div className="dashboard-date">
        <span>📅 {today}</span>
      </div>
    </div>
  );
}

export default DashboardHeader;