import { useCallback, useEffect, useState } from 'react';
import { getFrontOfficeSupervisorMetrics } from '../../../api/frontOffice';
import { getSocket } from '../../../api/socket';

const DEFAULT_POLL_MS = 5000;

export function useFrontOfficeSupervisorMetrics({ pollMs = DEFAULT_POLL_MS } = {}) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const loadMetrics = useCallback(async () => {
    setError('');
    try {
      const data = await getFrontOfficeSupervisorMetrics();
      if (data && typeof data === 'object') setMetrics(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load supervisor metrics');
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
    const onRegistration = () => loadMetrics();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('front_office:registration', onRegistration);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('front_office:registration', onRegistration);
    };
  }, [loadMetrics]);

  return { metrics, loading, error, live, refresh: loadMetrics };
}
