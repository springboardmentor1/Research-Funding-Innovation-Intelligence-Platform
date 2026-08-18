import { Navigate } from 'react-router-dom';
import ResearchDashboard from '../pages/ResearchDashboard';
import InnovationDashboard from '../pages/InnovationDashboard';
import ExecutiveDashboard from '../pages/ExecutiveDashboard';

export default function DashboardRouter() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'RESEARCHER';

  switch (role) {
    case 'RESEARCHER':
      return <ResearchDashboard />;
    case 'STARTUP_FOUNDER':
    case 'INNOVATION_MANAGER':
      return <InnovationDashboard />;
    case 'ADMIN':
      return <ExecutiveDashboard />;
    default:
      return <ResearchDashboard />;
  }
}
