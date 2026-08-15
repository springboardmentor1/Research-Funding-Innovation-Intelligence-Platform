import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const reportService = {
  getReports: async () => {
    const response = await axios.get(`${API_URL}/reports`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  generateReport: async (reportType, fileFormat = 'PDF') => {
    const response = await axios.post(`${API_URL}/reports/generate`, {
      report_type: reportType,
      file_format: fileFormat
    }, { headers: getAuthHeaders() });
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await axios.delete(`${API_URL}/reports/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

export default reportService;
