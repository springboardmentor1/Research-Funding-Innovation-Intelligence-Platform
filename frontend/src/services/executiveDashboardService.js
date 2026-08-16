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

export const getAdminExecutiveDashboard = async () => {
  const response = await api.get('/executive/admin');
  return response.data;
};

export const getManagerExecutiveDashboard = async () => {
  const response = await api.get('/executive/manager');
  return response.data;
};

export const getResearcherExecutiveDashboard = async () => {
  const response = await api.get('/executive/researcher');
  return response.data;
};

export const getStartupExecutiveDashboard = async () => {
  const response = await api.get('/executive/startup');
  return response.data;
};

export default {
  getAdminExecutiveDashboard,
  getManagerExecutiveDashboard,
  getResearcherExecutiveDashboard,
  getStartupExecutiveDashboard,
};
