const API_URL = "http://127.0.0.1:5000";

export async function getNotifications() {
  const response = await fetch(`${API_URL}/notifications`);

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return await response.json();
}