import { useCallback, useEffect, useState } from 'react';
import { getWardStaffQueue } from '../../../api/ward';
import { getSocket } from '../../../api/socket';

function mapRow(row) {
  const p = row?.patient || {};
  const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient';
  const ward = row?.ward || {};
  const bed = row?.bed || {};
  return {
    id: row.id,
    status: row.status,
    patientName: name,
    patientNumber: p.patient_number ?? '',
    isEmergency: Boolean(p.is_emergency),
    wardName: ward.name || '',
    wardNumber: ward.ward_number || '',
    roomNumber: bed.room_number || '',
    bedNumber: bed.bed_number || '',
    transportPriority: row.transport?.priority || 'normal',
    requestedAt: row.requested_at,
    raw: row,
  };
}

export function useWardStaffQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const loadQueueHttp = useCallback(async () => {
    setError('');
    try {
      const rows = await getWardStaffQueue();
      setQueue((Array.isArray(rows) ? rows : []).map(mapRow));
      return rows;
    } catch (err) {
      setError(err.message || 'Failed to load arrival queue');
      setQueue([]);
      return [];
    }
  }, []);

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

    const bump = () => {
      loadQueueHttp().finally(() => setLoading(false));
    };

    const onConnect = () => {
      setLive(true);
      bump();
    };
    const onDisconnect = () => setLive(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ward:new_admission', bump);
    socket.on('ward:admission_refresh', bump);
    socket.on('ward:bed_status', bump);

    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('ward:new_admission', bump);
      socket.off('ward:admission_refresh', bump);
      socket.off('ward:bed_status', bump);
    };
  }, [loadQueueHttp]);

  const refresh = useCallback(async () => {
    await loadQueueHttp();
  }, [loadQueueHttp]);

  return { queue, loading, error, live, refresh };
}
