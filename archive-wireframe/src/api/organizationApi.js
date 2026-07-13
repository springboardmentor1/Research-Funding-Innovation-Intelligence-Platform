const API_URL = "http://127.0.0.1:5000";

export async function getOrganizations() {
  const response = await fetch(`${API_URL}/organizations`);

  if (!response.ok) {
    throw new Error("Failed to fetch organizations");
  }

  return await response.json();
}