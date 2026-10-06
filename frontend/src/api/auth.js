import api from './client';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  getSkills: async () => {
    const response = await api.get('/skills/public');
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await api.get('/leaderboard/public');
    return response.data;
  }
};
