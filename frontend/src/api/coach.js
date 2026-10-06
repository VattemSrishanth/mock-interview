import api from './client';

export const coachApi = {
  chat: async (message) => {
    const response = await api.post('/ai/coach', { message });
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/ai/status');
    return response.data;
  },
  configureKey: async (provider, apiKey) => {
    const response = await api.post('/ai/configure-key', { provider, apiKey });
    return response.data;
  }
};
