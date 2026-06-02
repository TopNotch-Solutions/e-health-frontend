import { useCallback, useEffect, useRef, useState } from 'react';
import { getDepartmentQueue } from '../../../api/queue';
import { getSocket, requestDepartmentQueueRefresh } from '../../../api/socket';
import { getStoredUser } from '../../../api/authSession';
import { filterActiveQueueEntries } from '../../nurse/nurseQueueUtils';
import { mapDoctorQueueEntry } from '../../doctor/doctorQueueUtils';

const DOCTOR_DEPT = 'emergency_unit_doctor';

export function useEmergencyUnitDoctorQueue({ onQueueSynced } = {}) {
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
      return applyEntries(await getDepartmentQueue(DOCTOR_DEPT));
    } catch (err) {
      setError(err.message || 'Failed to load emergency doctor queue');
      setQueue([]);
      return [];
    }
  }, [applyEntries]);

  useEffect(() => {
    let cancelled = false;
    (async () => { await loadQueueHttp(); if (!cancelled) setLoading(false); })();
    const socket = getSocket();
    if (!socket) return () => { cancelled = true; };

    const handleRefresh = ({ department, entries }) => {
      if (department !== DOCTOR_DEPT) return;
      applyEntries(entries);
      setLoading(false);
    };
    const handlePatientMoved = ({ entryId, status, department }) => {
      if (department && department !== DOCTOR_DEPT) return;
      if (status === 'completed' || status === 'skipped') {
        setQueue((prev) => prev.filter((p) => p.entryId !== entryId));
        return;
      }
      requestDepartmentQueueRefresh(DOCTOR_DEPT);
    };
    const onConnect = () => {
      setLive(true);
      socket.emit('queue:join_department', DOCTOR_DEPT);
      requestDepartmentQueueRefresh(DOCTOR_DEPT);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', () => setLive(false));
    socket.on('queue:refresh', handleRefresh);
    socket.on('queue:new_patient', () => requestDepartmentQueueRefresh(DOCTOR_DEPT));
    socket.on('queue:patient_moved', handlePatientMoved);
    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('queue:refresh', handleRefresh);
      socket.off('queue:patient_moved', handlePatientMoved);
    };
  }, [applyEntries, loadQueueHttp]);

  const refresh = useCallback(async () => {
    const mapped = await loadQueueHttp();
    if (getSocket()?.connected) requestDepartmentQueueRefresh(DOCTOR_DEPT);
    return mapped;
  }, [loadQueueHttp]);

  return { queue, setQueue, loading, error, live, refresh };
}

export function pickAutoResumeEntry(mapped, userId) {
  if (!userId) return null;
  return mapped.find((p) => p.status === 'in_progress' && p.assignedToId === userId);
}

export function useEmergencyUnitDoctorSession() {
  const user = getStoredUser();
  const label = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Emergency Doctor';
  const displayName = label.match(/^dr\.?\s/i) ? label : `Dr. ${label}`;
  const initials = displayName.replace(/^Dr\.?\s*/i, '').split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'ED';
  return { user, doctorLabel: displayName, initials, userId: user?.id ?? null };
}
