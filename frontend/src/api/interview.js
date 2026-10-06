import api from './client';

export const interviewApi = {
  create: async (data) => {
    const response = await api.post('/interviews', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/interviews');
    return response.data;
  },
  getRecent: async () => {
    const response = await api.get('/interviews/recent');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },
  start: async (id) => {
    const response = await api.post(`/interviews/${id}/start`);
    return response.data;
  },
  submitAnswer: async (id, data) => {
    const response = await api.post(`/interviews/${id}/answer`, data);
    return response.data;
  },
  complete: async (id) => {
    const response = await api.post(`/interviews/${id}/complete`);
    return response.data;
  },
  getResult: async (id) => {
    const response = await api.get(`/interviews/${id}/result`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/interviews/${id}`);
    return response.data;
  }
};
