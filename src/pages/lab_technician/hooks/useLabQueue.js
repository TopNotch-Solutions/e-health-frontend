import { useCallback, useEffect, useRef, useState } from 'react';
import { getLabQueue } from '../../../api/lab';
import { getSocket } from '../../../api/socket';
import { sortQueueEmergencyFirst } from '../../../utils/queueDisplay';

const ACTIVE_STATUSES = new Set(['pending_sample', 'sample_collected', 'processing']);

function mapLabRow(req) {
  const p = req?.visit?.patient;
  const name = p
    ? [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient'
    : 'Patient';
  const tests = Array.isArray(req.tests) ? req.tests : [];
  return {
    id: req.id,
    visitId: req.visit_id,
    status: req.status,
    testType: req.test_type,
    testCount: tests.length,
    isEmergency: Boolean(req.is_emergency),
    patientName: name,
    patientNumber: p?.patient_number ?? '',
    requestedBy: req.requestedBy,
    createdAt: req.created_at,
    raw: req,
  };
}

export function useLabQueue({ onQueueSynced } = {}) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const onSyncedRef = useRef(onQueueSynced);
  onSyncedRef.current = onQueueSynced;

  const applyRows = useCallback((rows) => {
    const list = (Array.isArray(rows) ? rows : [])
      .filter((r) => ACTIVE_STATUSES.has(r.status))
      .map(mapLabRow);
    const sorted = sortQueueEmergencyFirst(
      list.map((r) => ({ ...r, isEmergency: r.isEmergency }))
    );
    setQueue(sorted);
    onSyncedRef.current?.(sorted);
    return sorted;
  }, []);

  const loadQueueHttp = useCallback(async () => {
    setError('');
    try {
      const rows = await getLabQueue();
      return applyRows(rows);
    } catch (err) {
      setError(err.message || 'Failed to load laboratory queue');
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
    socket.on('queue:refresh', (payload) => {
      if (!payload?.department || payload.department === 'lab') bumpQueue();
    });
    socket.on('notification:lab_result_ready', bumpQueue);

    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue:new_patient', bumpQueue);
      socket.off('queue:refresh', bumpQueue);
      socket.off('notification:lab_result_ready', bumpQueue);
    };
  }, [loadQueueHttp]);

  const refresh = useCallback(async () => {
    await loadQueueHttp();
  }, [loadQueueHttp]);

  return { queue, loading, error, live, refresh };
}
