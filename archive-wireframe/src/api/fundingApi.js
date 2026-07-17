const API_URL = "http://127.0.0.1:5000";

export async function getFunding(
  page = 1,
  perPage = 20,
  search = "",
  sort = "newest"
) {
  const response = await fetch(
    `${API_URL}/funding?page=${page}&per_page=${perPage}&search=${encodeURIComponent(
      search
    )}&sort=${sort}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch funding");
  }

  return await response.json();
}