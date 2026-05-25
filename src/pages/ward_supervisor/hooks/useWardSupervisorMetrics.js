import { useCallback, useEffect, useState } from 'react';
import { getWardSupervisorMetrics } from '../../../api/ward';
import { getSocket } from '../../../api/socket';
import { buildInitialMetrics } from '../data/wardMetricsUtils';

const DEFAULT_POLL_MS = 5000;

/**
 * Loads ward supervisor metrics from the backend and refreshes on an interval
 * and on ward-related socket events.
 */
export function useWardSupervisorMetrics({ pollMs = DEFAULT_POLL_MS } = {}) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const loadMetrics = useCallback(async () => {
    setError('');
    try {
      const data = await getWardSupervisorMetrics();
      if (data && typeof data === 'object') {
        setMetrics(data);
      }
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load supervisor metrics');
      setMetrics((prev) => prev ?? buildInitialMetrics());
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    const id = setInterval(loadMetrics, pollMs);
    return () => clearInterval(id);
  }, [loadMetrics, pollMs]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onConnect = () => {
      setLive(true);
      loadMetrics();
    };
    const onDisconnect = () => setLive(false);
    const onWardEvent = () => loadMetrics();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ward:bed_status', onWardEvent);
    socket.on('ward:new_admission', onWardEvent);
    socket.on('ward:admission_refresh', onWardEvent);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('ward:bed_status', onWardEvent);
      socket.off('ward:new_admission', onWardEvent);
      socket.off('ward:admission_refresh', onWardEvent);
    };
  }, [loadMetrics]);

  return { metrics, loading, error, live, refresh: loadMetrics };
}
