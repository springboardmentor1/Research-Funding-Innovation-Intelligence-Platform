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

export const login = async (email, password) => {
  const response = await api.post('/auth/login-json', { email, password });
  const { access_token, user } = response.data;
  if (access_token) {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('token', access_token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  return response.data;
};

export const register = async (fullName, email, password, role = 'Researcher') => {
  const response = await api.post('/auth/register', {
    full_name: fullName,
    email,
    password,
    role,
  });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const getToken = () => {
  return localStorage.getItem('access_token') || localStorage.getItem('token');
};

export default {
  login,
  register,
  getMe,
  logout,
  getCurrentUser,
  getToken,
};
