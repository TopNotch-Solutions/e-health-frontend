import { useCallback, useEffect, useRef, useState } from 'react';
import { getDepartmentQueue } from '../../../api/queue';
import { getSocket, requestDoctorQueueRefresh } from '../../../api/socket';
import { getStoredUser } from '../../../api/authSession';
import { filterActiveQueueEntries } from '../../nurse/nurseQueueUtils';
import { mapDoctorQueueEntry } from '../doctorQueueUtils';

const DOCTOR_DEPT = 'doctor';

export function useDoctorQueue({ onQueueSynced } = {}) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const onSyncedRef = useRef(onQueueSynced);
  onSyncedRef.current = onQueueSynced;

  const applyEntries = useCallback((entries) => {
    const mapped = filterActiveQueueEntries(entries).map(mapDoctorQueueEntry);
    setQueue(mapped);
    onSyncedRef.current?.(mapped);
    return mapped;
  }, []);

  const loadQueueHttp = useCallback(async () => {
    setError('');
    try {
      const entries = await getDepartmentQueue(DOCTOR_DEPT);
      return applyEntries(entries);
    } catch (err) {
      setError(err.message || 'Failed to load patient queue');
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
      return () => {
        cancelled = true;
      };
    }

    const handleRefresh = ({ department, entries }) => {
      if (department !== DOCTOR_DEPT) return;
      applyEntries(entries);
      setLoading(false);
    };

    const handlePatientMoved = (payload) => {
      const { entryId, status, department } = payload || {};
      if (department && department !== DOCTOR_DEPT) return;
      if (status === 'completed' || status === 'skipped') {
        setQueue((prev) => prev.filter((p) => p.entryId !== entryId));
        return;
      }
      requestDoctorQueueRefresh();
    };

    const handleLiveEvent = () => requestDoctorQueueRefresh();

    const onConnect = () => {
      setLive(true);
      requestDoctorQueueRefresh();
    };
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
  }, [applyEntries, loadQueueHttp]);

  const refresh = useCallback(async () => {
    const mapped = await loadQueueHttp();
    if (getSocket()?.connected) {
      requestDoctorQueueRefresh();
    }
    return mapped;
  }, [loadQueueHttp]);

  return { queue, loading, error, live, refresh };
}

export function pickAutoResumeEntry(mapped, userId) {
  if (!userId) return null;
  return mapped.find((p) => p.status === 'in_progress' && p.assignedToId === userId);
}

export function useDoctorSession() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Doctor';
  const displayName = label.match(/^dr\.?\s/i) ? label : `Dr. ${label}`;
  const initials =
    displayName
      .replace(/^Dr\.?\s*/i, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'DR';
  return { user, doctorLabel: displayName, initials, userId: user?.id ?? null };
}
