import axios from 'axios';

const resolveBaseUrl = () => {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : '';
  if (envUrl && envUrl.trim()) {
    const trimmed = envUrl.trim();
    return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/+$/, '')}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 45000, // 45-second timeout to allow Render free tier containers to wake up from cold start
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or unauthorized
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
