export async function getPublications() {
  const response = await fetch("http://127.0.0.1:5000/publications");

  if (!response.ok) {
    throw new Error("Failed to fetch publications");
  }

  return await response.json();
}