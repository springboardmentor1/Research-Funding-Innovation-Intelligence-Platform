const API_URL = "http://127.0.0.1:5000";

export async function getResearchers() {
  const response = await fetch(`${API_URL}/researchers`);

  if (!response.ok) {
    throw new Error("Failed to fetch researchers");
  }

  return await response.json();
}