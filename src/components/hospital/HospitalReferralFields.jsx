import { useEffect, useState } from 'react';
import { IntakeSelect, IntakeTextarea } from '../../pages/nurse/components/IntakeField';
import { nurse as c } from '../../pages/nurse/styles/nurseClasses';
import { getHospitalDepartments } from '../../api/clinicHospitalTransfer';
import { EQUIPMENT_MODES } from '../../constants/hospitalOutpatientDepartments';

export default function HospitalReferralFields({
  visitId,
  sourceRole,
  form,
  onChange,
  fieldErrors = {},
}) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getHospitalDepartments({ visitId, sourceRole })
      .then((rows) => {
        if (!cancelled) setDepartments(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setDepartments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [visitId, sourceRole]);

  function setField(key, value) {
    onChange({ ...form, [key]: value });
  }

  return (
    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
      <p className="text-sm font-semibold text-amber-950">State hospital destination</p>
      <p className="text-xs text-amber-900">
        Patients under 12 are routed to Pediatric Outpatient. Patients 12 and older may go to adult or
        specialty departments. Social worker referrals are limited to Urology and Mental Health.
      </p>

      <IntakeSelect
        id="hr-destination"
        label="Hospital department *"
        className={c.select}
        value={form.destination_department || ''}
        error={fieldErrors.destination_department}
        disabled={loading}
        onChange={(e) => setField('destination_department', e.target.value)}
      >
        <option value="">{loading ? 'Loading departments…' : 'Select department…'}</option>
        {departments.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </IntakeSelect>

      <IntakeSelect
        id="hr-equipment"
        label="Transport equipment"
        className={c.select}
        value={form.equipment_required || 'stretcher'}
        onChange={(e) => setField('equipment_required', e.target.value)}
      >
        {EQUIPMENT_MODES.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </IntakeSelect>

      <IntakeTextarea
        id="hr-critical"
        label="Clinical notes for porters & receiving department"
        className={c.input}
        rows={2}
        value={form.critical_notes || ''}
        onChange={(e) => setField('critical_notes', e.target.value)}
      />

      <IntakeTextarea
        id="hr-external-porter"
        label="External porter (ambulance) notes"
        className={c.input}
        rows={2}
        value={form.external_porter_notes || ''}
        onChange={(e) => setField('external_porter_notes', e.target.value)}
      />

      <IntakeTextarea
        id="hr-internal-porter"
        label="Internal porter notes (within hospital)"
        className={c.input}
        rows={2}
        value={form.internal_porter_notes || ''}
        onChange={(e) => setField('internal_porter_notes', e.target.value)}
      />
    </div>
  );
}
