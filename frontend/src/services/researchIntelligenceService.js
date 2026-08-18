import api from './api';

export const researchIntelligenceService = {
  getDashboard: async () => {
    try {
      const response = await api.get('/research-intelligence/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error getting research intelligence dashboard:', error);
      return null;
    }
  },

  getPublicationTrends: async () => {
    try {
      const response = await api.get('/research-intelligence/dashboard');
      return response.data.publication_trends;
    } catch (error) {
      console.error('Error getting publication trends:', error);
      return [];
    }
  }
};

export default researchIntelligenceService;