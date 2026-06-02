import { useCallback, useEffect, useRef, useState } from 'react';
import { getDepartmentQueue } from '../../../api/queue';
import { getSocket, requestDepartmentQueueRefresh } from '../../../api/socket';
import { getStoredUser } from '../../../api/authSession';
import { filterActiveQueueEntries, mapQueueEntry } from '../../nurse/nurseQueueUtils';

const DEPT = 'emergency_unit';

export function useEmergencyUnitNurseQueue({ onQueueSynced } = {}) {
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
      const entries = await getDepartmentQueue(DEPT);
      return applyEntries(entries);
    } catch (err) {
      setError(err.message || 'Failed to load emergency queue');
      setQueue([]);
      return [];
    }
  }, [applyEntries]);

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

    const handleRefresh = ({ department, entries }) => {
      if (department !== DEPT) return;
      applyEntries(entries);
      setLoading(false);
    };

    const handlePatientMoved = (payload) => {
      const { entryId, status, department } = payload || {};
      if (department && department !== DEPT) return;
      if (status === 'completed' || status === 'skipped') {
        setQueue((prev) => prev.filter((p) => p.entryId !== entryId));
        return;
      }
      requestDepartmentQueueRefresh(DEPT);
    };

    const handleLiveEvent = () => requestDepartmentQueueRefresh(DEPT);
    const onConnect = () => {
      setLive(true);
      socket.emit('queue:join_department', DEPT);
      requestDepartmentQueueRefresh(DEPT);
    };
    const onDisconnect = () => setLive(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('queue:refresh', handleRefresh);
    socket.on('queue:new_patient', handleLiveEvent);
    socket.on('queue:patient_moved', handlePatientMoved);
    socket.on('emergency:override', handleLiveEvent);
    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue:refresh', handleRefresh);
      socket.off('queue:new_patient', handleLiveEvent);
      socket.off('queue:patient_moved', handlePatientMoved);
      socket.off('emergency:override', handleLiveEvent);
    };
  }, [applyEntries, loadQueueHttp]);

  const refresh = useCallback(async () => {
    const mapped = await loadQueueHttp();
    if (getSocket()?.connected) requestDepartmentQueueRefresh(DEPT);
    return mapped;
  }, [loadQueueHttp]);

  return { queue, setQueue, loading, error, live, refresh };
}

export function pickAutoResumeEntry(mapped, userId) {
  if (!userId) return null;
  return mapped.find((p) => p.status === 'in_progress' && p.assignedToId === userId);
}

export function useEmergencyUnitNurseSession() {
  const user = getStoredUser();
  const nurseLabel =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Emergency Unit Nurse';
  const initials =
    nurseLabel.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('')
    || 'EU';
  return { user, nurseLabel, initials, userId: user?.id ?? null };
}
