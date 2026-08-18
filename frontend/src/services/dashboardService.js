import api from './api';

export const dashboardService = {
  getDashboard: async () => {
    const response = await api.get('/api/dashboard/');
    return response.data;
  }
};

export default dashboardService;