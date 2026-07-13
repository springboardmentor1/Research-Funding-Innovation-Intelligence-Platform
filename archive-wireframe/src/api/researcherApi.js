export async function getResearchers() {
  const response = await fetch("http://127.0.0.1:5000/researchers");
  return await response.json();
}