import { forwardRef } from 'react';
import { BILL_CATEGORY_LABELS } from '../billing/PatientBillingReceipt';
import './patientMedicalCard.css';

const COAT_OF_ARMS_SRC =
  '/coat-of-arms-of-namibia-fde79406-29d7-4998-b650-8a01436de59-resize-750-removebg-preview.png';

function formatMoney(value) {
  const amount = parseFloat(value) || 0;
  return `N$ ${amount.toFixed(2)}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatDateTimeCompact(iso) {
  if (!iso) return '—';
  try {
    const date = new Date(iso);
    const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${time}`;
  } catch {
    return '—';
  }
}

function formatLabel(value) {
  if (!value) return '—';
  return String(value).replace(/_/g, ' ');
}

function FieldRow({ label, value, wide }) {
  return (
    <div className={`medical-card-field${wide ? ' medical-card-field--wide' : ''}`}>
      <span className="medical-card-field__label">{label}</span>
      <span className="medical-card-field__value">{value || '—'}</span>
    </div>
  );
}

function VisitSection({ visit, index }) {
  const billing = visit.billing;

  return (
    <section className="medical-card-visit">
      <h2 className="medical-card-visit__title">
        {index + 1}. Visit {visit.visit_number}
      </h2>
      <div className="medical-card-grid medical-card-grid--visit">
        <FieldRow label="Facility" value={visit.facility_name} wide />
        <FieldRow label="Visit type" value={formatLabel(visit.visit_type)} />
        <FieldRow label="Status" value={formatLabel(visit.status)} />
        <FieldRow label="Started" value={formatDateTime(visit.started_at)} />
        <FieldRow label="Completed" value={formatDateTime(visit.completed_at)} />
      </div>

      <h3 className="medical-card-subtitle">Clinical pathway</h3>
      {(visit.stops || []).length ? (
        <table className="medical-card-table medical-card-table--pathway">
          <thead>
            <tr>
              <th>Dept</th>
              <th>Arrived</th>
              <th>Started</th>
              <th>Done</th>
              <th>Attended by</th>
            </tr>
          </thead>
          <tbody>
            {visit.stops.map((stop, stopIndex) => (
              <tr key={`${stop.department}-${stopIndex}`}>
                <td>{stop.department_label || formatLabel(stop.department)}</td>
                <td>{formatDateTimeCompact(stop.arrived_at)}</td>
                <td>{formatDateTimeCompact(stop.started_at)}</td>
                <td>{formatDateTimeCompact(stop.completed_at)}</td>
                <td>{stop.attendees || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="medical-card-muted">No clinical stops recorded for this visit.</p>
      )}

      {(visit.stops || []).map((stop, stopIndex) => {
        const details = stop.clinical_details || [];
        if (!details.length && !stop.notes) return null;
        return (
          <div key={`details-${stop.department}-${stopIndex}`} className="medical-card-clinical-block">
            <h4 className="medical-card-clinical-block__title">
              {stop.department_label || formatLabel(stop.department)} — clinical record
            </h4>
            {stop.notes ? <p className="medical-card-clinical-text">{stop.notes}</p> : null}
            {details.length ? (
              <table className="medical-card-table medical-card-table--nested">
                <tbody>
                  {details.map((row, detailIndex) => (
                    <tr key={`${row.label}-${detailIndex}`}>
                      <th>{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        );
      })}

      <h3 className="medical-card-subtitle">Payment summary</h3>
      {billing ? (
        <>
          <div className="medical-card-grid">
            <FieldRow label="Bill status" value={formatLabel(billing.status)} />
            <FieldRow label="Total paid" value={formatMoney(billing.total_amount)} />
            <FieldRow label="Cash" value={formatMoney(billing.cash_paid)} />
            <FieldRow label="EFT" value={formatMoney(billing.eft_paid)} />
            <FieldRow label="Paid at" value={formatDateTime(billing.paid_at)} />
            <FieldRow label="Received by" value={billing.received_by} />
          </div>
          {(billing.items || []).length ? (
            <table className="medical-card-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount (NAD)</th>
                </tr>
              </thead>
              <tbody>
                {billing.items.map((item, itemIndex) => (
                  <tr key={`${item.description}-${itemIndex}`}>
                    <td>{item.description}</td>
                    <td>{BILL_CATEGORY_LABELS[item.category] || formatLabel(item.category)}</td>
                    <td className="medical-card-table__amount">{formatMoney(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </>
      ) : (
        <p className="medical-card-muted">No bill recorded for this visit (state patient or no charges).</p>
      )}
    </section>
  );
}

export default forwardRef(function PatientMedicalCardDocument({ card }, ref) {
  if (!card) return null;

  const refNo = String(card.patient?.patient_number || card.visits?.[0]?.visit_number || '')
    .replace(/\s/g, '')
    .slice(0, 12)
    .toUpperCase();

  return (
    <article ref={ref} className="medical-card-document" aria-label="Patient medical card">
      <header className="medical-card-header">
        <p className="medical-card-ref">Ref: {refNo || '—'}</p>
        <div className="medical-card-emblem-wrap">
          <img src={COAT_OF_ARMS_SRC} alt="Coat of arms of Namibia" className="medical-card-emblem" />
        </div>
        <p className="medical-card-republic">REPUBLIC OF NAMIBIA</p>
        <p className="medical-card-ministry">MINISTRY OF HEALTH AND SOCIAL SERVICES</p>
        <p className="medical-card-facility">{card.facility?.name}</p>
        {card.facility?.location ? (
          <p className="medical-card-facility-sub">{card.facility.location}</p>
        ) : null}
        <h1 className="medical-card-title">{card.document_title}</h1>
        <p className="medical-card-generated">Generated {card.meta?.generated_label || formatDateTime(card.generated_at)}</p>
      </header>

      <section className="medical-card-notes">
        <p className="medical-card-notes__title">PLEASE NOTE:</p>
        <ol className="medical-card-notes__list">
          <li>This medical card summarises clinical care, staff attendance times, and payment details on file.</li>
          <li>It is issued for patient records and continuity of care — not as a prescription or legal certificate.</li>
          <li>Staff names reflect clinicians and nurses documented in the system for each department visit.</li>
        </ol>
      </section>

      <section className="medical-card-section">
        <h2 className="medical-card-section__title">A. PATIENT PARTICULARS</h2>
        <div className="medical-card-grid">
          <FieldRow label="1. Full name" value={card.patient?.name?.toUpperCase()} wide />
          <FieldRow label="2. Patient number" value={card.patient?.patient_number} />
          <FieldRow label="3. National ID" value={card.patient?.id_number} />
          <FieldRow label="4. Date of birth" value={formatDate(card.patient?.date_of_birth)} />
          <FieldRow label="5. Sex" value={formatLabel(card.patient?.sex)} />
          <FieldRow label="6. Contact" value={card.patient?.phone} />
          <FieldRow label="7. Payer category" value={card.patient?.payment_type === 'private' ? 'Private' : 'State'} />
        </div>
      </section>

      <section className="medical-card-section">
        <h2 className="medical-card-section__title">
          B. {card.scope === 'visit' ? 'CONSULTATION RECORD' : 'MEDICAL HISTORY'}
        </h2>
        {!card.visits?.length ? (
          <p className="medical-card-muted">No visits on file for this scope.</p>
        ) : (
          card.visits.map((visit, index) => (
            <VisitSection key={visit.id} visit={visit} index={index} />
          ))
        )}
      </section>

      <footer className="medical-card-official">
        <p className="medical-card-official__title">FOR OFFICIAL USE</p>
        <p>Document issued electronically by the Health Management System.</p>
        <p>Scope: {card.scope === 'visit' ? 'Single consultation' : 'Full medical history'} · Visits: {card.meta?.visit_count ?? 0}</p>
      </footer>
    </article>
  );
});
