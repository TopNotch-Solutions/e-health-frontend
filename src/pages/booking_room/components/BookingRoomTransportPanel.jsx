import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  departmentLabel,
  TRANSFER_STATUS_LABELS,
} from '../../../constants/hospitalOutpatientDepartments';

/** Read-only clinic → hospital transfer details for the booking room operator. */
export default function BookingRoomTransportPanel({ transferPlan, referralReason = '' }) {
  if (!transferPlan) {
    return (
      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Hospital transport</h3>
        <p className={`${c.hint} mt-1`}>
          No hospital destination was attached by the referring clinician. The patient cannot be sent until
          a destination department is recorded.
        </p>
      </section>
    );
  }

  const status = transferPlan.transfer_status;
  const reasonText = transferPlan.transfer_reason?.trim() || referralReason?.trim() || '';

  return (
    <section className={c.sectionPanel}>
      <h3 className={c.sectionTitle}>Hospital transport</h3>
      <p className={`${c.hint} mt-1`}>
        Any booking room operator can initiate transport or confirm departure for this patient.
        Each action is recorded on the tracked transfer.
      </p>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold uppercase text-slate-500">Destination department</dt>
          <dd className="font-medium">{departmentLabel(transferPlan.destination_department)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase text-slate-500">Status</dt>
          <dd className="font-medium">{TRANSFER_STATUS_LABELS[status] || status}</dd>
        </div>
        {reasonText ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase text-slate-500">Transfer reason (from referring clinician)</dt>
            <dd className="whitespace-pre-wrap">{reasonText}</dd>
          </div>
        ) : null}
        {transferPlan.equipment_required ? (
          <div>
            <dt className="text-xs font-bold uppercase text-slate-500">Equipment</dt>
            <dd>{transferPlan.equipment_required}</dd>
          </div>
        ) : null}
        {transferPlan.critical_notes ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase text-slate-500">Clinical / porter notes</dt>
            <dd className="whitespace-pre-wrap">{transferPlan.critical_notes}</dd>
          </div>
        ) : null}
        {transferPlan.external_porter_notes ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase text-slate-500">External porter notes</dt>
            <dd className="whitespace-pre-wrap">{transferPlan.external_porter_notes}</dd>
          </div>
        ) : null}
        {transferPlan.internal_porter_notes ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase text-slate-500">Internal porter notes</dt>
            <dd className="whitespace-pre-wrap">{transferPlan.internal_porter_notes}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
