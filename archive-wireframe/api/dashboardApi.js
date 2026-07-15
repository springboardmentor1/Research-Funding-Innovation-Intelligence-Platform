export async function getDashboardAnalytics() {
  const response = await fetch(
    "http://127.0.0.1:5000/dashboard/analytics"
  );

  return await response.json();
}