import api from './api';

export const patentAnalyticsService = {
  getLandscape: async () => {
    try {
      const response = await api.get('/patent-analytics/landscape');
      return response.data;
    } catch (error) {
      console.error('Error getting patent landscape:', error);
      return null;
    }
  },

  getTechnologyIntelligence: async () => {
    try {
      const response = await api.get('/patent-analytics/technology-intelligence');
      return response.data;
    } catch (error) {
      console.error('Error getting technology intelligence:', error);
      return [];
    }
  },

  getInnovationScore: async (patentId) => {
    try {
      const response = await api.get(`/patent-analytics/innovation-score/${patentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting innovation score:', error);
      return null;
    }
  },

  getCommercializationRecommendation: async (patentId) => {
    try {
      const response = await api.get(`/patent-analytics/commercialization/${patentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting commercialization recommendation:', error);
      return null;
    }
  },

  getDashboard: async () => {
    try {
      const response = await api.get('/patent-analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error getting patent analytics dashboard:', error);
      return null;
    }
  }
};

export default patentAnalyticsService;