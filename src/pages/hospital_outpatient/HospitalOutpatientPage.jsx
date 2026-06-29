import { useState } from 'react';
import QueueEntryCard from '../../components/queue/QueueEntryCard';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import { nurse as nc } from '../nurse/styles/nurseClasses';
import HospitalOutpatientTopbar from './components/HospitalOutpatientTopbar';
import HospitalOutpatientClinicalWorkspace from './components/HospitalOutpatientClinicalWorkspace';
import { hasClinicalWorkspace } from './hospitalOutpatientClinicalConfig';
import {
  useHospitalOutpatientQueue,
  useHospitalOutpatientSession,
} from './hooks/useHospitalOutpatientQueue';
import { confirmHospitalDepartmentReceipt, getQueueEntryTransfer } from '../../api/hospitalOutpatient';
import { TRANSFER_STATUS_LABELS } from '../../constants/hospitalOutpatientDepartments';

export default function HospitalOutpatientPage() {
  const { department, label, operatorLabel, initials } = useHospitalOutpatientSession();

  if (hasClinicalWorkspace(department)) {
    return <HospitalOutpatientClinicalWorkspace />;
  }
  const { queue, loading, error, live, refresh } = useHospitalOutpatientQueue(department);
  const [activeId, setActiveId] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  async function openEntry(entry) {
    setActiveId(entry.id);
    setDetailLoading(true);
    try {
      const data = await getQueueEntryTransfer(entry.id);
      setTransfer(data?.transfer || null);
    } catch {
      setTransfer(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleConfirmReceipt() {
    if (!transfer?.id) return;
    setActionLoading(true);
    try {
      await confirmHospitalDepartmentReceipt({ transfer_id: transfer.id });
      setToast('Patient receipt confirmed');
      setActiveId(null);
      setTransfer(null);
      await refresh();
    } catch (err) {
      setToast(err.message || 'Could not confirm receipt');
    } finally {
      setActionLoading(false);
    }
  }

  const activeEntry = queue.find((q) => q.id === activeId);

  return (
    <div className={c.page}>
      <HospitalOutpatientTopbar
        label={label}
        operatorLabel={operatorLabel}
        initials={initials}
        live={live}
      />
      {toast ? <p className="mx-4 mt-2 text-sm text-emerald-700" role="status">{toast}</p> : null}
      {error ? <p className="mx-4 mt-2 text-sm text-red-600" role="alert">{error}</p> : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label={`${label} queue`}>
          <h2 className={c.queueTitle}>{label} queue</h2>
          <div className={c.queueList}>
            {loading ? (
              <p className={nc.hint}>Loading…</p>
            ) : queue.length === 0 ? (
              <p className={nc.hint}>No patients waiting.</p>
            ) : (
              queue.map((row) => (
                <QueueEntryCard
                  key={row.id}
                  classes={c}
                  name={row.patientName}
                  idLabel={row.patientNumber ? `ID: ${row.patientNumber}` : undefined}
                  subtitle={row.notes || 'Clinic referral'}
                  active={row.id === activeId}
                  onClick={() => openEntry(row)}
                  openLabel="Open"
                />
              ))
            )}
          </div>
        </aside>

        <main className={c.main}>
          {!activeEntry ? (
            <div className={c.idle}>
              <p className={nc.hint}>Select a patient to confirm receipt from internal porter.</p>
            </div>
          ) : detailLoading ? (
            <p className={nc.hint}>Loading referral details…</p>
          ) : (
            <div className={`${nc.sectionPanel} m-4`}>
              <h3 className={nc.sectionTitle}>{activeEntry.patientName}</h3>
              {transfer ? (
                <>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-bold uppercase text-slate-500">Transfer status</dt>
                    <dd>{TRANSFER_STATUS_LABELS[transfer.transfer_status] || transfer.transfer_status}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase text-slate-500">Referring clinic</dt>
                    <dd>{transfer.clinicFacility?.name || '—'}</dd>
                  </div>
                  {transfer.critical_notes ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-bold uppercase text-slate-500">Clinical notes</dt>
                      <dd className="whitespace-pre-wrap">{transfer.critical_notes}</dd>
                    </div>
                  ) : null}
                </dl>
                </>
              ) : (
                <p className={`${nc.hint} mt-2`}>No linked transfer record.</p>
              )}
              {transfer?.transfer_status === 'delivered_to_department' ? (
                <button
                  type="button"
                  className={`${nc.btnAction} mt-4 bg-teal-700 text-white hover:bg-teal-800`}
                  disabled={actionLoading}
                  onClick={handleConfirmReceipt}
                >
                  Confirm patient received
                </button>
              ) : (
                <p className={`${nc.hint} mt-4`}>
                  Receipt can be confirmed once internal porter marks the patient as delivered.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
