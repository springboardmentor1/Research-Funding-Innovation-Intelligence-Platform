const API_URL = "http://127.0.0.1:5000";

/* -----------------------------
   Get Publications List
------------------------------ */

export async function getPublications(
  page = 1,
  perPage = 20,
  search = "",
  sortBy = "newest"
) {
  const response = await fetch(
    `${API_URL}/publications?page=${page}&per_page=${perPage}&search=${encodeURIComponent(
      search
    )}&sort=${sortBy}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch publications");
  }

  return await response.json();
}

/* -----------------------------
   Get Single Publication Details
------------------------------ */

export async function getPublicationDetails(doi) {
  const response = await fetch(
    `${API_URL}/publication/${encodeURIComponent(doi)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch publication details");
  }

  return await response.json();
}