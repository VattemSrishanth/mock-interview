import api from './client.js';

export const peerMockApi = {
  /**
   * Creates a new peer interview room.
   */
  createRoom: async (targetRole = 'Full Stack Software Engineer', difficultyLevel = 'INTERMEDIATE') => {
    const res = await api.post('/v1/peer-rooms/create', { targetRole, difficultyLevel });
    return res.data;
  },

  /**
   * Joins an existing room with code.
   */
  joinRoom: async (roomCode, participantName = 'Peer Candidate') => {
    const res = await api.post('/v1/peer-rooms/join', { roomCode, participantName });
    return res.data;
  },

  /**
   * Fetches room state by code.
   */
  getRoom: async (roomCode) => {
    const res = await api.get(`/v1/peer-rooms/${roomCode}`);
    return res.data;
  },

  /**
   * Updates the collaborative code editor snapshot.
   */
  updateCode: async (roomCode, code) => {
    const res = await api.put(`/v1/peer-rooms/${roomCode}/code`, { code });
    return res.data;
  },

  /**
   * Submits mutual peer rubric evaluation.
   */
  submitRubric: async (roomCode, rubric) => {
    const res = await api.post(`/v1/peer-rooms/${roomCode}/rubric`, rubric);
    return res.data;
  },

  /**
   * Sends a WebRTC signaling or event payload.
   */
  sendSignal: async (roomCode, signal) => {
    const res = await api.post(`/v1/peer-rooms/${roomCode}/signal`, signal);
    return res.data;
  },

  /**
   * Polls latest signals from the room buffer.
   */
  pollSignals: async (roomCode, recipientId) => {
    const res = await api.get(`/v1/peer-rooms/${roomCode}/signals`, {
      params: { recipientId },
    });
    return res.data;
  },

  /**
   * Lists active open rooms.
   */
  listActiveRooms: async () => {
    const res = await api.get('/v1/peer-rooms/active');
    return res.data;
  },

  /**
   * Analyzes acoustic metrics via backend.
   */
  analyzeVoiceAnalytics: async (payload) => {
    const res = await api.post('/v1/voice-analytics/analyze', payload);
    return res.data;
  },
};

export default peerMockApi;
