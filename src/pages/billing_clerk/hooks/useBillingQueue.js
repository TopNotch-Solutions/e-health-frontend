import { useCallback, useEffect, useState } from 'react';
import { getBillingQueue } from '../../../api/billing';
import { getSocket } from '../../../api/socket';

const POLL_MS = 8000;

export function useBillingQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const refresh = useCallback(async () => {
    setError('');
    try {
      const rows = await getBillingQueue();
      setQueue(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err.message || 'Failed to load billing queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onConnect = () => {
      setLive(true);
      refresh();
    };
    const onDisconnect = () => setLive(false);
    const onCharge = () => refresh();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('billing:new_charge', onCharge);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('billing:new_charge', onCharge);
    };
  }, [refresh]);

  return { queue, loading, error, live, refresh };
}
