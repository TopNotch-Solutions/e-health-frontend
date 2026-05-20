import { useCallback, useEffect, useRef, useState } from 'react';
import { getPharmacyQueue } from '../../../api/pharmacy';
import { getSocket } from '../../../api/socket';
import { filterActivePrescriptionQueue } from '../../nurse/nurseQueueUtils';

/**
 * Loads prescription-based pharmacy queue and listens for live pharmacy notifications.
 */
export function usePharmacistQueue({ onQueueSynced } = {}) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const onSyncedRef = useRef(onQueueSynced);
  onSyncedRef.current = onQueueSynced;

  const applyRows = useCallback((rows) => {
    const list = filterActivePrescriptionQueue(Array.isArray(rows) ? rows : []);
    setQueue(list);
    onSyncedRef.current?.(list);
    return list;
  }, []);

  const loadQueueHttp = useCallback(async () => {
    setError('');
    try {
      const rows = await getPharmacyQueue();
      return applyRows(rows);
    } catch (err) {
      setError(err.message || 'Failed to load pharmacy queue');
      setQueue([]);
      return [];
    }
  }, [applyRows]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadQueueHttp();
      if (!cancelled) setLoading(false);
    })();

    const socket = getSocket();
    if (!socket) {
      setError((prev) => prev || 'Sign in required for live queue updates.');
      return () => {
        cancelled = true;
      };
    }

    const bumpQueue = () => {
      loadQueueHttp().finally(() => setLoading(false));
    };

    const onConnect = () => {
      setLive(true);
      bumpQueue();
    };
    const onDisconnect = () => setLive(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('queue:new_patient', bumpQueue);
    socket.on('notification:stock_alert', bumpQueue);

    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue:new_patient', bumpQueue);
      socket.off('notification:stock_alert', bumpQueue);
    };
  }, [loadQueueHttp]);

  const refresh = useCallback(async () => {
    await loadQueueHttp();
  }, [loadQueueHttp]);

  return { queue, loading, error, live, refresh };
}
