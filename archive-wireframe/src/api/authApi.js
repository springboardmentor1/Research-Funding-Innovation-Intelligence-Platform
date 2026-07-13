export async function checkBackend() {
  const response = await fetch("http://127.0.0.1:5000/health");

  if (!response.ok) {
    throw new Error("Backend not reachable");
  }

  return await response.json();
}