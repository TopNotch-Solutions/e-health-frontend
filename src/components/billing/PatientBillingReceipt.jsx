import { forwardRef } from 'react';
import './patientBillingReceipt.css';

const COAT_OF_ARMS_SRC =
  '/coat-of-arms-of-namibia-fde79406-29d7-4998-b650-8a01436de59-resize-750-removebg-preview.png';

export const BILL_CATEGORY_LABELS = {
  nursing: 'Admission fee',
  consultation: 'Doctor consultation',
  medication: 'Medication',
  lab: 'Laboratory',
  sonar: 'Ultrasound',
  ward: 'Ward stay',
  clinic_visit: 'Clinic visit fee — all activities',
  department_visit: 'Department visit',
  maternity_front_office: 'Maternity — front office',
  maternity_anw_daily: 'Maternity — ANW daily',
  maternity_pnw_daily: 'Maternity — PNW daily',
  maternity_icu_daily: 'Maternity — ICU daily',
  other: 'Other',
};

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

function FieldRow({ label, value, wide }) {
  return (
    <div className={`billing-receipt-field${wide ? ' billing-receipt-field--wide' : ''}`}>
      <span className="billing-receipt-field__label">{label}</span>
      <span className="billing-receipt-field__value">{value || '—'}</span>
    </div>
  );
}

const PatientBillingReceipt = forwardRef(function PatientBillingReceipt({ receipt }, ref) {
  if (!receipt) return null;

  const refNo = String(receipt.receipt_number || receipt.visit_number || receipt.bill_id || '')
    .replace(/\s/g, '')
    .slice(0, 12)
    .toUpperCase();

  return (
    <article ref={ref} className="billing-receipt-document" aria-label="Patient medical billing receipt">
      <header className="billing-receipt-header">
        <p className="billing-receipt-ref">Ref: {refNo || '—'}</p>
        <div className="billing-receipt-emblem-wrap">
          <img
            src={COAT_OF_ARMS_SRC}
            alt="Coat of arms of Namibia"
            className="billing-receipt-emblem"
          />
        </div>
        <p className="billing-receipt-republic">REPUBLIC OF NAMIBIA</p>
        <p className="billing-receipt-ministry">MINISTRY OF HEALTH AND SOCIAL SERVICES</p>
        <p className="billing-receipt-facility">{receipt.facility?.name}</p>
        {receipt.facility?.location ? (
          <p className="billing-receipt-facility-sub">{receipt.facility.location}</p>
        ) : null}
        <h1 id="billing-receipt-title" className="billing-receipt-title">PATIENT MEDICAL BILLING RECEIPT</h1>
      </header>

      <section className="billing-receipt-notes">
        <p className="billing-receipt-notes__title">PLEASE NOTE:</p>
        <ol className="billing-receipt-notes__list">
          <li>This receipt confirms payment for medical services rendered during the visit stated below.</li>
          <li>Present this receipt when collecting medication, laboratory results, or follow-up services linked to this visit.</li>
          <li>Keep this document for your records. Duplicate copies may be requested at the facility billing office.</li>
          <li>Amounts are quoted in Namibian Dollars (NAD).</li>
        </ol>
      </section>

      <section className="billing-receipt-section">
        <h2 className="billing-receipt-section__title">A. PATIENT PARTICULARS</h2>
        <div className="billing-receipt-grid">
          <FieldRow label="1. Full name (in block letters)" value={receipt.patient?.name?.toUpperCase()} wide />
          <FieldRow label="2. Patient file / hospital number" value={receipt.patient?.patient_number} />
          <FieldRow label="3. Namibian identity number" value={receipt.patient?.id_number} />
          <FieldRow label="4. Contact telephone" value={receipt.patient?.phone} />
          <FieldRow label="5. Payer category" value={receipt.patient?.payment_type === 'private' ? 'Private' : 'State'} />
        </div>
      </section>

      <section className="billing-receipt-section">
        <h2 className="billing-receipt-section__title">B. VISIT DETAILS</h2>
        <div className="billing-receipt-grid">
          <FieldRow label="1. Visit reference number" value={receipt.visit_number} />
          <FieldRow label="2. Date of payment" value={formatDate(receipt.paid_at)} />
          <FieldRow label="3. Time of payment" value={formatDateTime(receipt.paid_at)} wide />
          <FieldRow label="4. Health facility" value={receipt.facility?.name} wide />
        </div>
      </section>

      <section className="billing-receipt-section">
        <h2 className="billing-receipt-section__title">C. MEDICAL SERVICES CHARGED</h2>
        <table className="billing-receipt-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Description of service</th>
              <th>Category</th>
              <th>Amount (NAD)</th>
            </tr>
          </thead>
          <tbody>
            {(receipt.items || []).map((item, index) => (
              <tr key={item.id || `${item.description}-${index}`}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>{BILL_CATEGORY_LABELS[item.category] || item.category}</td>
                <td className="billing-receipt-table__amount">{formatMoney(item.amount)}</td>
              </tr>
            ))}
            <tr className="billing-receipt-table__total-row">
              <td colSpan={3}><strong>Total amount paid</strong></td>
              <td className="billing-receipt-table__amount"><strong>{formatMoney(receipt.total_amount)}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="billing-receipt-section">
        <h2 className="billing-receipt-section__title">D. PAYMENT PARTICULARS</h2>
        <div className="billing-receipt-grid">
          <FieldRow label="1. Cash received (NAD)" value={formatMoney(receipt.cash_paid)} />
          <FieldRow label="2. EFT received (NAD)" value={formatMoney(receipt.eft_paid)} />
          <FieldRow label="3. Total received (NAD)" value={formatMoney(receipt.total_amount)} />
          <FieldRow label="4. Received by (billing clerk)" value={receipt.received_by} />
        </div>
      </section>

      <section className="billing-receipt-section billing-receipt-declaration">
        <h2 className="billing-receipt-section__title">E. DECLARATION</h2>
        <p className="billing-receipt-declaration__text">
          I confirm that the medical services listed above were provided and that payment of the stated
          amount has been received in full for this visit.
        </p>
        <div className="billing-receipt-signatures">
          <div className="billing-receipt-signature">
            <span className="billing-receipt-signature__line" />
            <span>Signature of billing clerk</span>
            <span className="billing-receipt-signature__name">{receipt.received_by || ''}</span>
          </div>
          <div className="billing-receipt-signature">
            <span className="billing-receipt-signature__line" />
            <span>Date</span>
            <span className="billing-receipt-signature__name">{formatDate(receipt.paid_at)}</span>
          </div>
        </div>
      </section>

      <footer className="billing-receipt-official">
        <p className="billing-receipt-official__title">FOR OFFICIAL USE</p>
        <p>Receipt issued electronically by the Health Management System.</p>
        <p>Bill ID: {receipt.bill_id}</p>
      </footer>
    </article>
  );
});

export default PatientBillingReceipt;
