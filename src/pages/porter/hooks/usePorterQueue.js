import { useCallback, useEffect, useState } from 'react';
import { getTransportQueue } from '../../../api/transport';
import { getSocket } from '../../../api/socket';

const QUEUE_REFRESH_DEBOUNCE_MS = 600;

function mapRow(req) {
  const p = req?.visit?.patient;
  const externalName = req?.external_patient_name?.trim();
  const name = p
    ? [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient'
    : externalName || 'Patient';
  return {
    id: req.id,
    status: req.status,
    priority: req.priority,
    transportScope: req.transport_scope || 'internal',
    fromLocation: req.from_location,
    toLocation: req.to_location,
    originFacilityName: req.origin_facility_name || null,
    equipmentRequired: req.equipment_required,
    equipmentNotes: req.equipment_notes,
    patientName: name,
    patientNumber: p?.patient_number ?? '',
    requestedAt: req.requested_at,
    assignedPorterId: req.assigned_porter,
    raw: req,
  };
}

export function usePorterQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const loadQueueHttp = useCallback(async () => {
    setError('');
    try {
      const rows = await getTransportQueue();
      setQueue((Array.isArray(rows) ? rows : []).map(mapRow));
      return rows;
    } catch (err) {
      const message = err.status === 429
        ? 'Too many requests. The queue will refresh automatically in a moment.'
        : (err.message || 'Failed to load transport queue');
      setError(message);
      setQueue([]);
      return [];
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let debounceTimer = null;
    const hadConnectedRef = { current: false };

    (async () => {
      await loadQueueHttp();
      if (!cancelled) setLoading(false);
    })();

    const socket = getSocket();
    if (!socket) {
      setError((prev) => prev || 'Sign in required for live queue updates.');
      return () => {
        cancelled = true;
        if (debounceTimer) clearTimeout(debounceTimer);
      };
    }

    const bump = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadQueueHttp().finally(() => setLoading(false));
      }, QUEUE_REFRESH_DEBOUNCE_MS);
    };

    const onConnect = () => {
      setLive(true);
      if (hadConnectedRef.current) bump();
      hadConnectedRef.current = true;
    };
    const onDisconnect = () => setLive(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('transport:new_request', bump);
    socket.on('transport:updated', bump);
    socket.on('transport:completed', bump);
    socket.on('transport:queue_refresh', bump);

    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('transport:new_request', bump);
      socket.off('transport:updated', bump);
      socket.off('transport:completed', bump);
      socket.off('transport:queue_refresh', bump);
    };
  }, [loadQueueHttp]);

  const refresh = useCallback(async () => {
    await loadQueueHttp();
  }, [loadQueueHttp]);

  return { queue, loading, error, live, refresh };
}
