export async function getFunding() {
  const response = await fetch("http://127.0.0.1:5000/funding");
  return await response.json();
}