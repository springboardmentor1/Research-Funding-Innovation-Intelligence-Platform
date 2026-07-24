import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login-json`, {
      email,
      password
    });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
};

export default authService;
