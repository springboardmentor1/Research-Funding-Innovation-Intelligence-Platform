const API_URL = "http://127.0.0.1:5000";

export async function getDashboardInsights() {
  const response = await fetch(`${API_URL}/dashboard-insights`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard insights");
  }

  return await response.json();
}