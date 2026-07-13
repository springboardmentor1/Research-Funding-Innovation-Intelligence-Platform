export async function getPatents() {
  const response = await fetch("http://127.0.0.1:5000/patents");
  return await response.json();
}