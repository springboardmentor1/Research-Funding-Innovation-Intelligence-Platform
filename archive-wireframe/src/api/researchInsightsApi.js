const API_URL = "http://127.0.0.1:5000";

export async function getResearchInsights() {
  const response = await fetch(`${API_URL}/research-insights`);

  if (!response.ok) {
    throw new Error("Failed to fetch research insights");
  }

  return await response.json();
}