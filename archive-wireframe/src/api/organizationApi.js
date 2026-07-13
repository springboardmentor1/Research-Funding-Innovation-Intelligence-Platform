export async function getOrganizations() {
  const response = await fetch("http://127.0.0.1:5000/organizations");
  return await response.json();
}