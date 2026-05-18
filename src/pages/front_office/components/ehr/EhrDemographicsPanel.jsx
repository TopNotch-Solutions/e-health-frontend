import { formatDob } from '../../patientUtils';
import { ehr } from '../../styles/ehrClasses';
import { patientAge } from '../../utils/ehrUtils';

function Field({ label, value, muted }) {
  return (
    <div>
      <dt className={ehr.fieldLabel}>{label}</dt>
      <dd className={muted ? ehr.fieldValueMuted : ehr.fieldValue}>{value || '—'}</dd>
    </div>
  );
}

export default function EhrDemographicsPanel({ patient, sticky = false }) {
  const age = patientAge(patient.date_of_birth);
  const panelClass = sticky ? `${ehr.panel} lg:sticky lg:top-4 lg:self-start` : ehr.panel;

  return (
    <section className={panelClass} aria-labelledby="ehr-demographics-title">
      <h2 id="ehr-demographics-title" className={ehr.panelTitle}>
        Demographics
      </h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Sex" value={patient.sex} />
        <Field label="Age" value={age != null ? `${age} years` : null} />
        <Field label="Date of birth" value={formatDob(patient.date_of_birth)} />
        <Field label="National ID" value={patient.id_number} />
        <Field label="Phone" value={patient.phone} />
        <Field label="Payment type" value={patient.payment_type} />
        <Field label="Address" value={patient.address} muted />
        <Field
          label="Emergency contact"
          value={
            patient.emergency_contact_name
              ? `${patient.emergency_contact_name}${
                  patient.emergency_contact_phone ? ` · ${patient.emergency_contact_phone}` : ''
                }`
              : null
          }
          muted
        />
      </dl>
    </section>
  );
}
