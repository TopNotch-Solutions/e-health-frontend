import { useCallback, useEffect, useRef, useState } from 'react';
import { getDepartmentQueue } from '../../../api/queue';
import { getSocket, requestDepartmentQueueRefresh } from '../../../api/socket';
import { getStoredUser } from '../../../api/authSession';
import { filterActiveQueueEntries, mapQueueEntry } from '../../nurse/nurseQueueUtils';

const DEPT = 'booking_room';

export function useBookingRoomQueue({ onQueueSynced } = {}) {
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
      return applyEntries(await getDepartmentQueue(DEPT));
    } catch (err) {
      setError(err.message || 'Failed to load booking queue');
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
    const handleTransferUpdated = () => requestDepartmentQueueRefresh(DEPT);
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
    socket.on('transfer:updated', handleTransferUpdated);
    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue:refresh', handleRefresh);
      socket.off('queue:new_patient', handleLiveEvent);
      socket.off('queue:patient_moved', handlePatientMoved);
      socket.off('transfer:updated', handleTransferUpdated);
    };
  }, [applyEntries, loadQueueHttp]);

  const refresh = useCallback(async () => {
    const mapped = await loadQueueHttp();
    if (getSocket()?.connected) requestDepartmentQueueRefresh(DEPT);
    return mapped;
  }, [loadQueueHttp]);

  return { queue, setQueue, loading, error, live, refresh };
}

export function pickBookingRoomActiveEntries(mapped) {
  return mapped.filter((p) => p.status === 'in_progress');
}

/** @deprecated use pickBookingRoomActiveEntries — booking room is shared across operators */
export function pickMyActiveEntries(mapped, userId) {
  return pickBookingRoomActiveEntries(mapped);
}

export function pickAutoResumeEntry(mapped) {
  const active = pickBookingRoomActiveEntries(mapped);
  return active[0] || null;
}

export function useBookingRoomSession() {
  const user = getStoredUser();
  const operatorLabel =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Booking Room Operator';
  const initials =
    operatorLabel.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('')
    || 'BR';
  return { operatorLabel, initials, userId: user?.id ?? null };
}
