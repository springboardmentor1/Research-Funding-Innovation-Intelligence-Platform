import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const innovationService = {
  getScores: async (category = null, minScore = 0) => {
    const params = { min_score: minScore };
    if (category && category !== 'all') params.category = category;
    const response = await axios.get(`${API_URL}/innovation/scores`, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  },

  evaluateIdea: async (ideaData) => {
    const response = await axios.post(`${API_URL}/innovation/evaluate`, ideaData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_URL}/innovation/categories`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

export default innovationService;
