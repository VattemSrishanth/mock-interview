import peerMockApi from '../api/peerMock.js';

/**
 * PeerSignalingService handles WebRTC signaling coordination,
 * room synchronization, and collaborative state polling for 1-on-1 peer mock rooms.
 */
export class PeerSignalingService {
  constructor() {
    this.roomCode = null;
    this.userId = null;
    this.userName = null;
    this.pollInterval = null;
    this.processedSignalIds = new Set();
    this.onSignal = null;
    this.onPeerStateChange = null;
  }

  /**
   * Initializes the signaling channel for a given room.
   */
  initialize({ roomCode, userId, userName, onSignal, onPeerStateChange }) {
    this.roomCode = (roomCode || '').toUpperCase().trim();
    this.userId = String(userId || 'guest-' + Date.now());
    this.userName = userName || 'Candidate';
    this.onSignal = onSignal;
    this.onPeerStateChange = onPeerStateChange;
    this.processedSignalIds.clear();

    return this;
  }

  /**
   * Starts polling for room updates and incoming WebRTC signals.
   */
  startPolling(intervalMs = 2500) {
    this.stopPolling();
    this.pollInterval = setInterval(async () => {
      try {
        if (!this.roomCode) return;
        
        // 1. Fetch Room State
        const room = await peerMockApi.getRoom(this.roomCode);
        if (this.onPeerStateChange) {
          this.onPeerStateChange(room);
        }

        // 2. Poll Signaling Queue
        const signals = await peerMockApi.pollSignals(this.roomCode, this.userId);
        if (Array.isArray(signals)) {
          for (const sig of signals) {
            const sigKey = `${sig.timestamp}_${sig.signalType}_${sig.senderId}`;
            if (!this.processedSignalIds.has(sigKey) && sig.senderId !== this.userId) {
              this.processedSignalIds.add(sigKey);
              if (this.onSignal) {
                this.onSignal(sig);
              }
            }
          }
        }
      } catch (err) {
        // Silent failover during background poll
      }
    }, intervalMs);
  }

  /**
   * Stops signaling poll loop.
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Sends an Offer, Answer, or ICE candidate signal.
   */
  async sendSignal(signalType, payload, targetId = 'ALL') {
    if (!this.roomCode) return null;
    const body = {
      signalType,
      senderId: this.userId,
      senderName: this.userName,
      targetId,
      payload,
      timestamp: Date.now(),
    };
    try {
      return await peerMockApi.sendSignal(this.roomCode, body);
    } catch (e) {
      return null;
    }
  }

  /**
   * Syncs collaborative code snapshot with peer.
   */
  async syncCode(code) {
    if (!this.roomCode) return;
    try {
      await peerMockApi.updateCode(this.roomCode, code);
      await this.sendSignal('SYNC_CODE', { code });
    } catch (e) {
      // Ignored
    }
  }

  /**
   * Cleans up listeners and resources.
   */
  destroy() {
    this.stopPolling();
    this.roomCode = null;
    this.processedSignalIds.clear();
  }
}

/**
 * Calculates mutual peer interview rubric summary score.
 */
export function calculateMutualPeerScore(rubric) {
  if (!rubric) return 0;
  const p = Number(rubric.problemSolvingScore) || 0;
  const t = Number(rubric.technicalAccuracyScore) || 0;
  const c = Number(rubric.communicationScore) || 0;
  const q = Number(rubric.codeQualityScore) || 0;
  const avg = (p + t + c + q) / 4;
  return Math.round(avg * 10) / 10;
}

export const peerSignalingService = new PeerSignalingService();
export default peerSignalingService;
