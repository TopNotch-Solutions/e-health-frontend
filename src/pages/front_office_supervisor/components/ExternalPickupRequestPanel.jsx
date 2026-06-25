import { useState } from 'react';
import { createExternalTransportRequest } from '../../../api/transport';
import { EQUIPMENT_MODES } from '../../../constants/admitTransportChecklist';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { fos } from '../styles/frontOfficeSupervisorClasses';

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
];

const INITIAL = {
  origin_facility_name: '',
  origin_address: '',
  external_patient_name: '',
  external_patient_phone: '',
  to_location: 'Emergency Department',
  priority: 'normal',
  equipment_required: 'stretcher',
  equipment_notes: '',
  critical_notes: '',
};

export default function ExternalPickupRequestPanel() {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await createExternalTransportRequest(form);
      setSuccess('Ambulance pickup requested. External porters have been notified.');
      setForm(INITIAL);
    } catch (err) {
      setError(err.message || 'Could not request ambulance pickup');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={fos.sectionPanel} aria-labelledby="external-pickup-heading">
      <h2 id="external-pickup-heading" className={fos.sectionTitle}>
        External ambulance pickup
      </h2>
      <p className={`${c.hint} mt-1`}>
        Request an external porter (ambulance) to collect a patient from a referring clinic or hospital and
        bring them to this state hospital.
      </p>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-3 text-sm text-emerald-700" role="status">
          {success}
        </p>
      ) : null}

      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
            Referring clinic or hospital *
          </span>
          <input
            type="text"
            className={`${c.input} mt-1 w-full`}
            value={form.origin_facility_name}
            onChange={(e) => updateField('origin_facility_name', e.target.value)}
            required
            placeholder="e.g. Katutura Health Centre"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Referring address</span>
          <input
            type="text"
            className={`${c.input} mt-1 w-full`}
            value={form.origin_address}
            onChange={(e) => updateField('origin_address', e.target.value)}
            placeholder="Street or location at referring facility"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Patient name *</span>
          <input
            type="text"
            className={`${c.input} mt-1 w-full`}
            value={form.external_patient_name}
            onChange={(e) => updateField('external_patient_name', e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Patient phone</span>
          <input
            type="tel"
            className={`${c.input} mt-1 w-full`}
            value={form.external_patient_phone}
            onChange={(e) => updateField('external_patient_phone', e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
            Destination at this hospital *
          </span>
          <input
            type="text"
            className={`${c.input} mt-1 w-full`}
            value={form.to_location}
            onChange={(e) => updateField('to_location', e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Priority</span>
          <select
            className={`${c.input} mt-1 w-full`}
            value={form.priority}
            onChange={(e) => updateField('priority', e.target.value)}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Transport mode</span>
          <select
            className={`${c.input} mt-1 w-full`}
            value={form.equipment_required}
            onChange={(e) => updateField('equipment_required', e.target.value)}
          >
            {EQUIPMENT_MODES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Equipment notes</span>
          <textarea
            className={`${c.input} mt-1 w-full`}
            rows={2}
            value={form.equipment_notes}
            onChange={(e) => updateField('equipment_notes', e.target.value)}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-600">Clinical / handover notes</span>
          <textarea
            className={`${c.input} mt-1 w-full`}
            rows={3}
            value={form.critical_notes}
            onChange={(e) => updateField('critical_notes', e.target.value)}
            placeholder="Condition, isolation precautions, oxygen, etc."
          />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className={`${c.btnAction} bg-teal-700 text-white hover:bg-teal-800`}
            disabled={submitting}
          >
            {submitting ? 'Requesting…' : 'Request ambulance pickup'}
          </button>
        </div>
      </form>
    </section>
  );
}
