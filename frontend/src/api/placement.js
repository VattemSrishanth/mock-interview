import api from './client';

/**
 * API service for Placement Drives, Company Templates, STAR Scoring, and Resume Alignment.
 */
export const placementApi = {
  getCompanies: async (tier = null) => {
    const params = tier ? { tier } : {};
    const res = await api.get('/placement/companies', { params });
    return res.data;
  },

  getCompanyBySlug: async (slug) => {
    const res = await api.get(`/placement/companies/${slug}`);
    return res.data;
  },

  evaluateStar: async (question, answer) => {
    const res = await api.post('/placement/star-evaluate', { question, answer });
    return res.data;
  },

  alignResume: async (resumeText, targetRole, targetCompany = 'General') => {
    const res = await api.post('/placement/resume-align', { resumeText, targetRole, targetCompany });
    return res.data;
  },
};
