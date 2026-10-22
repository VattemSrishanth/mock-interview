import axios from 'axios';

// Public API client - no auth token needed
const publicApi = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const shareApi = {
  // Authenticated: toggle sharing
  toggleShare: async (interviewId) => {
    const api = (await import('./client.js')).default;
    const response = await api.post(`/interviews/${interviewId}/share`);
    return response.data;
  },

  // Authenticated: get share status
  getShareStatus: async (interviewId) => {
    const api = (await import('./client.js')).default;
    const response = await api.get(`/interviews/${interviewId}/share`);
    return response.data;
  },

  // Public: fetch shared report (no auth)
  getPublicReport: async (shareToken) => {
    const response = await publicApi.get(`/interviews/public/${shareToken}`);
    return response.data;
  },
};

