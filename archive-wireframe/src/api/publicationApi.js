const API_URL = "http://127.0.0.1:5000";

export async function getPublications(
  page = 1,
  perPage = 20,
  search = "",
  sortBy = "newest"
) {
  const response = await fetch(
    `${API_URL}/publications?page=${page}&per_page=${perPage}&search=${encodeURIComponent(
      search
    )}&sort_by=${sortBy}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch publications");
  }

  return await response.json();
}