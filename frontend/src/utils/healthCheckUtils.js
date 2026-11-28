import api from '../api/client.js';

/**
 * Performs a fast pre-flight ping to detect whether the cloud backend is awake.
 * @param {number} timeoutMs
 * @returns {Promise<{ isOnline: boolean, latencyMs: number, status: string, error?: string }>}
 */
export async function checkBackendHealth(timeoutMs = 6000) {
  const start = Date.now();
  try {
    const res = await api.get('/v1/health/ping', { timeout: timeoutMs });
    return {
      isOnline: res.status === 200,
      latencyMs: Date.now() - start,
      status: res.data?.status || 'UP',
    };
  } catch (err) {
    // Fallback: try root health endpoint
    try {
      const fallback = await api.get('/v1/health', { timeout: timeoutMs });
      return {
        isOnline: fallback.status === 200,
        latencyMs: Date.now() - start,
        status: fallback.data?.status || 'UP',
      };
    } catch (e) {
      return {
        isOnline: false,
        latencyMs: Date.now() - start,
        status: 'OFFLINE_OR_SLEEPING',
        error: e.message || 'Server unresponsive',
      };
    }
  }
}

export function classifyLatencyTier(latencyMs) {
  if (typeof latencyMs !== 'number' || Number.isNaN(latencyMs) || latencyMs < 0) {
    return 'UNKNOWN';
  }
  if (latencyMs < 200) return 'EXCELLENT';
  if (latencyMs < 800) return 'GOOD';
  if (latencyMs < 3000) return 'ELEVATED';
  return 'COLD_START';
}
