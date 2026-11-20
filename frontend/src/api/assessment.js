import api from './client';

/**
 * API service for Multi-Round Assessments, Adaptive Hint Ladder,
 * Simulated Corporate Offers, and Daily Practice Workouts.
 */
export const assessmentApi = {
  startPipeline: async (candidateName = 'Candidate', targetCompany = 'Google', roleTitle = 'Software Development Engineer') => {
    const res = await api.post('/assessment/pipeline/start', { candidateName, targetCompany, roleTitle });
    return res.data;
  },

  getPipeline: async (pipelineId) => {
    const res = await api.get(`/assessment/pipeline/${pipelineId}`);
    return res.data;
  },

  submitRound: async (pipelineId, result) => {
    const res = await api.post(`/assessment/pipeline/${pipelineId}/submit-round`, result);
    return res.data;
  },

  requestHint: async (requestData) => {
    const res = await api.post('/assessment/hints/request', requestData);
    return res.data;
  },

  generateOffer: async (pipelineId) => {
    const res = await api.get(`/assessment/pipeline/${pipelineId}/offer`);
    return res.data;
  },

  getDailyWorkout: async () => {
    const res = await api.get('/assessment/workout/today');
    return res.data;
  },

  validateWorkout: async (selectedOption) => {
    const res = await api.post('/assessment/workout/validate', { selectedOption });
    return res.data;
  },
};

export default assessmentApi;
