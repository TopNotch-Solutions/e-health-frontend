import { useCallback, useEffect, useState } from 'react';
import { getSocket } from '../../api/socket';

const DEFAULT_POLL_MS = 5000;

export function useSupervisorMetrics(fetchMetrics, socketEvent) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const loadMetrics = useCallback(async () => {
    setError('');
    try {
      const data = await fetchMetrics();
      if (data && typeof data === 'object') setMetrics(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load supervisor metrics');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  useEffect(() => {
    loadMetrics();
    const id = setInterval(loadMetrics, DEFAULT_POLL_MS);
    return () => clearInterval(id);
  }, [loadMetrics]);

  useEffect(() => {
    if (!socketEvent) return undefined;
    const socket = getSocket();
    if (!socket) return undefined;

    const onConnect = () => {
      setLive(true);
      loadMetrics();
    };
    const onDisconnect = () => setLive(false);
    const onEvent = () => loadMetrics();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(socketEvent, onEvent);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(socketEvent, onEvent);
    };
  }, [loadMetrics, socketEvent]);

  return { metrics, loading, error, live, refresh: loadMetrics };
}
