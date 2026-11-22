import api from './client.js';

export const recruiterApi = {
  getApplications: async (params = {}) => {
    const res = await api.get('/v1/recruiter/applications', { params });
    return res.data;
  },

  getApplicationDetail: async (applicationId) => {
    const res = await api.get(`/v1/recruiter/applications/${applicationId}`);
    return res.data;
  },

  advanceStage: async (applicationId, nextStage) => {
    const res = await api.post(`/v1/recruiter/applications/${applicationId}/advance`, { nextStage });
    return res.data;
  },

  createShortlist: async (payload) => {
    const res = await api.post('/v1/recruiter/shortlists', payload);
    return res.data;
  },

  createCampusInvite: async (payload) => {
    const res = await api.post('/v1/recruiter/campus-invites', payload);
    return res.data;
  },

  validateCampusInvite: async (token) => {
    const res = await api.get(`/v1/recruiter/campus-invites/${token}`);
    return res.data;
  },
};

export default recruiterApi;
