import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getReportTypes = async () => {
  const response = await api.get('/reports/types');
  return response.data;
};

export const generateReport = async (payload) => {
  const response = await api.post('/reports/generate', payload);
  return response.data;
};

export const downloadReport = async (reportId, filename) => {
  const response = await api.get(`/reports/download/${reportId}`, {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename || `${reportId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const listReports = async () => {
  const response = await api.get('/reports/list');
  return response.data;
};

export default {
  getReportTypes,
  generateReport,
  downloadReport,
  listReports,
};
