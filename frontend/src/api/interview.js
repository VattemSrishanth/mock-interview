import api from './client';

export const interviewApi = {
  create: async (data) => {
    const response = await api.post('/interviews', data);
    return response.data;
  },
  parseResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/interviews/parse-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  analyzeText: async (text) => {
    const response = await api.post('/interviews/analyze-text', { text });
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
  submitFollowUp: async (id, data) => {
    const response = await api.post(`/interviews/${id}/follow-up`, data);
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
  },
  executeCode: async ({ language, code, stdin = '' }) => {
    const response = await api.post('/code/execute', { language, code, stdin });
    return response.data;
  }
};
