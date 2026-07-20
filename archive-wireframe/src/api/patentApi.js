const API_URL = "http://127.0.0.1:5000";

export async function getPatents(
  page = 1,
  perPage = 20,
  search = "",
  sort = "newest",
  status = ""
) {
  const params = new URLSearchParams({
    page,
    per_page: perPage,
    search,
    sort,
    status,
  });

  const response = await fetch(
    `${API_URL}/patents?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch patents");
  }

  return await response.json();
}