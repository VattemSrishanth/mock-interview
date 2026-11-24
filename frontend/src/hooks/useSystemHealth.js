import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth } from '../utils/healthCheckUtils';

export function useSystemHealth(pollingInterval = 30000) {
  const [isOnline, setIsOnline] = useState(true);
  const [latency, setLatency] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState('UP');

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const result = await checkBackendHealth(5000);
    setIsOnline(result.isOnline);
    setLatency(result.latencyMs);
    setStatus(result.status);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkHealth();
    if (pollingInterval > 0) {
      const interval = setInterval(checkHealth, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [checkHealth, pollingInterval]);

  return { isOnline, isChecking, latency, status, checkHealth };
}
