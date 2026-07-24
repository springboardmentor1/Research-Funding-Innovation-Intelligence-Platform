import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const publicationService = {
  searchPublications: async () => {
    const response = await axios.get(`${API_URL}/publications/search`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getPublications: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/publications`, {
      headers: getAuthHeaders(),
      params: filters
    });
    return response.data;
  }
};

export default publicationService;
