import { useCallback, useEffect, useRef, useState } from 'react';
import { getSonarQueue } from '../../../api/sonar';
import { getSocket } from '../../../api/socket';
import { sortQueueEmergencyFirst } from '../../../utils/queueDisplay';

const ACTIVE_STATUSES = new Set(['pending', 'in_progress', 'awaiting_report']);

function mapSonarRow(req) {
  const p = req?.visit?.patient;
  const name = p
    ? [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient'
    : 'Patient';
  return {
    id: req.id,
    visitId: req.visit_id,
    status: req.status,
    scanType: req.scan_type,
    isEmergency: Boolean(req.is_emergency),
    patientName: name,
    patientNumber: p?.patient_number ?? '',
    requestedBy: req.requestedBy,
    prepInstructions: req.prep_instructions,
    createdAt: req.created_at,
    raw: req,
  };
}

export function useSonarQueue({ onQueueSynced } = {}) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const onSyncedRef = useRef(onQueueSynced);
  onSyncedRef.current = onQueueSynced;

  const applyRows = useCallback((rows) => {
    const list = (Array.isArray(rows) ? rows : [])
      .filter((r) => ACTIVE_STATUSES.has(r.status))
      .map(mapSonarRow);
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
      const rows = await getSonarQueue();
      return applyRows(rows);
    } catch (err) {
      setError(err.message || 'Failed to load sonar queue');
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
      if (!payload?.department || payload.department === 'sonar') bumpQueue();
    });
    socket.on('sonar:queue_update', bumpQueue);
    socket.on('notification:sonar_result_ready', bumpQueue);

    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue:new_patient', bumpQueue);
      socket.off('queue:refresh', bumpQueue);
      socket.off('sonar:queue_update', bumpQueue);
      socket.off('notification:sonar_result_ready', bumpQueue);
    };
  }, [loadQueueHttp]);

  const refresh = useCallback(async () => {
    await loadQueueHttp();
  }, [loadQueueHttp]);

  return { queue, loading, error, live, refresh };
}
