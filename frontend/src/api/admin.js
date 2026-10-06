import api from './client';

export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getInterviews: async () => {
    const response = await api.get('/admin/interviews');
    return response.data;
  }
};
