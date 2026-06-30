import { useCallback, useEffect, useMemo, useState } from 'react';
import { getIcuAdmittedPatients, getSurgicalComplexAdmittedPatients, getSpecializedInpatientAdmittedPatients, getAdultOutpatientAdmittedPatients } from '../../../api/ward';
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
    admittedAt: row.admitted_at,
    raw: row,
  };
}

const FETCH_BY_ROLE = {
  icu_ward_nurse: getIcuAdmittedPatients,
  surgical_complex_nurse: getSurgicalComplexAdmittedPatients,
  specialized_inpatient_nurse: getSpecializedInpatientAdmittedPatients,
  adult_outpatient_nurse: getAdultOutpatientAdmittedPatients,
};

export function useTypedWardDailyQueue(roleName) {
  const fetchPatients = useMemo(() => FETCH_BY_ROLE[roleName] || null, [roleName]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(Boolean(fetchPatients));
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const loadQueueHttp = useCallback(async () => {
    if (!fetchPatients) {
      setQueue([]);
      setLoading(false);
      return [];
    }
    setError('');
    try {
      const rows = await fetchPatients();
      setQueue((Array.isArray(rows) ? rows : []).map(mapRow));
      return rows;
    } catch (err) {
      setError(err.message || 'Failed to load patients');
      setQueue([]);
      return [];
    }
  }, [fetchPatients]);

  useEffect(() => {
    if (!fetchPatients) return undefined;

    let cancelled = false;
    (async () => {
      await loadQueueHttp();
      if (!cancelled) setLoading(false);
    })();

    const socket = getSocket();
    if (!socket) {
      setError((prev) => prev || 'Sign in required for live updates.');
      return () => { cancelled = true; };
    }

    const bump = () => loadQueueHttp().finally(() => setLoading(false));
    const onConnect = () => { setLive(true); bump(); };
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
  }, [fetchPatients, loadQueueHttp]);

  const refresh = useCallback(async () => {
    await loadQueueHttp();
  }, [loadQueueHttp]);

  return { queue, loading, error, live, refresh, enabled: Boolean(fetchPatients) };
}
