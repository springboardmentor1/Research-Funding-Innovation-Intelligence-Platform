const API_URL = "http://127.0.0.1:5000";

export async function getReports() {
  const response = await fetch(`${API_URL}/reports`);

  if (!response.ok) {
    throw new Error("Failed to fetch report");
  }

  return await response.json();
}