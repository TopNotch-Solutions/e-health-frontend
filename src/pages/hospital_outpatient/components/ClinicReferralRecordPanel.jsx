import { TRANSFER_STATUS_LABELS, EQUIPMENT_MODES } from '../../../constants/hospitalOutpatientDepartments';
import { nurse as c } from '../../nurse/styles/nurseClasses';

function doctorName(user) {
  if (!user) return '—';
  return [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || '—';
}

function equipmentLabel(value) {
  return EQUIPMENT_MODES.find((m) => m.value === value)?.label || value || '—';
}

function Field({ label, children, span = 1 }) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900 whitespace-pre-wrap">{children || '—'}</dd>
    </div>
  );
}

export default function ClinicReferralRecordPanel({ transfer, clinicConsultation, clinicVitals }) {
  if (!transfer && !clinicConsultation && !clinicVitals) {
    return (
      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Referring consultation</h3>
        <p className={`${c.hint} mt-2`}>No referral record linked to this patient.</p>
      </section>
    );
  }

  return (
    <section className={c.sectionPanel} aria-labelledby="po-referral-heading">
      <h3 id="po-referral-heading" className={c.sectionTitle}>
        Referring clinic consultation
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Clinical record from the consultation that referred this patient to the hospital.
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Transfer status">
          {TRANSFER_STATUS_LABELS[transfer?.transfer_status] || transfer?.transfer_status}
        </Field>
        <Field label="Referring clinic">{transfer?.clinicFacility?.name}</Field>
        <Field label="Transfer reason">{transfer?.transfer_reason || transfer?.referral?.reason}</Field>
        <Field label="Equipment">{equipmentLabel(transfer?.equipment_required)}</Field>
        {transfer?.critical_notes ? (
          <Field label="Critical notes" span={2}>{transfer.critical_notes}</Field>
        ) : null}
        {transfer?.external_porter_notes ? (
          <Field label="External porter notes" span={2}>{transfer.external_porter_notes}</Field>
        ) : null}
      </dl>

      {clinicConsultation ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-bold text-slate-900">Doctor consultation</h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Consulting doctor">{doctorName(clinicConsultation.doctor)}</Field>
            <Field label="Diagnosis">{clinicConsultation.diagnosis}</Field>
            {clinicConsultation.notes ? (
              <Field label="Consultation notes" span={2}>{clinicConsultation.notes}</Field>
            ) : null}
          </dl>
        </div>
      ) : null}

      {clinicVitals ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-bold text-slate-900">Clinic vitals at referral</h4>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {clinicVitals.temperature != null ? (
              <Field label="Temperature">{clinicVitals.temperature}°C</Field>
            ) : null}
            {clinicVitals.pulse_rate != null ? (
              <Field label="Pulse">{clinicVitals.pulse_rate} bpm</Field>
            ) : null}
            {clinicVitals.blood_pressure_systolic != null ? (
              <Field label="Blood pressure">
                {clinicVitals.blood_pressure_systolic}/{clinicVitals.blood_pressure_diastolic} mmHg
              </Field>
            ) : null}
            {clinicVitals.oxygen_saturation != null ? (
              <Field label="SpO₂">{clinicVitals.oxygen_saturation}%</Field>
            ) : null}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
