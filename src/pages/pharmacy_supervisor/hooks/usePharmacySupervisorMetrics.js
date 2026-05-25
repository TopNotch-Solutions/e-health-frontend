import { useCallback, useEffect, useState } from 'react';
import { getPharmacySupervisorMetrics } from '../../../api/inventory';
import { getSocket } from '../../../api/socket';

const POLL_MS = 5000;

export function usePharmacySupervisorMetrics({ pollMs = POLL_MS } = {}) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getPharmacySupervisorMetrics();
      if (data) setMetrics(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load metrics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onConnect = () => {
      setLive(true);
      load();
    };
    const onDisconnect = () => setLive(false);
    const bump = () => load();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification:stock_alert', bump);
    socket.on('pharmacy:inventory_update', bump);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification:stock_alert', bump);
      socket.off('pharmacy:inventory_update', bump);
    };
  }, [load]);

  return { metrics, loading, error, live, refresh: load };
}
