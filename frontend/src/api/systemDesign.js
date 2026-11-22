import api from './client.js';

export const systemDesignApi = {
  calculateCapacity: async (params) => {
    const res = await api.post('/v1/system-design/calculate-capacity', params);
    return res.data;
  },

  evaluateBlueprint: async (blueprint) => {
    const res = await api.post('/v1/system-design/evaluate-blueprint', blueprint);
    return res.data;
  },

  getTemplates: async () => {
    const res = await api.get('/v1/system-design/templates');
    return res.data;
  },
};

export default systemDesignApi;
