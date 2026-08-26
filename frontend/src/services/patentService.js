import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const patentService = {
  searchPatents: async () => {
    const response = await axios.get(`${API_URL}/patents/search`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getPatents: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/patents`, {
      headers: getAuthHeaders(),
      params: filters
    });
    return response.data;
  },

  getGlobalPatents: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/global/patents`, {
      headers: getAuthHeaders(),
      params: filters
    });
    return response.data;
  }
};

export default patentService;
