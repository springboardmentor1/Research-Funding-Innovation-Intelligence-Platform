export async function getFunding() {
  const response = await fetch("http://127.0.0.1:5000/funding");

  if (!response.ok) {
    throw new Error("Failed to fetch funding");
  }

  return await response.json();
}