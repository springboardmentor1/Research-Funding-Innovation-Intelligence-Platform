import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const technologyService = {
  getMaturityData: async () => {
    const response = await axios.get(`${API_URL}/technology/maturity`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getAdoptionData: async () => {
    const response = await axios.get(`${API_URL}/technology/adoption`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getSummary: async () => {
    const response = await axios.get(`${API_URL}/technology/summary`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

export default technologyService;
