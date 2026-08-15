import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const notificationService = {
  getAll: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: getAuthHeaders(),
      params: filters
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: getAuthHeaders()
    });
    return response.data.unread_count;
  },

  markAsRead: async (id) => {
    const response = await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  markAllRead: async () => {
    const response = await axios.put(`${API_URL}/notifications/read-all`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

export default notificationService;
