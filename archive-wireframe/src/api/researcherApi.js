const API_URL = "http://127.0.0.1:5000";

export async function getResearchers(
  page = 1,
  search = "",
  sort = "citations_desc",
  country = ""
) {
  const params = new URLSearchParams({
    page,
    per_page: 20,
    search,
    sort,
    country,
  });

  const response = await fetch(
    `${API_URL}/researchers?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch researchers");
  }

  return await response.json();
}