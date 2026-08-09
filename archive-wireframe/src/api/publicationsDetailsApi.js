const API_URL = "http://127.0.0.1:5000";

export async function getPublication(id) {
  const response = await fetch(
    `${API_URL}/publication/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch publication");
  }

  return await response.json();
}