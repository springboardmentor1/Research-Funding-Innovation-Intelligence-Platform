import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;