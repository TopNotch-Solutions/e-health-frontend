import { useCallback, useEffect, useState } from 'react';
import { getHospitalOutpatientQueue } from '../../../api/hospitalOutpatient';
import { getSocket } from '../../../api/socket';
import { getStoredUser } from '../../../api/authSession';
import { departmentLabel } from '../../../constants/hospitalOutpatientDepartments';
const ROLE_DEPARTMENT = {
  pediatric_outpatient_nurse: 'pediatric_outpatient',
  ent_nurse: 'ent_outpatient',
  hospital_emergency_nurse: 'hospital_emergency_unit',
  eye_nurse: 'eye_outpatient',
  orthopedic_outpatient_nurse: 'orthopedic_outpatient',
  adult_outpatient_nurse: 'adult_outpatient',
  physiotherapy_nurse: 'physiotherapy_rehabilitation',
  big_room_specialist_nurse: 'big_room_specialist',
  urology_nurse: 'urology_outpatient',
  mental_health_nurse: 'mental_health_outpatient',
};

export function useHospitalOutpatientSession() {
  const user = getStoredUser();
  const roleName = user?.role?.name || user?.role;
  const department = ROLE_DEPARTMENT[roleName] || null;
  const label = departmentLabel(department) || 'Hospital Outpatient';
  const operatorLabel =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || label;
  const initials =
    operatorLabel
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'HO';

  return { user, department, label, operatorLabel, initials, userId: user?.id };
}

function mapRow(entry) {
  const p = entry?.visit?.patient;
  const name = p
    ? [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Patient'
    : 'Patient';
  return {
    id: entry.id,
    visitId: entry.visit_id,
    patientName: name,
    patientNumber: p?.patient_number ?? '',
    status: entry.status,
    assignedToId: entry.assigned_to ?? null,
    priority: entry.priority,
    notes: entry.notes,
    raw: entry,
  };
}

export function useHospitalOutpatientQueue(department) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    if (!department) return [];
    setError('');
    try {
      const rows = await getHospitalOutpatientQueue();
      setQueue((Array.isArray(rows) ? rows : []).map(mapRow));
      return rows;
    } catch (err) {
      setError(err.message || 'Failed to load queue');
      setQueue([]);
      return [];
    }
  }, [department]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();

    const socket = getSocket();
    if (!socket || !department) {
      return () => { cancelled = true; };
    }

    const bump = () => load().finally(() => setLoading(false));
    const onConnect = () => { setLive(true); bump(); };
    const onDisconnect = () => setLive(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('queue:refresh', (payload) => {
      if (payload?.department === department) bump();
    });
    socket.on('hospital:inbound_patient', (payload) => {
      if (payload?.destinationDepartment === department) bump();
    });

    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue:refresh');
      socket.off('hospital:inbound_patient');
    };
  }, [department, load]);

  return { queue, loading, error, live, refresh: load };
}