import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const profileService = {
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/profile/me`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  createProfile: async (profileData) => {
    const response = await axios.post(`${API_URL}/profile`, profileData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await axios.put(`${API_URL}/profile`, profileData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

export default profileService;
