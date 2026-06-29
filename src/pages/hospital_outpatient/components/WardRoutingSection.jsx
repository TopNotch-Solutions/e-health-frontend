import { IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { INPATIENT_WARD_TYPES } from '../hospitalOutpatientClinicalConfig';

export default function WardRoutingSection({
  form,
  bedsByWardType,
  vitalsReady,
  vitalsRequiredMessage = 'Enter required vitals',
  isCritical,
  wardTypes = INPATIENT_WARD_TYPES,
  onFieldChange,
  onAdmit,
  admitting,
  idPrefix = 'ho',
}) {
  const wardType = form.selected_ward_type;
  const canAdmit = vitalsReady && wardType && !admitting;

  return (
    <section className={c.sectionPanel} aria-labelledby={`${idPrefix}-routing-heading`}>
      <h3 id={`${idPrefix}-routing-heading`} className={c.sectionTitle}>
        Ward routing
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Choose a ward type — the system assigns the next available bed automatically.
        {isCritical ? ' Critical patients should be routed to ICU when a bed is open.' : ''}
      </p>

      {!vitalsReady ? (
        <p className={`${c.hint} mt-3 text-amber-800`}>{vitalsRequiredMessage} before admitting to a ward.</p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {wardTypes.map((type) => {
          const group = bedsByWardType?.[type.value];
          const count = group?.beds?.length || 0;
          const unavailable = count === 0;
          return (
            <button
              key={type.value}
              type="button"
              disabled={!vitalsReady || unavailable}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                form.selected_ward_type === type.value
                  ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                  : unavailable
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50'
              }`}
              onClick={() => onFieldChange('selected_ward_type', type.value)}
            >
              <span className="block text-sm font-bold text-slate-900">{type.label}</span>
              <span className="mt-1 block text-xs text-slate-600">
                {unavailable ? 'No beds available' : `${count} bed${count === 1 ? '' : 's'} available`}
              </span>
              {isCritical && type.value === 'icu' ? (
                <span className="mt-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-rose-800">
                  Recommended for critical
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {isCritical ? (
        <div className="mt-4">
          <IntakeTextarea
            id={`${idPrefix}-critical-notes`}
            label="Critical care notes"
            className={c.textarea}
            rows={2}
            value={form.critical_notes}
            onChange={(e) => onFieldChange('critical_notes', e.target.value)}
            placeholder="Urgency, monitoring needs, escort instructions…"
          />
        </div>
      ) : null}

      <button
        type="button"
        className={`${c.btnAction} ${c.btnAdmit} mt-4 max-w-md`}
        disabled={!canAdmit}
        onClick={onAdmit}
      >
        {admitting ? 'Admitting patient…' : 'Admit to selected ward'}
      </button>
    </section>
  );
}
