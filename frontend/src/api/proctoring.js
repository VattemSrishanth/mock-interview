import api from './client.js';

export const proctoringApi = {
  sendTelemetry: async (telemetry) => {
    const res = await api.post('/v1/proctoring/telemetry', telemetry);
    return res.data;
  },

  getAuditReport: async (sessionToken) => {
    const res = await api.get(`/v1/proctoring/audit-report/${sessionToken}`);
    return res.data;
  },
};

export default proctoringApi;
