import { useCallback, useEffect, useRef, useState } from 'react';
import { getDepartmentQueue } from '../../../api/queue';
import { getSocket, requestDepartmentQueueRefresh } from '../../../api/socket';
import { getStoredUser } from '../../../api/authSession';
import { filterActiveQueueEntries, mapQueueEntry } from '../../nurse/nurseQueueUtils';

export function useMaternityQueue(department, { onQueueSynced } = {}) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const onSyncedRef = useRef(onQueueSynced);
  onSyncedRef.current = onQueueSynced;

  const applyEntries = useCallback((entries) => {
    const mapped = filterActiveQueueEntries(entries).map(mapQueueEntry);
    setQueue(mapped);
    onSyncedRef.current?.(mapped);
    return mapped;
  }, []);

  const loadQueueHttp = useCallback(async () => {
    setError('');
    try {
      const entries = await getDepartmentQueue(department);
      return applyEntries(entries);
    } catch (err) {
      setError(err.message || 'Failed to load queue');
      setQueue([]);
      return [];
    }
  }, [department, applyEntries]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadQueueHttp();
      if (!cancelled) setLoading(false);
    })();

    const socket = getSocket();
    if (!socket) {
      setError((prev) => prev || 'Sign in required for live queue updates.');
      return () => { cancelled = true; };
    }

    const handleRefresh = ({ department: dept, entries }) => {
      if (dept !== department) return;
      applyEntries(entries);
      setLoading(false);
    };

    const handlePatientMoved = (payload) => {
      const { entryId, status, department: dept } = payload || {};
      if (dept && dept !== department) return;
      if (status === 'completed' || status === 'skipped') {
        setQueue((prev) => prev.filter((p) => p.entryId !== entryId));
        return;
      }
      requestDepartmentQueueRefresh(department);
    };

    const handleLiveEvent = () => requestDepartmentQueueRefresh(department);
    const onConnect = () => { setLive(true); requestDepartmentQueueRefresh(department); };
    const onDisconnect = () => setLive(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('queue:refresh', handleRefresh);
    socket.on('queue:new_patient', handleLiveEvent);
    socket.on('queue:patient_moved', handlePatientMoved);
    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue:refresh', handleRefresh);
      socket.off('queue:new_patient', handleLiveEvent);
      socket.off('queue:patient_moved', handlePatientMoved);
    };
  }, [department, loadQueueHttp, applyEntries]);

  const refresh = useCallback(async () => loadQueueHttp(), [loadQueueHttp]);

  return { queue, setQueue, loading, error, live, refresh };
}

export function useMaternitySession() {
  const user = getStoredUser();
  const nurseLabel = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : 'Staff';
  const initials = nurseLabel
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return { nurseLabel, initials, userId: user?.id };
}

export function pickAutoResumeEntry(queue, userId) {
  return queue.find(
    (p) => p.status === 'in_progress' && p.assignedToId === userId
  ) || null;
}
