const API_URL = "http://127.0.0.1:5000";

export async function getOrganizations(
  page = 1,
  search = "",
  sort = "works_desc",
  country = "",
  type = ""
) {
  const params = new URLSearchParams({
    page,
    per_page: 20,
    search,
    sort,
    country,
    type,
  });

  const response = await fetch(
    `${API_URL}/organizations?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch organizations");
  }

  return await response.json();
}