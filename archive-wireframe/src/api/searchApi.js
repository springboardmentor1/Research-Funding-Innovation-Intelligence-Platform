const API_URL = "http://127.0.0.1:5000";

export async function searchAll(query, signal) {
  const response = await fetch(
    `${API_URL}/search?q=${encodeURIComponent(query)}`,
    {
      signal,
    }
  );

  if (!response.ok) {
    throw new Error("Search failed");
  }

  return await response.json();
}