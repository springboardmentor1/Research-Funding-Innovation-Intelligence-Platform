const API_URL = "http://127.0.0.1:5000";

export async function getDashboardCounts() {
  const response = await fetch(`${API_URL}/dashboard`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return await response.json();
}
export async function getRecentActivity() {
  const response = await fetch("http://127.0.0.1:5000/recent-activity");

  if (!response.ok) {
    throw new Error("Failed to fetch recent activity");
  }

  return await response.json();
}
export async function getPublicationTrends() {
  const response = await fetch("http://127.0.0.1:5000/publication-trends");

  if (!response.ok) {
    throw new Error("Failed to fetch publication trends");
  }

  return await response.json();
}