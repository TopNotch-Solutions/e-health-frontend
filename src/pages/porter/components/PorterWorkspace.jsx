import { EQUIPMENT_MODES } from '../../../constants/admitTransportChecklist';
import { markTransportDelivered, markTransportPickedUp } from '../../../api/transport';
import { nurse as c } from '../../nurse/styles/nurseClasses';

function equipmentLabel(value) {
  return EQUIPMENT_MODES.find((m) => m.value === value)?.label || value || '—';
}

function priorityLabel(p) {
  if (p === 'emergency') return 'Emergency';
  if (p === 'urgent') return 'Urgent';
  return 'Normal';
}

export default function PorterWorkspace({
  transport,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onRefreshQueue,
  onRefreshDetail,
  onDone,
}) {
  const checklist = Array.isArray(transport?.equipment_checklist) ? transport.equipment_checklist : [];
  const critical = transport?.critical_notes?.trim() || '';

  async function handlePickedUp() {
    if (!transport?.id) return;
    setActionLoading(true);
    onActionError('');
    try {
      await markTransportPickedUp(transport.id);
      onToast('Marked as picked up');
      await onRefreshQueue();
      if (onRefreshDetail) await onRefreshDetail();
    } catch (err) {
      onActionError(err.message || 'Could not mark picked up');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelivered() {
    if (!transport?.id) return;
    setActionLoading(true);
    onActionError('');
    try {
      await markTransportDelivered(transport.id);
      onToast('Marked as delivered');
      await onRefreshQueue();
      onDone();
    } catch (err) {
      onActionError(err.message || 'Could not mark delivered');
    } finally {
      setActionLoading(false);
    }
  }

  const pending = transport?.status === 'pending';
  const inTransit = transport?.status === 'in_transit';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <section className={c.sectionPanel} aria-labelledby="porter-route-heading">
        <h3 id="porter-route-heading" className={c.sectionTitle}>
          Route & mode
        </h3>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">From</dt>
            <dd className="font-medium text-slate-900">{transport?.from_location || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">To</dt>
            <dd className="font-medium text-slate-900">{transport?.to_location || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Priority</dt>
            <dd className="font-medium text-slate-900">{priorityLabel(transport?.priority)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Equipment mode</dt>
            <dd className="font-medium text-slate-900">{equipmentLabel(transport?.equipment_required)}</dd>
          </div>
        </dl>
        {transport?.equipment_notes ? (
          <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span className="font-semibold">Equipment notes: </span>
            {transport.equipment_notes}
          </p>
        ) : null}
      </section>

      <section className={c.sectionPanel} aria-labelledby="porter-clinical-heading">
        <h3 id="porter-clinical-heading" className={c.sectionTitle}>
          Doctor handover
        </h3>
        {critical ? (
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Critical notes</p>
            <p className="mt-1 whitespace-pre-wrap">{critical}</p>
          </div>
        ) : (
          <p className={`${c.hint} mt-1`}>No critical notes from the doctor.</p>
        )}

        <h4 className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-600">
          Equipment checklist (from doctor)
        </h4>
        {checklist.length === 0 ? (
          <p className={`${c.hint} mt-1`}>No checklist items were flagged at admission.</p>
        ) : (
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-800">
            {checklist.map((item) => (
              <li key={item.id}>{item.label || item.id}</li>
            ))}
          </ul>
        )}
      </section>

      <section className={c.sectionPanel} aria-labelledby="porter-actions-heading">
        <h3 id="porter-actions-heading" className={c.sectionTitle}>
          Transport status
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          {pending
            ? 'Confirm when you have collected the patient from the pick-up point.'
            : null}
          {inTransit
            ? 'Confirm when the patient has been handed over at the destination.'
            : null}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {pending ? (
            <button
              type="button"
              className={`${c.btnAction} bg-slate-800 text-white hover:bg-slate-900`}
              disabled={actionLoading}
              onClick={handlePickedUp}
            >
              Mark as picked up
            </button>
          ) : null}
          {inTransit ? (
            <button
              type="button"
              className={`${c.btnAction} ${c.btnComplete}`}
              disabled={actionLoading}
              onClick={handleDelivered}
            >
              Mark as delivered
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
